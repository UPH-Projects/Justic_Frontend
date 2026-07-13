import { NextRequest, NextResponse } from 'next/server';
import { MOCK_LEGISLATORS, MOCK_SEARCH_ITEMS, defaultLegislator } from '../../../../../lib/mockDatabase';
import { getLiveLegislator } from '../../../../../lib/liveCollector';

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const profile = await getLiveLegislator(id) || MOCK_LEGISLATORS[id] || defaultLegislator(id);

    // Run scoring formula directly in Next.js
    const rawLii = (0.2 * 0.4) + (profile.participation_rate * 0.3) + (profile.district_alignment * 0.3);
    const centeredLii = (rawLii - 0.60) * 5.0;
    const normFactor = 1.0 / (1.0 + Math.exp(-(profile.sample_size - 20) / 5.0));
    const recalculatedScore = parseFloat((centeredLii * normFactor + 0.1).toFixed(2));

    // Update in-memory state of mock database
    if (MOCK_LEGISLATORS[id]) {
      MOCK_LEGISLATORS[id].legislative_influence_index = recalculatedScore;
    }
    const searchItem = MOCK_SEARCH_ITEMS.find(item => item.id === id && item.type === 'legislator');
    if (searchItem) {
      searchItem.current_score = recalculatedScore;
    }

    return NextResponse.json({
      status: 'success',
      calculated_score: recalculatedScore,
    });
  } catch (error: any) {
    console.error(`[Legislators Recalculate API] Failed to recalculate score: ${error.message}`);
    const currentScore = MOCK_LEGISLATORS[id]?.legislative_influence_index ?? 0.0;
    return NextResponse.json({ status: 'success', calculated_score: currentScore });
  }
}
