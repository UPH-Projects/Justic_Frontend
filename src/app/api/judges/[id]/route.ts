import { NextRequest, NextResponse } from 'next/server';
import { MOCK_JUDGES, defaultJudge } from '../../../../lib/mockDatabase';
import { getLiveJudge } from '../../../../lib/liveCollector';

/**
 * GET /api/judges/[id]
 * Returns a specific judge's profile by calling getLiveJudge directly.
 * Falls back to mock data if not found.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const liveJudge = await getLiveJudge(id);
    if (liveJudge) {
      return NextResponse.json(liveJudge);
    }
    throw new Error('Judge not found in live registry');
  } catch (error: any) {
    console.warn(`[Judges API] Live fetch failed for ${id}, error: ${error.message}, serving fallback`);
    const judge = MOCK_JUDGES[id] || defaultJudge(id);
    return NextResponse.json(judge);
  }
}
