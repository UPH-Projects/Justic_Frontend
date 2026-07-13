import { NextRequest, NextResponse } from 'next/server';
import { MOCK_JUDGE_SCORES, defaultJudgeScores } from '../../../../../lib/mockDatabase';

const BACKEND_BASE = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000/api';

/**
 * GET /api/judges/[id]/scores
 * Returns historical BJI scores and case distribution for a judge.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const response = await fetch(`${BACKEND_BASE}/judges/${id}/scores`, {
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
    console.warn(`[Judges Scores API Proxy]: Backend unavailable, serving scores for ${id} from Mock Database`);
    const scores = MOCK_JUDGE_SCORES[id] || defaultJudgeScores();
    return NextResponse.json(scores);
  }
}
