import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = process.env.BACKEND_API_URL || 'http://localhost:8000/api';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const response = await fetch(`${BACKEND_BASE}/prosecutors/${id}`, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      return NextResponse.json({ error: `Prosecutor not found: ${response.statusText}` }, { status: response.status });
    }
    return NextResponse.json(await response.json());
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Backend unavailable' }, { status: 503 });
  }
}
