import { NextRequest, NextResponse } from 'next/server';
import { MOCK_PROSECUTOR_SCORES, defaultProsecutorScores } from '../../../../../lib/mockDatabase';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const scores = MOCK_PROSECUTOR_SCORES[id] || defaultProsecutorScores();
    return NextResponse.json(scores);
  } catch (error: any) {
    console.error(`[Prosecutors Scores API] Failed to fetch: ${error.message}`);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
