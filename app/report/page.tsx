'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { OrderReport, MealActivity } from '@/types';

function ReportPageContent() {
  const searchParams = useSearchParams();
  const activityId = searchParams.get('activityId');

  const [activities, setActivities] = useState<MealActivity[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState(activityId || '');
  const [report, setReport] = useState<OrderReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    if (selectedActivityId) {
      loadReport(selectedActivityId);
    }
  }, [selectedActivityId]);

  const loadActivities = async () => {
    try {
      const res = await fetch('/api/activities');
      const data = await res.json();
      if (data.success) {
        setActivities(data.data);
        if (!selectedActivityId && data.data.length > 0) {
          setSelectedActivityId(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('載入活動失敗:', error);
    }
    setLoading(false);
  };

  const loadReport = async (actId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/report?activityId=${actId}`);
      const data = await res.json();
      if (data.success) {
        setReport(data.data);
      } else {
        setReport(null);
      }
    } catch (error) {
      console.error('載入報表失敗:', error);
      setReport(null);
    }
    setLoading(false);
  };

  const exportReport = () => {
    if (!report) return;

    let text = `${report.activityName} - 訂餐報表\n`;
    text += `日期: ${report.activityDate}\n`;
    text += `總人數: ${report.totalOrders} 人\n\n`;

    text += `=== 餐點統計 ===\n`;
    Object.entries(report.mealStats).forEach(([mealName, stats]) => {
      text += `${mealName}: ${stats.count} 份\n`;
      text += `  - ${stats.employees.join(', ')}\n\n`;
    });

    text += `\n=== 飲料統計 ===\n`;
    Object.entries(report.drinkStats).forEach(([drinkName, stats]) => {
      text += `${drinkName}: ${stats.count} 杯\n`;
      text += `  - ${stats.employees.join(', ')}\n\n`;
    });

    text += `\n=== 詳細訂單 ===\n`;
    report.orders.forEach((order, index) => {
      text += `${index + 1}. ${order.employeeName}\n`;
      text += `   餐點: ${order.mealName}\n`;
      text += `   飲料: ${order.drinkName}\n`;
      if (order.note) {
        text += `   備註: ${order.note}\n`;
      }
      text += `\n`;
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.activityName}_報表.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && activities.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-600">載入中...</div>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">尚無活動</h2>
          <p className="text-gray-600 mb-6">請先建立點餐活動</p>
          <Link href="/admin" className="btn-primary inline-block">
            前往管理員頁面
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 頁首 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">訂單報表</h1>
            <p className="text-gray-600 mt-1">查看統計與詳細資料</p>
          </div>
          <Link href="/" className="btn-secondary">
            返回首頁
          </Link>
        </div>

        {/* 活動選擇器 */}
        <div className="card mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            選擇活動
          </label>
          <select
            value={selectedActivityId}
            onChange={(e) => setSelectedActivityId(e.target.value)}
            className="input-field max-w-md"
          >
            {activities.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.name} - {activity.date} ({activity.status === 'active' ? '進行中' : '已結束'})
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">載入報表中...</div>
        ) : !report ? (
          <div className="card text-center py-12 text-gray-500">
            無法載入報表資料
          </div>
        ) : report.totalOrders === 0 ? (
          <div className="card text-center py-12 text-gray-500">
            此活動目前還沒有訂單
          </div>
        ) : (
          <>
            {/* 統計摘要 */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="text-3xl font-bold mb-2">{report.totalOrders}</div>
                <div className="text-blue-100">總訂單數</div>
              </div>
              <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                <div className="text-3xl font-bold mb-2">
                  {Object.keys(report.mealStats).length}
                </div>
                <div className="text-green-100">餐點種類</div>
              </div>
              <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <div className="text-3xl font-bold mb-2">
                  {Object.keys(report.drinkStats).length}
                </div>
                <div className="text-purple-100">飲料種類</div>
              </div>
            </div>

            {/* 匯出按鈕 */}
            <div className="flex justify-end mb-6">
              <button onClick={exportReport} className="btn-primary">
                📥 匯出文字報表
              </button>
            </div>

            {/* 餐點統計 */}
            <div className="card mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                🍱 餐點統計
              </h2>
              <div className="space-y-4">
                {Object.entries(report.mealStats)
                  .sort((a, b) => b[1].count - a[1].count)
                  .map(([mealName, stats]) => (
                    <div key={mealName} className="border-l-4 border-green-500 pl-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{mealName}</h3>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold">
                          {stats.count} 份
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {stats.employees.map((name, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* 飲料統計 */}
            <div className="card mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                🥤 飲料統計
              </h2>
              <div className="space-y-4">
                {Object.entries(report.drinkStats)
                  .sort((a, b) => b[1].count - a[1].count)
                  .map(([drinkName, stats]) => (
                    <div key={drinkName} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{drinkName}</h3>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold">
                          {stats.count} 杯
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {stats.employees.map((name, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* 詳細訂單列表 */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                📋 詳細訂單列表
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-bold text-gray-700">#</th>
                      <th className="text-left py-3 px-4 font-bold text-gray-700">姓名</th>
                      <th className="text-left py-3 px-4 font-bold text-gray-700">餐點</th>
                      <th className="text-left py-3 px-4 font-bold text-gray-700">飲料</th>
                      <th className="text-left py-3 px-4 font-bold text-gray-700">備註</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.orders.map((order, index) => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-600">{index + 1}</td>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {order.employeeName}
                        </td>
                        <td className="py-3 px-4 text-gray-700">{order.mealName}</td>
                        <td className="py-3 px-4 text-gray-700">{order.drinkName}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {order.note ? (
                            <span className="text-orange-600">📝 {order.note}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-600">載入中...</div>
        </div>
      </div>
    }>
      <ReportPageContent />
    </Suspense>
  );
}
