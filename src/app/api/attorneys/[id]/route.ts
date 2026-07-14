import { NextRequest, NextResponse } from 'next/server';
import { getLiveAttorney } from '../../../../lib/liveCollector';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const data = await getLiveAttorney(id);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`[Attorneys API] Failed to fetch attorney ${id}:`, error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
