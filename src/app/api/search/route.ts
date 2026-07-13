import { NextRequest, NextResponse } from 'next/server';
import { MOCK_SEARCH_ITEMS } from '../../../lib/mockDatabase';
import { searchLive } from '../../../lib/liveCollector';

/**
 * GET /api/search
 * Queries live registries (U.S. Congress, CourtListener) directly from Next.js server context.
 * Falls back to local database records if no queries are matching.
 * Query params: q, type, state
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') || '';
  const state = searchParams.get('state') || '';

  try {
    // 1. If we have a query of sufficient length, try live search
    if (q.trim().length >= 2) {
      const liveResults = await searchLive(q, type || undefined, state || undefined);
      if (liveResults && liveResults.length > 0) {
        return NextResponse.json(liveResults);
      }
    }
  } catch (error: any) {
    console.warn('[Search API] Live search failed, using local fallback:', error.message);
  }

  // 2. Local fallback if query is empty or live call returned no results
  let results = MOCK_SEARCH_ITEMS;
  if (state) {
    results = results.filter(item => item.state.toLowerCase() === state.toLowerCase());
  }
  if (type) {
    results = results.filter(item => item.type === type);
  }
  if (q) {
    const queryLower = q.toLowerCase();
    results = results.filter(item => 
      item.display_name.toLowerCase().includes(queryLower) ||
      item.id.toLowerCase().includes(queryLower)
    );
  }
  return NextResponse.json(results);
}
