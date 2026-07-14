import { NextRequest, NextResponse } from 'next/server';
import { getLiveCase } from '../../../../lib/liveCollector';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const data = await getLiveCase(id);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`[Cases API] Failed to fetch case ${id}:`, error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
