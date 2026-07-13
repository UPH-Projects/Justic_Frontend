import { NextRequest, NextResponse } from 'next/server';
import { MOCK_JUDGE_SCORES, defaultJudgeScores } from '../../../../../lib/mockDatabase';
import { getLiveJudgeScores } from '../../../../../lib/liveCollector';

/**
 * GET /api/judges/[id]/scores
 * Returns historical BJI scores and case distribution for a judge.
 * Calls getLiveJudgeScores directly from the Next.js server context.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const liveScores = await getLiveJudgeScores(id);
    if (liveScores) {
      return NextResponse.json(liveScores);
    }
    throw new Error('Scores not found in live registry');
  } catch (error: any) {
    console.warn(`[Judges Scores API] Live fetch failed for ${id}, error: ${error.message}, serving fallback`);
    const scores = MOCK_JUDGE_SCORES[id] || defaultJudgeScores();
    return NextResponse.json(scores);
  }
}
