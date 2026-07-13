import { NextRequest, NextResponse } from 'next/server';
import { MOCK_PROSECUTOR_SCORES, defaultProsecutorScores } from '../../../../../lib/mockDatabase';

const BACKEND_BASE = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000/api';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const response = await fetch(`${BACKEND_BASE}/prosecutors/${id}/scores`, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return NextResponse.json(await response.json());
  } catch (error: unknown) {
    console.warn(`[Prosecutors Scores API Proxy]: Backend unavailable, serving scores for ${id} from Mock Database`);
    const scores = MOCK_PROSECUTOR_SCORES[id] || defaultProsecutorScores();
    return NextResponse.json(scores);
  }
}
