import { NextRequest, NextResponse } from 'next/server';
import { MOCK_PROSECUTORS, defaultProsecutor } from '../../../../lib/mockDatabase';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const prosecutor = MOCK_PROSECUTORS[id] || defaultProsecutor(id);
    return NextResponse.json(prosecutor);
  } catch (error: any) {
    console.error(`[Prosecutors API] Failed to fetch: ${error.message}`);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
