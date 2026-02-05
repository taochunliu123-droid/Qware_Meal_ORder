# 管理員密碼設定指南

## 🔐 為什麼需要設定密碼?

保護管理員後台,避免未授權的人員:
- 建立或刪除活動
- 修改員工名單
- 查看訂單資料

## ⚙️ 設定步驟

### 本地開發環境

1. **編輯 `.env.local` 檔案**
   ```bash
   REDIS_URL="redis://..."
   ADMIN_PASSWORD="your_secure_password_here"
   ```

2. **重啟開發伺服器**
   ```bash
   npm run dev
   ```

3. **訪問管理員頁面**
   - 前往 http://localhost:3000/admin
   - 會自動跳轉到登入頁面
   - 輸入你設定的密碼

### 生產環境 (Vercel)

1. **前往 Vercel Dashboard**
   - 選擇你的專案
   - 前往 **Settings** → **Environment Variables**

2. **新增環境變數**
   - 點擊 **Add**
   - Key: `ADMIN_PASSWORD`
   - Value: 你的密碼 (例如: `MySecure123!`)
   - ✅ 勾選 Production, Preview, Development
   - 點擊 **Save**

3. **重新部署**
   - 前往 **Deployments**
   - 點擊最新部署旁的 **...** → **Redeploy**

4. **測試登入**
   - 訪問 https://your-project.vercel.app/admin
   - 輸入你設定的密碼

## 🔑 密碼建議

### ✅ 好的密碼範例
- `MyCompany2024!OrderSystem`
- `AppDev@Meal#2024`
- `Qw3rty!Order$ystem`

### ❌ 不好的密碼範例
- `123456`
- `password`
- `admin`
- `qwerty`

### 密碼要求
- **長度**: 至少 12 個字元
- **複雜度**: 包含大小寫字母、數字、特殊符號
- **唯一性**: 不要使用其他地方的密碼
- **定期更換**: 建議每 3-6 個月更換一次

## 🚨 忘記密碼怎麼辦?

### 本地開發
1. 檢查 `.env.local` 檔案中的 `ADMIN_PASSWORD`
2. 如果忘記,直接修改即可

### 生產環境
1. 前往 Vercel Dashboard
2. Settings → Environment Variables
3. 找到 `ADMIN_PASSWORD`
4. 點擊 **Edit** 修改密碼
5. 重新部署專案

## 📱 使用流程

1. **首次訪問**
   ```
   訪問 /admin → 自動跳轉到 /admin/login
   ```

2. **輸入密碼登入**
   ```
   輸入密碼 → 點擊登入 → 進入管理員後台
   ```

3. **登入狀態**
   ```
   登入後可以直接訪問 /admin
   Token 儲存在瀏覽器 localStorage
   ```

4. **登出**
   ```
   點擊右上角「登出」按鈕
   清除 localStorage 中的 token
   ```

## 🔧 進階設定

### 修改預設密碼

如果沒有設定 `ADMIN_PASSWORD` 環境變數,系統會使用預設密碼 `admin123`

**強烈建議立即修改預設密碼!**

### 多人管理

目前系統只支援單一管理員密碼。如果需要多人管理:

**選項 1: 共享密碼**
- 將密碼分享給授權的管理員
- 定期更換密碼

**選項 2: 未來版本**
- 實作多用戶系統
- 每個管理員有獨立帳號
- 使用 JWT 或 OAuth 認證

## 📊 安全性說明

### 目前實作
- ✅ 密碼儲存在環境變數 (不在程式碼中)
- ✅ 登入後產生 token
- ✅ Token 儲存在 localStorage
- ✅ 每次訪問 /admin 都會驗證 token

### 限制
- ⚠️ Token 沒有過期時間
- ⚠️ 沒有防暴力破解機制
- ⚠️ 沒有登入記錄

### 建議
- 定期更換密碼
- 不要在公共電腦登入
- 使用完畢請登出
- 考慮升級到更安全的認證方式 (JWT, OAuth)

## ❓ 常見問題

**Q: 可以有多個管理員嗎?**
A: 目前只支援單一密碼,可以共享密碼給多位管理員。

**Q: 密碼會過期嗎?**
A: 不會,但建議定期手動更換。

**Q: 登入狀態會保持多久?**
A: 直到手動登出或清除瀏覽器資料。

**Q: 可以強制所有管理員重新登入嗎?**
A: 可以,只要更換 `ADMIN_PASSWORD` 並重新部署即可。

**Q: 密碼安全嗎?**
A: 密碼儲存在環境變數中,不會出現在程式碼或前端。但建議使用強密碼。

---

需要協助?查看 [README.md](README.md) 或 [DEPLOYMENT.md](DEPLOYMENT.md)
