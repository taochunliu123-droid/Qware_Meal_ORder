import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// 標記為動態路由
export const dynamic = 'force-dynamic';

// POST: 驗證管理員密碼
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    if (!password) {
      return NextResponse.json(
        { success: false, error: '請輸入密碼' },
        { status: 400 }
      );
    }
    
    // 從環境變數取得管理員密碼
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (password === adminPassword) {
      // 生成簡單的 token (實際環境建議使用 JWT)
      const token = crypto.randomBytes(32).toString('hex');
      
      return NextResponse.json({
        success: true,
        token,
        message: '登入成功'
      });
    } else {
      return NextResponse.json(
        { success: false, error: '密碼錯誤' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('登入失敗:', error);
    return NextResponse.json(
      { success: false, error: '登入失敗' },
      { status: 500 }
    );
  }
}
