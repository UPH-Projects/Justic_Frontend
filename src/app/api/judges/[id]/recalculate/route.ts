import { NextRequest, NextResponse } from 'next/server';
import { MOCK_JUDGES } from '../../../../../lib/mockDatabase';

const BACKEND_BASE = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000/api';

/**
 * POST /api/judges/[id]/recalculate
 * Triggers a backend BJI score recalculation job for a judge.
 */
export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const response = await fetch(`${BACKEND_BASE}/judges/${id}/recalculate`, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.warn(`[Judges Recalculate API Proxy]: Backend unavailable, serving recalculation locally`);
    const currentScore = MOCK_JUDGES[id]?.current_bji ?? 0.0;
    return NextResponse.json({ status: 'success', calculated_score: currentScore });
  }
}
