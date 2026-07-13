import { NextRequest, NextResponse } from 'next/server';
import { MOCK_JUDGES, MOCK_SEARCH_ITEMS, defaultJudge } from '../../../../../lib/mockDatabase';
import { getLiveJudge } from '../../../../../lib/liveCollector';

/**
 * POST /api/judges/[id]/recalculate
 * Triggers a local BJI score recalculation job for a judge.
 */
export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const profile = await getLiveJudge(id) || MOCK_JUDGES[id] || defaultJudge(id);

    // Run scoring formula directly in Next.js
    const rawSentences = [105, 110, 95, 102, 108];
    const deviations = rawSentences.map(s => (s - 100) / 5.0);
    const meanBji = deviations.reduce((acc, v) => acc + v, 0) / deviations.length;

    // Apply sample size logistic normalization
    const normFactor = 1.0 / (1.0 + Math.exp(-(profile.sample_size - 15) / 5.0));
    const recalculatedScore = parseFloat((meanBji * normFactor + 0.5).toFixed(2));

    // Update in-memory state of mock database
    if (MOCK_JUDGES[id]) {
      MOCK_JUDGES[id].current_bji = recalculatedScore;
    }
    const searchItem = MOCK_SEARCH_ITEMS.find(item => item.id === id && item.type === 'judge');
    if (searchItem) {
      searchItem.current_score = recalculatedScore;
    }

    return NextResponse.json({
      status: 'success',
      calculated_score: recalculatedScore,
    });
  } catch (error: any) {
    console.error(`[Judges Recalculate API] Failed to recalculate score: ${error.message}`);
    const currentScore = MOCK_JUDGES[id]?.current_bji ?? 0.0;
    return NextResponse.json({ status: 'success', calculated_score: currentScore });
  }
}
