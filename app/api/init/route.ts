import { NextResponse } from 'next/server';
import { initializeDefaultEmployees } from '@/lib/db';

export async function POST() {
  try {
    await initializeDefaultEmployees();
    return NextResponse.json({ success: true, message: '員工初始化完成' });
  } catch (error) {
    console.error('初始化失敗:', error);
    return NextResponse.json(
      { success: false, error: '初始化失敗' },
      { status: 500 }
    );
  }
}
