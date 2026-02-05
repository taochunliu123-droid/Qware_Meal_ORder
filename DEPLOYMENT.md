# Vercel 部署指南

## 快速部署步驟

### 1. 準備工作

確保你已經:
- ✅ 有 [Vercel](https://vercel.com) 帳號
- ✅ 有 [GitHub](https://github.com) 帳號(建議)
- ✅ 專案程式碼已準備好

### 2. 建立 Vercel KV 資料庫

#### 方法一: 透過 Vercel Dashboard

1. 登入 [Vercel Dashboard](https://vercel.com/dashboard)
2. 點擊 **Storage** 標籤
3. 點擊 **Create Database**
4. 選擇 **KV**
5. 輸入資料庫名稱(例如: `meal-order-db`)
6. 選擇區域(建議選擇離你最近的區域)
7. 點擊 **Create**

#### 方法二: 透過 Vercel CLI

```bash
vercel env add KV_URL
vercel env add KV_REST_API_URL
vercel env add KV_REST_API_TOKEN
vercel env add KV_REST_API_READ_ONLY_TOKEN
```

### 3. 部署專案

#### 選項 A: 使用 Vercel CLI (推薦)

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入 Vercel
vercel login

# 部署到生產環境
vercel --prod
```

在部署過程中:
- 選擇你的專案範圍
- 確認專案設定
- 系統會自動偵測 Next.js 專案

#### 選項 B: 使用 GitHub 整合

1. **將專案推送到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/meal-order-system.git
   git push -u origin main
   ```

2. **在 Vercel 匯入專案**
   - 前往 [Vercel Dashboard](https://vercel.com/new)
   - 點擊 **Import Project**
   - 選擇 **Import Git Repository**
   - 選擇你的 GitHub 儲存庫
   - 點擊 **Import**

3. **設定環境變數**
   - 在專案設定頁面,前往 **Settings** → **Environment Variables**
   - 新增以下變數(從你的 KV Database 取得):
     - `KV_URL`
     - `KV_REST_API_URL`
     - `KV_REST_API_TOKEN`
     - `KV_REST_API_READ_ONLY_TOKEN`

4. **部署**
   - 點擊 **Deploy**
   - 等待建置完成

### 4. 連接 KV Database 到專案

如果你先建立了專案再建立 KV Database:

1. 前往專案的 **Storage** 標籤
2. 點擊 **Connect Store**
3. 選擇你剛建立的 KV Database
4. 點擊 **Connect**
5. Vercel 會自動設定環境變數

### 5. 初始化資料

部署完成後,訪問你的應用:

```
https://your-project.vercel.app
```

1. 前往管理員頁面: `https://your-project.vercel.app/admin`
2. 系統會自動初始化預設員工名單

或手動呼叫初始化 API:

```bash
curl -X POST https://your-project.vercel.app/api/init
```

### 6. 測試部署

1. **測試首頁**: 訪問 `https://your-project.vercel.app`
2. **測試管理員頁面**: 訪問 `https://your-project.vercel.app/admin`
3. **建立測試活動**: 
   - 在管理員頁面建立一個活動
   - 設定餐點和飲料選項
4. **測試點餐**: 
   - 訪問點餐頁面
   - 選擇員工並點餐
5. **測試報表**: 
   - 訪問報表頁面
   - 查看統計資料

## 自動部署設定

### GitHub Actions 自動部署

建立 `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 環境變數管理

### 本地開發

在 `.env.local` 設定:

```
KV_URL="your_kv_url"
KV_REST_API_URL="your_rest_api_url"
KV_REST_API_TOKEN="your_token"
KV_REST_API_READ_ONLY_TOKEN="your_readonly_token"
```

### 生產環境

在 Vercel Dashboard 設定:
1. 前往 **Settings** → **Environment Variables**
2. 為 `Production`, `Preview`, 和 `Development` 分別設定

## 自訂網域

1. 前往專案的 **Settings** → **Domains**
2. 輸入你的網域名稱
3. 按照指示設定 DNS 記錄
4. 等待 DNS 傳播完成

## 監控與除錯

### 查看部署日誌

1. 前往 Vercel Dashboard
2. 選擇你的專案
3. 點擊最新的部署
4. 查看 **Build Logs** 和 **Runtime Logs**

### 查看 KV 資料

1. 前往 **Storage** 標籤
2. 選擇你的 KV Database
3. 使用 **Data Browser** 查看資料

### 常見錯誤

#### 錯誤 1: 無法連接 KV

**原因**: 環境變數設定錯誤

**解決方案**:
1. 檢查環境變數是否正確設定
2. 重新部署專案

#### 錯誤 2: 建置失敗

**原因**: 依賴套件問題

**解決方案**:
```bash
# 清除快取
rm -rf node_modules .next
npm install
npm run build
```

#### 錯誤 3: API 路由 404

**原因**: 路由設定錯誤

**解決方案**:
1. 檢查 `app/api/` 目錄結構
2. 確認 `route.ts` 檔案存在

## 效能優化

### 1. 啟用 Edge Runtime

在 API 路由中加入:

```typescript
export const runtime = 'edge';
```

### 2. 設定快取

```typescript
export const revalidate = 60; // 每 60 秒重新驗證
```

### 3. 圖片優化

使用 Next.js Image 元件:

```typescript
import Image from 'next/image';
```

## 成本估算

### Vercel KV 免費方案限制

- 儲存空間: 256 MB
- 每月請求: 3,000 次
- 資料傳輸: 1 GB

### 建議使用情境

- **小型團隊** (< 50 人): 免費方案足夠
- **中型團隊** (50-200 人): 考慮 Pro 方案 ($20/月)
- **大型團隊** (> 200 人): 考慮 Enterprise 方案

## 安全性建議

1. **不要公開分享管理員頁面連結**
2. **定期備份報表資料**
3. **考慮加入身份驗證** (未來版本)
4. **使用環境變數保護敏感資訊**

## 疑難排解

遇到問題?

1. 查看 [Vercel 文件](https://vercel.com/docs)
2. 查看 [Next.js 文件](https://nextjs.org/docs)
3. 查看 [Vercel KV 文件](https://vercel.com/docs/storage/vercel-kv)
4. 提交 Issue 到專案 GitHub

---

部署完成!享受你的團隊點餐系統 🎉
