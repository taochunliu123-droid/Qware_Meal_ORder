'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { MealActivity, Employee } from '@/types';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<'activities' | 'employees'>('activities');
  const [activities, setActivities] = useState<MealActivity[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 新增活動表單
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activityName, setActivityName] = useState('');
  const [activityDate, setActivityDate] = useState('');
  const [meals, setMeals] = useState<string[]>(['']);
  const [drinks, setDrinks] = useState<string[]>(['']);
  
  // 編輯活動
  const [showEditActivityForm, setShowEditActivityForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<MealActivity | null>(null);
  
  // 新增員工表單
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [employeeName, setEmployeeName] = useState('');

  // 檢查登入狀態
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
      setCheckingAuth(false);
    }
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [activeTab, isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'activities') {
        const res = await fetch('/api/activities');
        const data = await res.json();
        if (data.success) {
          setActivities(data.data);
        }
      } else {
        const res = await fetch('/api/employees');
        const data = await res.json();
        if (data.success) {
          setEmployees(data.data);
        }
      }
    } catch (error) {
      console.error('載入資料失敗:', error);
      alert('載入資料失敗');
    }
    setLoading(false);
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validMeals = meals.filter(m => m.trim() !== '');
    const validDrinks = drinks.filter(d => d.trim() !== '');
    
    if (validMeals.length === 0 || validDrinks.length === 0) {
      alert('至少需要一個餐點和一個飲料選項');
      return;
    }
    
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: activityName,
          date: activityDate,
          meals: validMeals,
          drinks: validDrinks,
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert('活動建立成功!');
        setShowActivityForm(false);
        resetActivityForm();
        loadData();
      } else {
        alert(data.error || '建立失敗');
      }
    } catch (error) {
      console.error('建立活動失敗:', error);
      alert('建立活動失敗');
    }
  };

  const resetActivityForm = () => {
    setActivityName('');
    setActivityDate('');
    setMeals(['']);
    setDrinks(['']);
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: employeeName }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert('員工新增成功!');
        setShowEmployeeForm(false);
        setEmployeeName('');
        loadData();
      } else {
        alert(data.error || '新增失敗');
      }
    } catch (error) {
      console.error('新增員工失敗:', error);
      alert('新增員工失敗');
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm('確定要刪除此活動嗎?相關訂單也會一併刪除!')) return;
    
    try {
      const res = await fetch(`/api/activities?id=${id}`, {
        method: 'DELETE',
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert('刪除成功');
        loadData();
      } else {
        alert(data.error || '刪除失敗');
      }
    } catch (error) {
      console.error('刪除活動失敗:', error);
      alert('刪除活動失敗');
    }
  };

  const handleOpenEditActivity = (activity: MealActivity) => {
    setEditingActivity(activity);
    setActivityName(activity.name);
    setActivityDate(activity.date);
    setMeals(activity.meals.map(m => m.name));
    setDrinks(activity.drinks.map(d => d.name));
    setShowEditActivityForm(true);
  };

  const handleUpdateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingActivity) return;
    
    const validMeals = meals.filter(m => m.trim() !== '');
    const validDrinks = drinks.filter(d => d.trim() !== '');
    
    if (validMeals.length === 0 || validDrinks.length === 0) {
      alert('至少需要一個餐點和一個飲料選項');
      return;
    }
    
    try {
      const res = await fetch('/api/activities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingActivity.id,
          name: activityName,
          date: activityDate,
          meals: validMeals,
          drinks: validDrinks,
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert('活動更新成功!');
        setShowEditActivityForm(false);
        setEditingActivity(null);
        resetActivityForm();
        loadData();
      } else {
        alert(data.error || '更新失敗');
      }
    } catch (error) {
      console.error('更新活動失敗:', error);
      alert('更新活動失敗');
    }
  };

  const handleToggleActivityStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    
    try {
      const res = await fetch('/api/activities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        loadData();
      } else {
        alert(data.error || '更新失敗');
      }
    } catch (error) {
      console.error('更新狀態失敗:', error);
      alert('更新狀態失敗');
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('確定要刪除此員工嗎?')) return;
    
    try {
      const res = await fetch(`/api/employees?id=${id}`, {
        method: 'DELETE',
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert('刪除成功');
        loadData();
      } else {
        alert(data.error || '刪除失敗');
      }
    } catch (error) {
      console.error('刪除員工失敗:', error);
      alert('刪除員工失敗');
    }
  };

  const addMealField = () => {
    if (meals.length < 10) setMeals([...meals, '']);
  };

  const addDrinkField = () => {
    if (drinks.length < 10) setDrinks([...drinks, '']);
  };

  const removeMealField = (index: number) => {
    setMeals(meals.filter((_, i) => i !== index));
  };

  const removeDrinkField = (index: number) => {
    setDrinks(drinks.filter((_, i) => i !== index));
  };

  const handleLogout = () => {
    if (confirm('確定要登出嗎?')) {
      localStorage.removeItem('admin_token');
      router.push('/admin/login');
    }
  };

  // 檢查身份驗證中
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-600">驗證中...</div>
        </div>
      </div>
    );
  }

  // 未登入,不顯示任何內容 (會被 redirect 到登入頁)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 頁首 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">管理員後台</h1>
            <p className="text-gray-600 mt-1">管理點餐活動與員工名單</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
            >
              登出
            </button>
            <Link href="/" className="btn-secondary">
              返回首頁
            </Link>
          </div>
        </div>

        {/* 頁籤 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'activities'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            點餐活動
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'employees'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            員工名單
          </button>
        </div>

        {/* 活動管理 */}
        {activeTab === 'activities' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">點餐活動列表</h2>
              <button
                onClick={() => setShowActivityForm(true)}
                className="btn-primary"
              >
                + 建立新活動
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">載入中...</div>
            ) : activities.length === 0 ? (
              <div className="card text-center py-12 text-gray-500">
                尚無活動,點擊上方按鈕建立第一個活動
              </div>
            ) : (
              <div className="grid gap-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="card">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {activity.name}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              activity.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {activity.status === 'active' ? '進行中' : '已結束'}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">日期: {activity.date}</p>
                        <div className="text-sm text-gray-500">
                          <span>餐點: {activity.meals.length} 項</span>
                          <span className="mx-2">|</span>
                          <span>飲料: {activity.drinks.length} 項</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleOpenEditActivity(activity)}
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm"
                        >
                          編輯選項
                        </button>
                        <Link
                          href={`/order?activityId=${activity.id}`}
                          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium text-sm"
                        >
                          點餐頁
                        </Link>
                        <Link
                          href={`/report?activityId=${activity.id}`}
                          className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium text-sm"
                        >
                          查看報表
                        </Link>
                        <button
                          onClick={() => handleToggleActivityStatus(activity.id, activity.status)}
                          className={`px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
                            activity.status === 'active'
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          {activity.status === 'active' ? '結束' : '重啟'}
                        </button>
                        <button
                          onClick={() => handleDeleteActivity(activity.id)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
                        >
                          刪除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 員工管理 */}
        {activeTab === 'employees' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                員工名單 ({employees.length} 人)
              </h2>
              <button
                onClick={() => setShowEmployeeForm(true)}
                className="btn-primary"
              >
                + 新增員工
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">載入中...</div>
            ) : employees.length === 0 ? (
              <div className="card text-center py-12 text-gray-500">
                尚無員工資料
              </div>
            ) : (
              <div className="card">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {employees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium text-gray-900">
                        {employee.name}
                      </span>
                      <button
                        onClick={() => handleDeleteEmployee(employee.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        刪除
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 新增活動彈窗 */}
      {showActivityForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">建立新活動</h2>
            <form onSubmit={handleCreateActivity}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  活動名稱
                </label>
                <input
                  type="text"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  className="input-field"
                  required
                  placeholder="例如: 02/06 聚餐"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  日期
                </label>
                <input
                  type="text"
                  value={activityDate}
                  onChange={(e) => setActivityDate(e.target.value)}
                  className="input-field"
                  required
                  placeholder="例如: 2025-02-06"
                />
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    餐點選項 (最多 10 個)
                  </label>
                  {meals.length < 10 && (
                    <button
                      type="button"
                      onClick={addMealField}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + 新增
                    </button>
                  )}
                </div>
                {meals.map((meal, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={meal}
                      onChange={(e) => {
                        const newMeals = [...meals];
                        newMeals[index] = e.target.value;
                        setMeals(newMeals);
                      }}
                      className="input-field flex-1"
                      placeholder={`餐點 ${index + 1}`}
                    />
                    {meals.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMealField(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        刪除
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    飲料選項 (最多 10 個)
                  </label>
                  {drinks.length < 10 && (
                    <button
                      type="button"
                      onClick={addDrinkField}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + 新增
                    </button>
                  )}
                </div>
                {drinks.map((drink, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={drink}
                      onChange={(e) => {
                        const newDrinks = [...drinks];
                        newDrinks[index] = e.target.value;
                        setDrinks(newDrinks);
                      }}
                      className="input-field flex-1"
                      placeholder={`飲料 ${index + 1}`}
                    />
                    {drinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDrinkField(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        刪除
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">
                  建立活動
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowActivityForm(false);
                    resetActivityForm();
                  }}
                  className="btn-secondary flex-1"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 新增員工彈窗 */}
      {showEmployeeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">新增員工</h2>
            <form onSubmit={handleAddEmployee}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  員工姓名
                </label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="input-field"
                  required
                  placeholder="請輸入姓名"
                />
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">
                  新增
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmployeeForm(false);
                    setEmployeeName('');
                  }}
                  className="btn-secondary flex-1"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 編輯活動彈窗 */}
      {showEditActivityForm && editingActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">編輯活動選項</h2>
            <form onSubmit={handleUpdateActivity}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  活動名稱
                </label>
                <input
                  type="text"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  className="input-field"
                  required
                  placeholder="例如: 02/06 聚餐"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  日期
                </label>
                <input
                  type="text"
                  value={activityDate}
                  onChange={(e) => setActivityDate(e.target.value)}
                  className="input-field"
                  required
                  placeholder="例如: 2025-02-06"
                />
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    餐點選項 (最多 10 個)
                  </label>
                  {meals.length < 10 && (
                    <button
                      type="button"
                      onClick={addMealField}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + 新增餐點
                    </button>
                  )}
                </div>
                {meals.map((meal, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={meal}
                      onChange={(e) => {
                        const newMeals = [...meals];
                        newMeals[index] = e.target.value;
                        setMeals(newMeals);
                      }}
                      className="input-field flex-1"
                      placeholder={`餐點 ${index + 1}`}
                    />
                    {meals.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMealField(index)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      >
                        刪除
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    飲料選項 (最多 10 個)
                  </label>
                  {drinks.length < 10 && (
                    <button
                      type="button"
                      onClick={addDrinkField}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + 新增飲料
                    </button>
                  )}
                </div>
                {drinks.map((drink, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={drink}
                      onChange={(e) => {
                        const newDrinks = [...drinks];
                        newDrinks[index] = e.target.value;
                        setDrinks(newDrinks);
                      }}
                      className="input-field flex-1"
                      placeholder={`飲料 ${index + 1}`}
                    />
                    {drinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDrinkField(index)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      >
                        刪除
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>注意:</strong> 編輯選項不會影響已點的訂單,但會影響新的點餐。
                </p>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">
                  儲存變更
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditActivityForm(false);
                    setEditingActivity(null);
                    resetActivityForm();
                  }}
                  className="btn-secondary flex-1"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
