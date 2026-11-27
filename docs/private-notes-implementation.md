# 私人筆記（v1 本機版）架構設計、資料契約、變更說明與 QA 驗收報告

本文件彙整系統架構師、後端／資料工程師、前端工程師與零信任 QA／DevOps 工程師四方規格，完整說明本次 `acu-bot2` 新增「私人筆記」功能的設計決策、實作內容、分段可回退 Git Commit 紀錄與驗收結果。

---

## 一、系統架構師：最小架構與實作規格

### 1. 功能定位與邊界
- **僅限本機私人使用**：每位使用者只能在目前裝置與瀏覽器留下筆記，資料存放於瀏覽器 `localStorage`。
- **不引入新框架與大型套件**：維持既有 `index.html`（React 18 / Babel / Tailwind CDN）單頁 PWA 架構，不引入 router 或富文字重型套件。
- **明確隱私與風險揭露**：
  - 筆記只保存在這台裝置的目前瀏覽器，不會分享、上傳或同步。
  - 清除網站資料、改用其他裝置或瀏覽器可能造成筆記遺失。
  - 請勿記錄可識別病人的個人資料；本機儲存不是加密保險箱。

### 2. 資料模型（Data Model）
每則筆記固定包含以下四個欄位：

| 欄位 | 型別 | 說明 |
| --- | --- | --- |
| `id` | `string` | 唯一識別碼（格式：`note_<timestamp>_<random>`） |
| `content` | `string` | 經白名單清理後的安全內容，**僅允許 `<strong>`、`<u>`、`<br>` 與純文字**，不含任何 HTML 屬性 |
| `createdAt` | `string` | 建立時間（ISO 8601 UTC 字串） |
| `updatedAt` | `string` | 最後更新時間（ISO 8601 UTC 字串） |

### 3. 模組分層設計
- **資料存取與安全清理層**（`lib/notes.js`，UMD 零依賴模組，同時支援瀏覽器 `<script>` 與 Node.js `require`）：
  - `sanitizeNoteHtml`：純字元／標記白名單清理器，移除 `<script>`、`<style>`、`<iframe>`、`<svg>`、`<img>`、`<a>` 等標籤及**所有 HTML 屬性**，僅保留 `<strong>`、`<u>`、`<br>` 與純文字。
  - `parseSafeNoteToAst`：將清理後字串解析為安全 AST，供 React 直接以 `React.createElement` 渲染，**全站零 `dangerouslySetInnerHTML`、零 `.innerHTML`**。
  - `LocalStorageNotesRepository`：實作 `NotesRepository` 介面，封裝所有 `localStorage` 讀寫與例外處理。
- **UI 與導覽層**（`index.html`）：
  - 沿用既有 `currentPage` state 切換視圖，在漢堡選單加入「私人筆記」入口（`currentPage === 'private_notes'`）。
  - 獨立的 `PrivateNotesView` 元件，完全透過 `NotesRepository` 介面操作資料，不直接耦合 `localStorage` 實作細節。
- **PWA 快取層**（`sw.js`）：
  - 快取版本升級至 `acupuncture-tool-v3`，將 `./lib/notes.js` 加入靜態資產清單，App Shell（`index.html`、`lib/notes.js`、`manifest.json`）採 **Network-First（離線回退快取）**，避免使用者卡在舊版介面；**不快取使用者筆記資料**。

### 4. 本版明確不做事項（Non-Goals / 防止 Scope Creep）
- 不建立雲端資料庫（Supabase / Firebase 等）、不新增或修改任何 `api/` endpoint。
- 不實作使用者帳號、登入、Cookie、JWT 或跨裝置同步／分享功能。
- 不支援圖片、超連結、表格、標題字級、顏色、字體等額外富文字格式。
- 不修改既有針灸決策規則（`lib/rules.js`）、脈法計算機、用藥策略或 LINE Bot（`api/line-bot.js`）。

---

## 二、後端／資料工程師：資料契約與未來升級路徑

### 1. `localStorage` Key 與 JSON Schema
- **Key 名稱**：`acu_bot2.private_notes.v1`（含專案前綴、功能名與 schema 版本號，避免與其他工具衝突）。
- **JSON Schema（v1）**：
  ```json
  {
    "version": 1,
    "notes": [
      {
        "id": "note_1732690000000_ab12cd34",
        "content": "<strong>臨床觀察</strong><br><u>重點穴位</u>整理",
        "createdAt": "2026-11-27T07:30:00.000Z",
        "updatedAt": "2026-11-27T07:35:00.000Z"
      }
    ]
  }
  ```
- **排序規則**：一律依 `updatedAt` 由新到舊（降冪）排序；若相同則依 `createdAt` 降冪、再依 `id` 降冪。

### 2. 空資料、資料毀損與錯誤處理契約
- **空資料**：key 不存在或值為空字串時，回傳 `{ ok: true, notes: [], corrupted: false }`。
- **JSON 解析失敗或結構異常（資料毀損保護）**：
  - **絕對不自動清空或覆寫原始資料**。
  - 回傳 `{ ok: false, notes: [], corrupted: true, rawPreserved: true, error: { code: 'CORRUPT_DATA', message: '...' } }`。
  - 在受損狀態下，`create` / `update` / `delete` 皆會拒絕寫入並回傳 `CORRUPT_DATA`，確保原始資料不被覆蓋。
  - 僅在使用者於 UI 完成**二次確認**後，呼叫 `resetCorruptedData({ confirmed: true })` 才會移除該 key 並恢復空白可用狀態。
- **統一錯誤碼契約（`ERROR_CODES`）**：
  - `VALIDATION_EMPTY`：空白或僅含空白字元／換行，拒絕儲存。
  - `STORAGE_UNAVAILABLE`：`localStorage` 不存在或讀取拋錯（如停用儲存空間）。
  - `QUOTA_EXCEEDED`：瀏覽器儲存空間已滿（`QuotaExceededError` / code 22 / 1014）。
  - `WRITE_FAILED`：寫入被拒絕（如隱私模式或權限受限）。
  - `CORRUPT_DATA`：JSON 無法解析或 schema 異常（保留原始資料）。
  - `NOT_FOUND`：更新或刪除目標 ID 不存在。
  - `RESET_NOT_CONFIRMED`：未經明確確認即嘗試重設受損資料。
- **寫入失敗保證**：所有寫入失敗均回傳 `{ ok: false, error }`，前端保留編輯器內正在編輯的內容，且**絕不顯示「已儲存」**。

### 3. 未來升級雲端資料庫的 `NotesRepository` 抽象介面
`LocalStorageNotesRepository` 所有操作均設計為 `async` 方法，定義統一契約：
```ts
interface NotesRepository {
  list(): Promise<Result<{ notes: Note[]; corrupted?: boolean; rawPreserved?: boolean }>>;
  create(input: { content: string }): Promise<Result<{ note: Note; notes: Note[] }>>;
  update(id: string, input: { content: string }): Promise<Result<{ note: Note; notes: Note[] }>>;
  delete(id: string): Promise<Result<{ deletedId: string; notes: Note[] }>>;
  resetCorruptedData(options: { confirmed: boolean }): Promise<Result<{ notes: Note[] }>>;
}
```
未來若要升級為雲端版本，只需新增 `ApiNotesRepository` 實作相同介面並在 `PrivateNotesView` 注入替換，**無需重寫編輯器、列表與確認視窗 UI**。

### 4. PWA 與 Vercel 部署影響與注意事項
- `lib/notes.js` 為純靜態檔案，Vercel 會直接於 `/lib/notes.js` 提供服務，不影響 `api/line-bot.js` Serverless Function。
- 本次未新增或修改任何 `api/` endpoint，也未新增任何環境變數或前端密鑰。
- `sw.js` 升級至 `acupuncture-tool-v3` 並對 App Shell 採用 Network-First，部署上線後舊用戶重新開啟或重整即可取得新版導覽與「私人筆記」功能。

---

## 三、前端工程師：分段可回退 Git Commits 與手動驗證指引

本次開發拆分為 5 個原子化、可獨立回退的 commits：

1. **`feat(notes): 新增私人筆記資料存取層、白名單清理與錯誤處理契約`**（`lib/notes.js`）
   - **改了什麼**：建立 `lib/notes.js`，實作白名單 HTML 清理、AST 解析、編輯器 DOM 安全序列化與 `LocalStorageNotesRepository`。
   - **為什麼**：將安全清理與資料存取與 UI 解耦，確保防 XSS、防受損資料被覆蓋，並保留未來替換雲端儲存層的彈性。
2. **`feat(ui): 漢堡選單新增私人筆記視圖與安全富文字編輯器`**（`index.html`）
   - **改了什麼**：載入 `./lib/notes.js`，新增 `.note-editor`/`.note-content` 可選取文字樣式，於漢堡選單新增「私人筆記」項目與 `PrivateNotesView`（含隱私提醒、受損資料警示與二次確認重設、粗體／底線工具列、貼上清理、防快速連點鎖定、已儲存／錯誤狀態與刪除二次確認）。
   - **為什麼**：在不引入額外套件與不更動既有針灸頁面下，提供手機優先、風格一致且安全的私人筆記體驗。
3. **`chore(pwa): 升級 Service Worker 快取版本與網路優先策略`**（`sw.js`）
   - **改了什麼**：將 `CACHE_NAME` 由 `acupuncture-tool-v2` 升為 `acupuncture-tool-v3`，於 `ASSETS` 加入 `./lib/notes.js`，對導覽與核心程式檔改採 Network-First（離線回退快取），並明確略過非 GET 與 `/api/` 請求。
   - **為什麼**：避免已安裝 PWA 的使用者停留在舊版快取而看不到「私人筆記」入口，同時維持離線可用性且不快取筆記內容。
4. **`test(notes): 新增私人筆記零信任單元與整合驗收測試`**（`tests/private-notes.test.js`）
   - **改了什麼**：新增涵蓋全部 9 項必測情境與受損資料保護的自動化測試腳本。
   - **為什麼**：確保白名單防 XSS、受損資料不覆寫、錯誤契約、PWA 升級與既有功能零回歸皆可重複驗證。
5. **`docs(notes): 新增私人筆記架構設計、資料契約、變更紀錄與 QA 驗收報告`**（`docs/private-notes-implementation.md`）
   - **改了什麼**：附上完整技術與驗收說明文件。

### 手動驗證步驟
1. **基本 CRUD 與格式**：開啟漢堡選單 → 點擊「私人筆記」→ 輸入文字並選取套用「B 粗體」、「U 底線」與換行 → 點擊「儲存筆記」確認出現「已儲存」→ 重新整理頁面確認內容與格式完整保留 → 測試「編輯」與「刪除（先按取消保留，再按確認刪除移除）」。
2. **空白與 XSS 貼上驗證**：嘗試儲存空白或純空格應顯示錯誤提示；貼上 `<script>alert(1)</script><img src=x onerror=alert(1)><b onclick="alert(1)">粗體</b>` 應僅保留純文字與 `<strong>粗體</strong>`，無彈窗或殘留屬性。
3. **受損 JSON 保護與二次確認重設驗證**：
   - 開啟開發者工具 → Application → Local Storage → 將 key `acu_bot2.private_notes.v1` 的值改為 `{invalid-json!!!`。
   - 重新載入頁面並進入「私人筆記」：
     - 確認畫面顯示「偵測到本機筆記資料受損」警示。
     - 檢查 Local Storage 中該 key 的原始值 `{invalid-json!!!` 完全未變。
     - 確認編輯區與儲存按鈕已停用，無法覆寫原始資料。
   - 點擊「重設受損資料」→ 於二次確認視窗點「取消（保留資料）」→ 確認 Local Storage 原始值仍在。
   - 再次點擊「重設受損資料」→ 點「確認刪除並重設」→ 確認受損 key 已移除且恢復正常空白筆記狀態。

---

## 四、零信任 QA／DevOps 工程師：驗收測試與上線判定

### 1. 實際執行指令
```bash
node tests/private-notes.test.js
node test.js
```

### 2. 實際測試輸出摘要
- `node tests/private-notes.test.js`：**13 / 13 通過（失敗 0 項）**
  - ✅ 情境 1a：拒絕空白、空格、換行、NBSP、空格式標籤的新增與編輯
  - ✅ 情境 1b：超長文字（約 18,000 字）、特殊字元（`< > & " '`）、emoji 正確保存與還原
  - ✅ 情境 2：快速連點「儲存」同步鎖（`isSavingRef`）防重複建立
  - ✅ 情境 3：新增、編輯與模擬重整後資料欄位、排序與粗體／底線／換行正確保留
  - ✅ 情境 4：刪除邏輯與 UI 二次確認（取消保留／確認移除）
  - ✅ 情境 5a：`QuotaExceededError`、寫入被拒（`SecurityError`）、`localStorage` 不可用錯誤契約
  - ✅ 情境 5b：JSON 毀損時原始字串 100% 保留、禁止寫入覆寫、重設須二次明確確認
  - ✅ 情境 5c：合法 JSON 但 schema 異常同樣視為受損並保留原始值
  - ✅ 情境 6a：貼上與輸入之 `script`、`img onerror`、`iframe`、`style`、`a`、`svg`、事件屬性徹底清除
  - ✅ 情境 6b：`localStorage` 注入惡意 HTML 讀取清理、AST 僅含白名單節點、`index.html` 零 `dangerouslySetInnerHTML` 與 `.innerHTML`
  - ✅ 情境 7：本機保存、遺失風險、不記病人個資、非加密提醒清楚可見
  - ✅ 情境 8：`sw.js` 升至 `acupuncture-tool-v3`、快取 `lib/notes.js`、App Shell 採 Network-First、不快取 `/api/` 與筆記資料
  - ✅ 情境 9：前端不含任何雲端密鑰或後端設定
- `node test.js`：**既有全套 8 大單元測試 100% 通過**（針灸規則、原絡 24 組情境、蕭醫師 12 組用藥、終始奇經八脈、LINE Bot Webhook 無任何回歸）。

### 3. 缺陷報告
- 本次最終驗收無未解之高／中／低風險缺陷。
- 開發測試過程中曾發現測試腳本的靜態正規檢查誤匹配檔案註解字串（`[風險等級：低]` 靜態測試規則未忽略註解 → 執行 `node tests/private-notes.test.js` 重現 → 已修正測試腳本於比對前先移除註解並重新全數通過）。

### 4. Git Diff 邊界稽核與上線判定
- 已確認 `api/line-bot.js`、`lib/rules.js`、`manifest.json`、`test.js` 均未修改。
- 變更完全限定於 `lib/notes.js`、`index.html`、`sw.js`、`tests/private-notes.test.js`、`docs/private-notes-implementation.md`，且每個 commit 皆可獨立回退。
- **上線判定**：✅ **通過（Approve / Ready to Merge）**。
