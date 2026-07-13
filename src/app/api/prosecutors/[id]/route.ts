import { NextRequest, NextResponse } from 'next/server';
import { MOCK_PROSECUTORS, defaultProsecutor } from '../../../../lib/mockDatabase';

const BACKEND_BASE = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000/api';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const response = await fetch(`${BACKEND_BASE}/prosecutors/${id}`, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return NextResponse.json(await response.json());
  } catch (error: unknown) {
    console.warn(`[Prosecutors API Proxy]: Backend unavailable, serving prosecutor ${id} from Mock Database`);
    const prosecutor = MOCK_PROSECUTORS[id] || defaultProsecutor(id);
    return NextResponse.json(prosecutor);
  }
}
