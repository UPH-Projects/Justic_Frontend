import { NextRequest, NextResponse } from 'next/server';
import { MOCK_SEARCH_ITEMS } from '../../../lib/mockDatabase';

const BACKEND_BASE = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000/api';

/**
 * GET /api/search
 * Proxy to backend search endpoint. Falls back to local mock data with 200 OK if backend is unavailable.
 * Query params: q, type, state
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') || '';
  const state = searchParams.get('state') || '';

  try {
    const url = new URL(`${BACKEND_BASE}/search`);
    if (q) url.searchParams.append('q', q);
    if (type) url.searchParams.append('type', type);
    if (state) url.searchParams.append('state', state);

    const response = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('[Search API Proxy]: Backend unavailable, error:', message, 'serving from local Mock Database');
    
    let results = MOCK_SEARCH_ITEMS;
    if (state) {
      results = results.filter(item => item.state.toLowerCase() === state.toLowerCase());
    }
    if (type) {
      results = results.filter(item => item.type === type);
    }
    if (q) {
      const queryLower = q.toLowerCase();
      results = results.filter(item => 
        item.display_name.toLowerCase().includes(queryLower) ||
        item.id.toLowerCase().includes(queryLower)
      );
    }
    return NextResponse.json(results);
  }
}
