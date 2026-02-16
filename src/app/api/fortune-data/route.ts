import { NextRequest, NextResponse } from 'next/server';
import { getFortuneStick } from '@/lib/fortune-data';
import type { FortuneSystem } from '@/lib/fortune-types';
import { SYSTEMS } from '@/lib/systems';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const system = searchParams.get('system') as FortuneSystem | null;
  const numberStr = searchParams.get('number');

  if (!system || !numberStr) {
    return NextResponse.json(
      { error: '請提供 system 和 number 參數' },
      { status: 400 }
    );
  }

  if (!SYSTEMS[system]) {
    return NextResponse.json(
      { error: '無效的籤詩系統' },
      { status: 400 }
    );
  }

  const number = parseInt(numberStr, 10);
  if (isNaN(number) || number < 1 || number > SYSTEMS[system].count) {
    return NextResponse.json(
      { error: `籤號必須在 1 到 ${SYSTEMS[system].count} 之間` },
      { status: 400 }
    );
  }

  const stick = getFortuneStick(system, number);
  if (!stick) {
    return NextResponse.json(
      { error: '找不到該籤詩資料' },
      { status: 404 }
    );
  }

  return NextResponse.json(stick);
}
