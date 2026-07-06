import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = process.env.BACKEND_API_URL || 'http://localhost:8000/api';

/**
 * GET /api/search
 * Proxy to backend search endpoint. Falls back to 404 if backend unavailable,
 * letting the frontend fall back to its local mock data.
 * Query params: q, type, state
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const type = searchParams.get('type') || '';
    const state = searchParams.get('state') || '';

    const url = new URL(`${BACKEND_BASE}/search`);
    if (q) url.searchParams.append('q', q);
    if (type) url.searchParams.append('type', type);
    if (state) url.searchParams.append('state', state);

    const response = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Backend error: ${errorText || response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Backend unavailable';
    console.warn('[Search API Proxy]:', message);
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
