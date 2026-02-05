import { NextRequest, NextResponse } from 'next/server';
import {
  createOrder,
  getOrdersByActivity,
  updateOrder,
  deleteOrder,
} from '@/lib/db';

// GET: 取得指定活動的所有訂單
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
    
    const orders = await getOrdersByActivity(activityId);
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('取得訂單失敗:', error);
    return NextResponse.json(
      { success: false, error: '取得訂單失敗' },
      { status: 500 }
    );
  }
}

// POST: 建立新訂單
export async function POST(request: NextRequest) {
  try {
    const {
      activityId,
      employeeId,
      employeeName,
      mealId,
      mealName,
      drinkId,
      drinkName,
    } = await request.json();
    
    // 驗證必填欄位
    if (
      !activityId ||
      !employeeId ||
      !employeeName ||
      !mealId ||
      !mealName ||
      !drinkId ||
      !drinkName
    ) {
      return NextResponse.json(
        { success: false, error: '參數不完整' },
        { status: 400 }
      );
    }
    
    // 檢查該員工是否已經點過餐
    const existingOrders = await getOrdersByActivity(activityId);
    const hasOrdered = existingOrders.some(
      (order) => order.employeeId === employeeId
    );
    
    if (hasOrdered) {
      return NextResponse.json(
        { success: false, error: '您已經點過餐了,請使用修改功能' },
        { status: 400 }
      );
    }
    
    const order = await createOrder({
      activityId,
      employeeId,
      employeeName: employeeName.trim(),
      mealId,
      mealName: mealName.trim(),
      drinkId,
      drinkName: drinkName.trim(),
    });
    
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('建立訂單失敗:', error);
    return NextResponse.json(
      { success: false, error: '建立訂單失敗' },
      { status: 500 }
    );
  }
}

// PUT: 修改訂單
export async function PUT(request: NextRequest) {
  try {
    const {
      activityId,
      orderId,
      mealId,
      mealName,
      drinkId,
      drinkName,
    } = await request.json();
    
    if (
      !activityId ||
      !orderId ||
      !mealId ||
      !mealName ||
      !drinkId ||
      !drinkName
    ) {
      return NextResponse.json(
        { success: false, error: '參數不完整' },
        { status: 400 }
      );
    }
    
    const order = await updateOrder(activityId, orderId, {
      mealId,
      mealName: mealName.trim(),
      drinkId,
      drinkName: drinkName.trim(),
    });
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: '訂單不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('修改訂單失敗:', error);
    return NextResponse.json(
      { success: false, error: '修改訂單失敗' },
      { status: 500 }
    );
  }
}

// DELETE: 刪除訂單
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get('activityId');
    const orderId = searchParams.get('orderId');
    
    if (!activityId || !orderId) {
      return NextResponse.json(
        { success: false, error: '參數不完整' },
        { status: 400 }
      );
    }
    
    const success = await deleteOrder(activityId, orderId);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: '訂單不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: '刪除成功' });
  } catch (error) {
    console.error('刪除訂單失敗:', error);
    return NextResponse.json(
      { success: false, error: '刪除訂單失敗' },
      { status: 500 }
    );
  }
}
