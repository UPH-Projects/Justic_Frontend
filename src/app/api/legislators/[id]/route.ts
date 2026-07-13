import { NextRequest, NextResponse } from 'next/server';
import { MOCK_LEGISLATORS, defaultLegislator } from '../../../../lib/mockDatabase';
import { getLiveLegislator } from '../../../../lib/liveCollector';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const liveLeg = await getLiveLegislator(id);
    if (liveLeg) {
      return NextResponse.json(liveLeg);
    }
    throw new Error('Legislator not found in live registry');
  } catch (error: any) {
    console.warn(`[Legislators API] Live fetch failed for ${id}, error: ${error.message}, serving fallback`);
    const legislator = MOCK_LEGISLATORS[id] || defaultLegislator(id);
    return NextResponse.json(legislator);
  }
}
