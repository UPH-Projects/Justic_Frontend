import { NextRequest, NextResponse } from 'next/server';
import { MOCK_PROSECUTORS, MOCK_SEARCH_ITEMS } from '../../../../../lib/mockDatabase';

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const proc = MOCK_PROSECUTORS[id];
    if (!proc) {
      throw new Error('Prosecutor not found');
    }

    // Run scoring formula directly in Next.js
    const rawPdi = (proc.charge_reduction_rate * 0.4) + (proc.dismissal_rate * 0.3) + (proc.conviction_rate * 0.3);
    const recalculatedScore = parseFloat((rawPdi * 2.0).toFixed(2));

    // Update in-memory state of mock database
    proc.pdi_aggressiveness = recalculatedScore;
    const searchItem = MOCK_SEARCH_ITEMS.find(item => item.id === id && item.type === 'prosecutor');
    if (searchItem) {
      searchItem.current_score = recalculatedScore;
    }

    return NextResponse.json({
      status: 'success',
      calculated_score: recalculatedScore,
    });
  } catch (error: any) {
    console.error(`[Prosecutors Recalculate API] Failed to recalculate score: ${error.message}`);
    const currentScore = MOCK_PROSECUTORS[id]?.pdi_aggressiveness ?? 0.0;
    return NextResponse.json({ status: 'success', calculated_score: currentScore });
  }
}
