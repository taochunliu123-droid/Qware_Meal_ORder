'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { MealActivity, Employee, Order } from '@/types';

export default function OrderPage() {
  const searchParams = useSearchParams();
  const activityId = searchParams.get('activityId');

  const [activity, setActivity] = useState<MealActivity | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedMeal, setSelectedMeal] = useState('');
  const [selectedDrink, setSelectedDrink] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!activityId) {
      setLoading(false);
      return;
    }
    loadData();
  }, [activityId]);

  const loadData = async () => {
    setLoading(true);
    try {
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
    } catch (error) {
      console.error('點餐失敗:', error);
      alert('點餐失敗');
    }
    setSubmitting(false);
  };

  const hasOrdered = (employeeId: string) => {
    return orders.some(order => order.employeeId === employeeId);
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
        <div className="card max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">請選擇活動</h2>
          <p className="text-gray-600 mb-6">請從管理員頁面選擇一個活動進行點餐</p>
          <Link href="/admin" className="btn-primary inline-block">
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
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">請選擇...</option>
                  {employees.map((employee) => (
                    <option
                      key={employee.id}
                      value={employee.id}
                      disabled={hasOrdered(employee.id)}
                    >
                      {employee.name}
                      {hasOrdered(employee.id) ? ' (已點餐)' : ''}
                    </option>
                  ))}
                </select>
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

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? '送出中...' : '確認送出'}
              </button>
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
