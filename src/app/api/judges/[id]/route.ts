import { NextRequest, NextResponse } from 'next/server';
import { MOCK_JUDGES, defaultJudge } from '../../../../lib/mockDatabase';

const BACKEND_BASE = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000/api';

/**
 * GET /api/judges/[id]
 * Returns a specific judge's profile from backend. Falls back to mock data if backend down.
 */
export async function GET(
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const response = await fetch(`${BACKEND_BASE}/judges/${id}`, {
      headers: { 'Accept': 'application/json' }, 
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.warn(`[Judges API Proxy]: Backend unavailable, serving judge ${id} from Mock Database`);
    const judge = MOCK_JUDGES[id] || defaultJudge(id);
    return NextResponse.json(judge);
  }
}
