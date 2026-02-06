'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { MealActivity, Employee, Order } from '@/types';

function OrderPageContent() {
  const searchParams = useSearchParams();
  const activityId = searchParams.get('activityId');

  const [activity, setActivity] = useState<MealActivity | null>(null);
  const [activities, setActivities] = useState<MealActivity[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedMeal, setSelectedMeal] = useState('');
  const [selectedDrink, setSelectedDrink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // 編輯模式
  const [isEditing, setIsEditing] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState('');

  useEffect(() => {
    loadData();
  }, [activityId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 如果沒有 activityId,載入活動列表
      if (!activityId) {
        const actRes = await fetch('/api/activities');
        const actData = await actRes.json();
        if (actData.success) {
          setActivities(actData.data);
        }
        setLoading(false);
        return;
      }

      // 載入活動資訊
      const actRes = await fetch(`/api/activities?id=${activityId}`);
      const actData = await actRes.json();
      if (actData.success) {
        setActivity(actData.data);
      }

      // 載入員工名單
      const empRes = await fetch('/api/employees');
      const empData = await empRes.json();
      if (empData.success) {
        setEmployees(empData.data);
      }

      // 載入已點餐記錄
      const ordRes = await fetch(`/api/orders?activityId=${activityId}`);
      const ordData = await ordRes.json();
      if (ordData.success) {
        setOrders(ordData.data);
      }
    } catch (error) {
      console.error('載入資料失敗:', error);
      alert('載入資料失敗');
    }
    setLoading(false);
  };

  const handleDeleteOrder = async () => {
    if (!confirm('確定要刪除您的訂單嗎?')) return;
    
    if (!editingOrderId || !activityId) return;
    
    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders?activityId=${activityId}&orderId=${editingOrderId}`, {
        method: 'DELETE',
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert('訂單已刪除');
        setSelectedEmployee('');
        setSelectedMeal('');
        setSelectedDrink('');
        setIsEditing(false);
        setEditingOrderId('');
        loadData();
      } else {
        alert(data.error || '刪除失敗');
      }
    } catch (error) {
      console.error('刪除失敗:', error);
      alert('刪除失敗');
    }
    setSubmitting(false);
  };

  const handleCancelEdit = () => {
    setSelectedEmployee('');
    setSelectedMeal('');
    setSelectedDrink('');
    setIsEditing(false);
    setEditingOrderId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEmployee || !selectedMeal || !selectedDrink) {
      alert('請選擇完整的餐點和飲料');
      return;
    }

    const employee = employees.find(emp => emp.id === selectedEmployee);
    const meal = activity?.meals.find(m => m.id === selectedMeal);
    const drink = activity?.drinks.find(d => d.id === selectedDrink);

    if (!employee || !meal || !drink) {
      alert('資料錯誤,請重新選擇');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        // 修改訂單
        const res = await fetch('/api/orders', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activityId,
            orderId: editingOrderId,
            mealId: meal.id,
            mealName: meal.name,
            drinkId: drink.id,
            drinkName: drink.name,
          }),
        });

        const data = await res.json();

        if (data.success) {
          alert('訂單修改成功!');
          setSelectedEmployee('');
          setSelectedMeal('');
          setSelectedDrink('');
          setIsEditing(false);
          setEditingOrderId('');
          loadData();
        } else {
          alert(data.error || '修改失敗');
        }
      } else {
        // 新增訂單
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activityId,
            employeeId: employee.id,
            employeeName: employee.name,
            mealId: meal.id,
            mealName: meal.name,
            drinkId: drink.id,
            drinkName: drink.name,
          }),
        });

        const data = await res.json();

        if (data.success) {
          alert('點餐成功!');
          setSelectedEmployee('');
          setSelectedMeal('');
          setSelectedDrink('');
          loadData();
        } else {
          alert(data.error || '點餐失敗');
        }
      }
    } catch (error) {
      console.error('操作失敗:', error);
      alert('操作失敗');
    }
    setSubmitting(false);
  };

  const hasOrdered = (employeeId: string) => {
    return orders.some(order => order.employeeId === employeeId);
  };

  const getUserOrder = (employeeId: string) => {
    return orders.find(order => order.employeeId === employeeId);
  };

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployee(employeeId);
    
    // 檢查該員工是否已點餐
    const existingOrder = getUserOrder(employeeId);
    if (existingOrder) {
      // 自動填入已點的餐點
      setIsEditing(true);
      setEditingOrderId(existingOrder.id);
      setSelectedMeal(existingOrder.mealId);
      setSelectedDrink(existingOrder.drinkId);
    } else {
      // 清空選擇
      setIsEditing(false);
      setEditingOrderId('');
      setSelectedMeal('');
      setSelectedDrink('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-600">載入中...</div>
        </div>
      </div>
    );
  }

  if (!activityId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">請選擇活動</h2>
          <p className="text-gray-600 mb-6 text-center">請從管理員頁面選擇一個活動進行點餐</p>
          
          {/* 顯示可用活動列表 */}
          {loading ? (
            <div className="text-center py-4 text-gray-500">載入中...</div>
          ) : activities.length === 0 ? (
            <p className="text-center text-gray-500 mb-4">目前沒有可用的活動</p>
          ) : (
            <div className="space-y-3 mb-6">
              {activities
                .filter(act => act.status === 'active')
                .map((activity) => (
                  <Link
                    key={activity.id}
                    href={`/order?activityId=${activity.id}`}
                    className="block p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
                  >
                    <div className="font-bold text-gray-900">{activity.name}</div>
                    <div className="text-sm text-gray-600">日期: {activity.date}</div>
                  </Link>
                ))}
            </div>
          )}
          
          <Link href="/admin" className="btn-secondary w-full text-center">
            前往管理員頁面
          </Link>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">活動不存在</h2>
          <Link href="/admin" className="btn-primary inline-block">
            返回管理員頁面
          </Link>
        </div>
      </div>
    );
  }

  if (activity.status === 'closed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">活動已結束</h2>
          <p className="text-gray-600 mb-6">此活動已經結束,無法再點餐</p>
          <Link href="/admin" className="btn-primary inline-block">
            返回管理員頁面
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 頁首 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{activity.name}</h1>
            <p className="text-gray-600 mt-1">日期: {activity.date}</p>
            <p className="text-sm text-green-600 mt-1">
              已點餐: {orders.length} / {employees.length} 人
            </p>
          </div>
          <Link href="/" className="btn-secondary">
            返回首頁
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 點餐表單 */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">開始點餐</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 選擇員工 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  選擇您的名字 *
                </label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => handleEmployeeChange(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">請選擇...</option>
                  {employees.map((employee) => (
                    <option
                      key={employee.id}
                      value={employee.id}
                    >
                      {employee.name}
                      {hasOrdered(employee.id) ? ' (已點餐 - 可修改)' : ''}
                    </option>
                  ))}
                </select>
                {isEditing && (
                  <p className="mt-2 text-sm text-blue-600">
                    ℹ️ 您已點過餐,可以修改或刪除訂單
                  </p>
                )}
              </div>

              {/* 選擇餐點 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  選擇餐點 *
                </label>
                <div className="grid gap-2">
                  {activity.meals.map((meal) => (
                    <label
                      key={meal.id}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedMeal === meal.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="meal"
                        value={meal.id}
                        checked={selectedMeal === meal.id}
                        onChange={(e) => setSelectedMeal(e.target.value)}
                        className="mr-3 w-5 h-5"
                      />
                      <span className="font-medium text-gray-900">{meal.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 選擇飲料 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  選擇飲料 *
                </label>
                <div className="grid gap-2">
                  {activity.drinks.map((drink) => (
                    <label
                      key={drink.id}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedDrink === drink.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="drink"
                        value={drink.id}
                        checked={selectedDrink === drink.id}
                        onChange={(e) => setSelectedDrink(e.target.value)}
                        className="mr-3 w-5 h-5"
                      />
                      <span className="font-medium text-gray-900">{drink.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 按鈕區域 */}
              {isEditing ? (
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? '更新中...' : '更新訂單'}
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleDeleteOrder}
                      disabled={submitting}
                      className="btn-danger py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      刪除訂單
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="btn-secondary py-2"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? '送出中...' : '確認送出'}
                </button>
              )}
            </form>
          </div>

          {/* 已點餐名單 */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              已點餐名單 ({orders.length} 人)
            </h2>
            {orders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                目前還沒有人點餐
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="font-bold text-gray-900 mb-2">
                      {order.employeeName}
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>🍱 {order.mealName}</div>
                      <div>🥤 {order.drinkName}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-600">載入中...</div>
        </div>
      </div>
    }>
      <OrderPageContent />
    </Suspense>
  );
}
