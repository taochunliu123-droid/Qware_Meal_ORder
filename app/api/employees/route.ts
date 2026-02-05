import { NextRequest, NextResponse } from 'next/server';
import { getEmployees, addEmployee, updateEmployee, deleteEmployee } from '@/lib/db';

// GET: 取得所有員工
export async function GET() {
  try {
    const employees = await getEmployees();
    return NextResponse.json({ success: true, data: employees });
  } catch (error) {
    console.error('取得員工失敗:', error);
    return NextResponse.json(
      { success: false, error: '取得員工失敗' },
      { status: 500 }
    );
  }
}

// POST: 新增員工
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { success: false, error: '員工姓名不可為空' },
        { status: 400 }
      );
    }
    
    const employee = await addEmployee(name.trim());
    return NextResponse.json({ success: true, data: employee });
  } catch (error) {
    console.error('新增員工失敗:', error);
    return NextResponse.json(
      { success: false, error: '新增員工失敗' },
      { status: 500 }
    );
  }
}

// PUT: 更新員工
export async function PUT(request: NextRequest) {
  try {
    const { id, name } = await request.json();
    
    if (!id || !name || name.trim() === '') {
      return NextResponse.json(
        { success: false, error: '參數不完整' },
        { status: 400 }
      );
    }
    
    const employee = await updateEmployee(id, name.trim());
    
    if (!employee) {
      return NextResponse.json(
        { success: false, error: '員工不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: employee });
  } catch (error) {
    console.error('更新員工失敗:', error);
    return NextResponse.json(
      { success: false, error: '更新員工失敗' },
      { status: 500 }
    );
  }
}

// DELETE: 刪除員工
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少員工 ID' },
        { status: 400 }
      );
    }
    
    const success = await deleteEmployee(id);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: '員工不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: '刪除成功' });
  } catch (error) {
    console.error('刪除員工失敗:', error);
    return NextResponse.json(
      { success: false, error: '刪除員工失敗' },
      { status: 500 }
    );
  }
}
