import { NextRequest, NextResponse } from 'next/server';
import { generateReport } from '@/lib/db';

// 標記為動態路由
export const dynamic = 'force-dynamic';

// GET: 生成指定活動的報表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get('activityId');
    
    if (!activityId) {
      return NextResponse.json(
        { success: false, error: '缺少活動 ID' },
        { status: 400 }
      );
    }
    
    const report = await generateReport(activityId);
    
    if (!report) {
      return NextResponse.json(
        { success: false, error: '活動不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    console.error('生成報表失敗:', error);
    return NextResponse.json(
      { success: false, error: '生成報表失敗' },
      { status: 500 }
    );
  }
}
