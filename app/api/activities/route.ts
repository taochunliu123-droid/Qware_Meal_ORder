import { NextRequest, NextResponse } from 'next/server';
import {
  getActivities,
  getActivity,
  createActivity,
  updateActivityStatus,
  deleteActivity,
} from '@/lib/db';

// 標記為動態路由
export const dynamic = 'force-dynamic';

// GET: 取得所有活動或單一活動
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const activity = await getActivity(id);
      if (!activity) {
        return NextResponse.json(
          { success: false, error: '活動不存在' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: activity });
    }
    
    const activities = await getActivities();
    return NextResponse.json({ success: true, data: activities });
  } catch (error) {
    console.error('取得活動失敗:', error);
    return NextResponse.json(
      { success: false, error: '取得活動失敗' },
      { status: 500 }
    );
  }
}

// POST: 建立新活動
export async function POST(request: NextRequest) {
  try {
    const { name, date, meals, drinks } = await request.json();
    
    // 驗證必填欄位
    if (!name || !date || !meals || !drinks) {
      return NextResponse.json(
        { success: false, error: '參數不完整' },
        { status: 400 }
      );
    }
    
    // 驗證餐點和飲料數量
    if (meals.length === 0 || meals.length > 10) {
      return NextResponse.json(
        { success: false, error: '餐點選項需要 1-10 個' },
        { status: 400 }
      );
    }
    
    if (drinks.length === 0 || drinks.length > 10) {
      return NextResponse.json(
        { success: false, error: '飲料選項需要 1-10 個' },
        { status: 400 }
      );
    }
    
    const activity = await createActivity({
      name: name.trim(),
      date: date.trim(),
      meals: meals.filter((m: string) => m.trim() !== ''),
      drinks: drinks.filter((d: string) => d.trim() !== ''),
    });
    
    return NextResponse.json({ success: true, data: activity });
  } catch (error) {
    console.error('建立活動失敗:', error);
    return NextResponse.json(
      { success: false, error: '建立活動失敗' },
      { status: 500 }
    );
  }
}

// PATCH: 更新活動狀態
export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json();
    
    if (!id || !status || !['active', 'closed'].includes(status)) {
      return NextResponse.json(
        { success: false, error: '參數不正確' },
        { status: 400 }
      );
    }
    
    const activity = await updateActivityStatus(id, status);
    
    if (!activity) {
      return NextResponse.json(
        { success: false, error: '活動不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: activity });
  } catch (error) {
    console.error('更新活動狀態失敗:', error);
    return NextResponse.json(
      { success: false, error: '更新活動狀態失敗' },
      { status: 500 }
    );
  }
}

// DELETE: 刪除活動
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少活動 ID' },
        { status: 400 }
      );
    }
    
    const success = await deleteActivity(id);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: '活動不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: '刪除成功' });
  } catch (error) {
    console.error('刪除活動失敗:', error);
    return NextResponse.json(
      { success: false, error: '刪除活動失敗' },
      { status: 500 }
    );
  }
}
