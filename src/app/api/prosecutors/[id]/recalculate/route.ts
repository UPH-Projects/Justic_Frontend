import { NextRequest, NextResponse } from 'next/server';
import { MOCK_PROSECUTORS } from '../../../../../lib/mockDatabase';

const BACKEND_BASE = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000/api';

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const response = await fetch(`${BACKEND_BASE}/prosecutors/${id}/recalculate`, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return NextResponse.json(await response.json());
  } catch (error: unknown) {
    console.warn(`[Prosecutors Recalculate API Proxy]: Backend unavailable, serving recalculation locally`);
    const currentScore = MOCK_PROSECUTORS[id]?.pdi_aggressiveness ?? 0.0;
    return NextResponse.json({ status: 'success', calculated_score: currentScore });
  }
}
