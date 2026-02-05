# 應用開發部點餐系統

一個簡化團隊點餐流程的 Web 應用,使用 Next.js 和 Vercel KV 構建。

## 功能特色

### 管理員功能
- ✅ 快速建立點餐活動
- ✅ 設定餐點選項(最多 10 個)
- ✅ 設定飲料選項(最多 10 個)
- ✅ 管理員工名單(預設 31 位員工)
- ✅ 控制活動狀態(進行中/已結束)
- ✅ 刪除活動和員工

### 點餐功能
- ✅ 手機友善的點餐介面
- ✅ 即時顯示已點餐人數
- ✅ 防止重複點餐
- ✅ 清楚的餐點和飲料選項

### 報表功能
- ✅ 餐點統計(每項餐點有誰點)
- ✅ 飲料統計(每項飲料有誰點)
- ✅ 詳細訂單列表
- ✅ 一鍵匯出文字報表

## 技術架構

- **前端框架**: Next.js 14 (App Router)
- **樣式**: Tailwind CSS
- **資料庫**: Vercel KV (Redis)
- **部署**: Vercel
- **語言**: TypeScript

## 本地開發

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

複製 `.env.example` 為 `.env.local`:

```bash
cp .env.example .env.local
```

### 3. 設定 Vercel KV

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇你的專案
3. 前往 Storage 頁面
4. 建立新的 KV Database
5. 複製環境變數到 `.env.local`:
   - `KV_URL`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`

### 4. 啟動開發伺服器

```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000) 查看應用。

### 5. 初始化預設員工

首次啟動後,前往 [http://localhost:3000/admin](http://localhost:3000/admin) 頁面,系統會自動初始化 31 位預設員工。

或手動呼叫 API:

```bash
curl -X POST http://localhost:3000/api/init
```

## 部署到 Vercel

### 方法一: 使用 Vercel CLI

```bash
npm i -g vercel
vercel
```

### 方法二: 使用 GitHub 整合

1. 將專案推送到 GitHub
2. 在 Vercel Dashboard 匯入專案
3. 設定環境變數(從 Storage 頁面取得)
4. 部署

## 使用流程

### 管理員操作

1. **建立活動**
   - 進入管理員頁面
   - 點擊「建立新活動」
   - 輸入活動名稱、日期
   - 設定餐點和飲料選項
   - 建立後會產生點餐連結

2. **分享連結**
   - 複製點餐連結
   - 分享給團隊成員(LINE、Slack 等)

3. **查看報表**
   - 隨時查看即時統計
   - 匯出文字報表給餐廳

### 員工操作

1. **點餐**
   - 點擊連結開啟點餐頁
   - 選擇自己的名字
   - 選擇餐點和飲料
   - 送出訂單

2. **查看已點餐名單**
   - 即時查看誰已經點餐

## 資料結構

### Vercel KV 儲存結構

```
employees: Employee[]           # 員工列表
activities: MealActivity[]      # 活動列表
orders:{activityId}: Order[]    # 各活動的訂單
```

### 資料型別

```typescript
Employee {
  id: string
  name: string
  createdAt: string
}

MealActivity {
  id: string
  name: string
  date: string
  status: 'active' | 'closed'
  meals: MealOption[]
  drinks: DrinkOption[]
  createdAt: string
  updatedAt: string
}

Order {
  id: string
  activityId: string
  employeeId: string
  employeeName: string
  mealId: string
  mealName: string
  drinkId: string
  drinkName: string
  createdAt: string
}
```

## API 路由

| 路由 | 方法 | 說明 |
|------|------|------|
| `/api/init` | POST | 初始化預設員工 |
| `/api/employees` | GET | 取得員工列表 |
| `/api/employees` | POST | 新增員工 |
| `/api/employees` | PUT | 更新員工 |
| `/api/employees` | DELETE | 刪除員工 |
| `/api/activities` | GET | 取得活動列表 |
| `/api/activities` | POST | 建立活動 |
| `/api/activities` | PATCH | 更新活動狀態 |
| `/api/activities` | DELETE | 刪除活動 |
| `/api/orders` | GET | 取得訂單 |
| `/api/orders` | POST | 建立訂單 |
| `/api/orders` | PUT | 更新訂單 |
| `/api/orders` | DELETE | 刪除訂單 |
| `/api/report` | GET | 生成報表 |

## 預設員工名單

系統預設包含以下 31 位員工:

高念平, 游國楷, 謝楷評, 陳春惠, 薛仁奇, 劉道鈞, 李佳馨, 吳文凱, 吳柔潔, 楊仲文, 蔡恩傑, 陳利和, 吳政憲, 黃明正, 蕭智鴻, 陳俊良, 陳詩恬, 彭俊濠, 廖崇智, 林怡君, 謝正軒, 張宏偉, 張家菁, 鄒易恆, 黃陸堃, 黃晏瑜, 林家銘, 李聿芸, 黃士哲, 李國源, 謝昀達

## 注意事項

### Vercel KV 限制

- 免費方案: 256 MB 儲存空間
- 每月 3000 次請求
- 如果超過限制,請升級方案

### 資料備份

建議定期匯出報表備份,Vercel KV 資料可能因為以下原因遺失:
- 超過儲存限制
- 手動刪除
- 方案到期

### 安全性

目前版本沒有身份驗證,建議:
- 不要分享管理員頁面連結
- 點餐連結只分享給內部人員
- 活動結束後關閉狀態

## 未來改進

- [ ] 加入身份驗證(Google OAuth)
- [ ] 支援圖片上傳(餐點照片)
- [ ] 訂單修改功能
- [ ] 即時通知(Telegram Bot)
- [ ] 多語言支援
- [ ] PWA 支援(離線使用)
- [ ] 匯出 Excel 報表

## 授權

MIT License

---

如有問題或建議,歡迎提出 Issue!
