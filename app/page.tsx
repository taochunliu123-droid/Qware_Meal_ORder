import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            應用開發部點餐系統
          </h1>
          <p className="text-xl text-gray-600">
            簡化點餐流程,提升效率
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* 管理員入口 */}
          <Link href="/admin" className="group">
            <div className="card hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">管理員</h2>
                <p className="text-gray-600 mb-4">
                  建立點餐活動、管理員工名單
                </p>
                <span className="text-blue-600 font-medium group-hover:underline">
                  進入管理 →
                </span>
              </div>
            </div>
          </Link>

          {/* 點餐入口 */}
          <Link href="/order" className="group">
            <div className="card hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">我要點餐</h2>
                <p className="text-gray-600 mb-4">
                  選擇餐點和飲料
                </p>
                <span className="text-green-600 font-medium group-hover:underline">
                  開始點餐 →
                </span>
              </div>
            </div>
          </Link>

          {/* 報表入口 */}
          <Link href="/report" className="group">
            <div className="card hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">查看報表</h2>
                <p className="text-gray-600 mb-4">
                  訂單統計與分析
                </p>
                <span className="text-purple-600 font-medium group-hover:underline">
                  查看報表 →
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
