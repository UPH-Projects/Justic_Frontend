import { NextRequest, NextResponse } from 'next/server';
import { getLiveCourt } from '../../../../lib/liveCollector';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const data = await getLiveCourt(id);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`[Courts API] Failed to fetch court ${id}:`, error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
