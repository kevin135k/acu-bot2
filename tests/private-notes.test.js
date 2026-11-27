'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const Notes = require('../lib/notes.js');

const REPO_ROOT = path.resolve(__dirname, '..');

/**
 * In-memory Storage mock supporting failure injection (QuotaExceededError, SecurityError, etc.)
 */
function createMockStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    _store: store,
    failGet: null,
    failSet: null,
    failRemove: null,
    getItem(key) {
      if (this.failGet) throw this.failGet;
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      if (this.failSet) throw this.failSet;
      store.set(key, String(value));
    },
    removeItem(key) {
      if (this.failRemove) throw this.failRemove;
      store.delete(key);
    },
    clear() {
      store.clear();
    }
  };
}

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`✅ PASS: ${name}`);
  } catch (err) {
    failed++;
    console.error(`❌ FAIL: ${name}`);
    console.error(`   ${err.stack || err.message}`);
  }
}

async function runAll() {
  console.log('====================================================');
  console.log(' 私人筆記零信任 QA 自動化測試套件');
  console.log('====================================================\n');

  // --- 情境 1: 空白、只有空格／換行、超長文字、特殊字元、emoji ---
  await test('情境 1a: 拒絕空白、只有空格、換行、NBSP 與空格式標籤的新增與編輯', async () => {
    const storage = createMockStorage();
    const repo = Notes.createLocalNotesRepository({ storage });

    const blanks = [
      '',
      '   ',
      '\n\n\t  \r\n',
      '&nbsp;&nbsp;',
      '<br><br>',
      '<strong>   </strong><u><br></u>'
    ];

    for (const blank of blanks) {
      const res = await repo.create({ content: blank });
      assert.strictEqual(res.ok, false, `Blank input "${blank}" should fail`);
      assert.strictEqual(res.error.code, Notes.ERROR_CODES.VALIDATION_EMPTY);
    }

    const listRes = await repo.list();
    assert.strictEqual(listRes.ok, true);
    assert.strictEqual(listRes.notes.length, 0);

    // 建立一則有效筆記後，嘗試編輯為空白也應被拒絕且保留原內容
    const created = await repo.create({ content: '有效筆記內容' });
    assert.strictEqual(created.ok, true);
    const editBlank = await repo.update(created.note.id, { content: '  <br>  ' });
    assert.strictEqual(editBlank.ok, false);
    assert.strictEqual(editBlank.error.code, Notes.ERROR_CODES.VALIDATION_EMPTY);

    const afterList = await repo.list();
    assert.strictEqual(afterList.notes[0].content, '有效筆記內容');
  });

  await test('情境 1b: 超長文字、特殊字元、emoji 新增與編輯正確保存', async () => {
    const storage = createMockStorage();
    const repo = Notes.createLocalNotesRepository({ storage });

    const longText = '針灸臨床觀察心得：'.repeat(2000); // ~18,000 chars
    const specialAndEmoji = '🩺 脈象 > 3 盛 & 脈口 < 2 盛 "引號" \'單引號\' 💉🔥\n<strong>重點穴位</strong>：<u>太衝</u>';

    const resLong = await repo.create({ content: longText });
    assert.strictEqual(resLong.ok, true);
    assert.strictEqual(resLong.note.content.length, longText.length);

    const resSpecial = await repo.create({ content: specialAndEmoji });
    assert.strictEqual(resSpecial.ok, true);
    assert.ok(resSpecial.note.content.includes('🩺'));
    assert.ok(resSpecial.note.content.includes('💉🔥'));
    assert.ok(resSpecial.note.content.includes('&gt;'));
    assert.ok(resSpecial.note.content.includes('&lt;'));
    assert.ok(resSpecial.note.content.includes('&amp;'));
    assert.ok(resSpecial.note.content.includes('<strong>重點穴位</strong>'));
    assert.ok(resSpecial.note.content.includes('<u>太衝</u>'));

    // AST 還原應正確解碼回原本的特殊字元與 emoji
    const ast = Notes.parseSafeNoteToAst(resSpecial.note.content);
    const plain = Notes.extractPlainText(resSpecial.note.content);
    assert.ok(plain.includes('🩺 脈象 > 3 盛 & 脈口 < 2 盛'));
    assert.ok(ast.length > 0);
  });

  // --- 情境 2: 快速連點「儲存」防重複 ---
  await test('情境 2: 快速連點「儲存」鎖定機制驗證（不產生重複筆記）', async () => {
    const storage = createMockStorage();
    const repo = Notes.createLocalNotesRepository({ storage });

    // 模擬前端 handleSave 的同步鎖 isSavingRef
    let isSavingRef = false;
    async function guardedSave(content) {
      if (isSavingRef) return { skipped: true };
      isSavingRef = true;
      try {
        return await repo.create({ content });
      } finally {
        isSavingRef = false;
      }
    }

    const [r1, r2, r3] = await Promise.all([
      guardedSave('快速連點測試筆記'),
      guardedSave('快速連點測試筆記'),
      guardedSave('快速連點測試筆記')
    ]);

    assert.strictEqual(r1.ok, true);
    assert.strictEqual(r2.skipped, true);
    assert.strictEqual(r3.skipped, true);

    const listRes = await repo.list();
    assert.strictEqual(listRes.notes.length, 1, '快速連點只能產生一筆筆記');

    // 驗證 index.html 實作確實具備同步 isSavingRef 鎖定
    const indexHtml = fs.readFileSync(path.join(REPO_ROOT, 'index.html'), 'utf8');
    assert.ok(indexHtml.includes('isSavingRef.current'), 'index.html 必須使用同步 ref 防止快速連點儲存');
  });

  // --- 情境 3: 新增、編輯後重新整理仍保留內容與粗體／底線格式 ---
  await test('情境 3: 新增、編輯並模擬重新整理後，資料欄位、排序與粗體／底線／換行正確保留', async () => {
    const storage = createMockStorage();
    let tick = 1000;
    const fakeNow = () => new Date(tick += 1000).toISOString();

    const repoSession1 = Notes.createLocalNotesRepository({ storage, now: fakeNow });
    const c1 = await repoSession1.create({ content: '<strong>第一則</strong><br><u>底線重點</u>' });
    const c2 = await repoSession1.create({ content: '第二則純文字' });
    assert.strictEqual(c1.ok, true);
    assert.strictEqual(c2.ok, true);

    // 驗證必要欄位
    assert.ok(c1.note.id && c1.note.content && c1.note.createdAt && c1.note.updatedAt);

    // 編輯第一則，使其 updatedAt 更新為最新
    const u1 = await repoSession1.update(c1.note.id, {
      content: '<strong>第一則（已編輯）</strong><br><u>新增底線</u>'
    });
    assert.strictEqual(u1.ok, true);
    assert.strictEqual(u1.note.createdAt, c1.note.createdAt, '編輯時 createdAt 不可被改寫');
    assert.notStrictEqual(u1.note.updatedAt, c1.note.updatedAt, '編輯時 updatedAt 應更新');

    // 模擬重新整理：建立全新的 Repository 實例讀取相同 storage
    const repoSession2 = Notes.createLocalNotesRepository({ storage });
    const reloaded = await repoSession2.list();
    assert.strictEqual(reloaded.ok, true);
    assert.strictEqual(reloaded.notes.length, 2);
    // 依 updatedAt 由新到舊排序，已編輯的第一則應排在最前面
    assert.strictEqual(reloaded.notes[0].id, c1.note.id);
    assert.strictEqual(reloaded.notes[0].content, '<strong>第一則（已編輯）</strong><br><u>新增底線</u>');
    assert.strictEqual(reloaded.notes[1].id, c2.note.id);
  });

  // --- 情境 4: 刪除前二次確認；取消保留、確認立即移除 ---
  await test('情境 4: 刪除筆記邏輯與 UI 二次確認機制驗證', async () => {
    const storage = createMockStorage();
    const repo = Notes.createLocalNotesRepository({ storage });

    const c1 = await repo.create({ content: '待刪除筆記' });
    const c2 = await repo.create({ content: '保留筆記' });
    assert.strictEqual(c1.ok, true);
    assert.strictEqual(c2.ok, true);

    const delRes = await repo.delete(c1.note.id);
    assert.strictEqual(delRes.ok, true);
    assert.strictEqual(delRes.notes.length, 1);
    assert.strictEqual(delRes.notes[0].id, c2.note.id);

    // 重複刪除不存在 ID 應回傳 NOT_FOUND
    const delAgain = await repo.delete(c1.note.id);
    assert.strictEqual(delAgain.ok, false);
    assert.strictEqual(delAgain.error.code, Notes.ERROR_CODES.NOT_FOUND);

    // 檢查 index.html 具備刪除二次確認視窗（取消與確認刪除）
    const indexHtml = fs.readFileSync(path.join(REPO_ROOT, 'index.html'), 'utf8');
    assert.ok(indexHtml.includes('確認刪除此則筆記？'), '刪除前必須有二次確認視窗');
    assert.ok(indexHtml.includes('確認刪除'), '必須提供確認刪除按鈕');
    assert.ok(indexHtml.includes('setDeleteTarget(null)'), '取消確認應關閉視窗並保留資料');
  });

  // --- 情境 5: localStorage 容量滿、寫入被拒絕、JSON 毀損（保留原始資料＋二次確認重設） ---
  await test('情境 5a: localStorage 容量滿（QuotaExceededError）與寫入被拒絕錯誤契約', async () => {
    const storage = createMockStorage();
    const repo = Notes.createLocalNotesRepository({ storage });

    const seed = await repo.create({ content: '既有筆記不可受損' });
    assert.strictEqual(seed.ok, true);

    // 模擬容量滿
    const quotaErr = new Error('QuotaExceededError');
    quotaErr.name = 'QuotaExceededError';
    storage.failSet = quotaErr;

    const failQuota = await repo.create({ content: '這則無法寫入' });
    assert.strictEqual(failQuota.ok, false);
    assert.strictEqual(failQuota.error.code, Notes.ERROR_CODES.QUOTA_EXCEEDED);
    assert.ok(failQuota.error.message.includes('已滿'));

    // 模擬隱私模式／拒絕寫入
    const secErr = new Error('Access denied');
    secErr.name = 'SecurityError';
    storage.failSet = secErr;

    const failWrite = await repo.create({ content: '這則也無法寫入' });
    assert.strictEqual(failWrite.ok, false);
    assert.strictEqual(failWrite.error.code, Notes.ERROR_CODES.WRITE_FAILED);

    // 恢復寫入前檢查原有資料完好無損
    storage.failSet = null;
    const after = await repo.list();
    assert.strictEqual(after.ok, true);
    assert.strictEqual(after.notes.length, 1);
    assert.strictEqual(after.notes[0].content, '既有筆記不可受損');

    // 模擬 localStorage 完全不可用
    const unavailableRepo = Notes.createLocalNotesRepository({ storage: null });
    const unavailRes = await unavailableRepo.list();
    assert.strictEqual(unavailRes.ok, false);
    assert.strictEqual(unavailRes.error.code, Notes.ERROR_CODES.STORAGE_UNAVAILABLE);
  });

  await test('情境 5b: JSON 毀損時完全保留原始字串、禁止所有寫入覆寫、重設須明確確認', async () => {
    const rawCorrupt = '{broken-json-payload: 臨床原始資料不可被悄悄清空!!!';
    const storage = createMockStorage({ [Notes.STORAGE_KEY]: rawCorrupt });
    const repo = Notes.createLocalNotesRepository({ storage });

    // 1. 載入時回傳 CORRUPT_DATA，且原始字串完全不變
    const listRes = await repo.list();
    assert.strictEqual(listRes.ok, false);
    assert.strictEqual(listRes.corrupted, true);
    assert.strictEqual(listRes.rawPreserved, true);
    assert.strictEqual(listRes.error.code, Notes.ERROR_CODES.CORRUPT_DATA);
    assert.strictEqual(storage.getItem(Notes.STORAGE_KEY), rawCorrupt, '載入受損資料時不可修改原始值');

    // 2. 未確認前，新增／編輯／刪除皆不可覆寫原始值
    const createRes = await repo.create({ content: '嘗試新增' });
    assert.strictEqual(createRes.ok, false);
    assert.strictEqual(createRes.error.code, Notes.ERROR_CODES.CORRUPT_DATA);
    assert.strictEqual(storage.getItem(Notes.STORAGE_KEY), rawCorrupt, '受損狀態下 create 不可覆寫原始值');

    const updateRes = await repo.update('note_1', { content: '嘗試編輯' });
    assert.strictEqual(updateRes.ok, false);
    assert.strictEqual(updateRes.error.code, Notes.ERROR_CODES.CORRUPT_DATA);
    assert.strictEqual(storage.getItem(Notes.STORAGE_KEY), rawCorrupt, '受損狀態下 update 不可覆寫原始值');

    const deleteRes = await repo.delete('note_1');
    assert.strictEqual(deleteRes.ok, false);
    assert.strictEqual(deleteRes.error.code, Notes.ERROR_CODES.CORRUPT_DATA);
    assert.strictEqual(storage.getItem(Notes.STORAGE_KEY), rawCorrupt, '受損狀態下 delete 不可覆寫原始值');

    // 3. 嘗試重設但未確認（取消確認）-> 仍保留原始資料
    const unconfirmedReset1 = await repo.resetCorruptedData();
    assert.strictEqual(unconfirmedReset1.ok, false);
    assert.strictEqual(unconfirmedReset1.error.code, Notes.ERROR_CODES.RESET_NOT_CONFIRMED);
    assert.strictEqual(storage.getItem(Notes.STORAGE_KEY), rawCorrupt);

    const unconfirmedReset2 = await repo.resetCorruptedData({ confirmed: false });
    assert.strictEqual(unconfirmedReset2.ok, false);
    assert.strictEqual(unconfirmedReset2.error.code, Notes.ERROR_CODES.RESET_NOT_CONFIRMED);
    assert.strictEqual(storage.getItem(Notes.STORAGE_KEY), rawCorrupt);

    // 4. 明確二次確認後才清除受損 key 並恢復正常狀態
    const confirmedReset = await repo.resetCorruptedData({ confirmed: true });
    assert.strictEqual(confirmedReset.ok, true);
    assert.strictEqual(storage.getItem(Notes.STORAGE_KEY), null);

    const listAfterReset = await repo.list();
    assert.strictEqual(listAfterReset.ok, true);
    assert.deepStrictEqual(listAfterReset.notes, []);

    const createAfterReset = await repo.create({ content: '重設後的新筆記' });
    assert.strictEqual(createAfterReset.ok, true);
    assert.strictEqual(createAfterReset.notes.length, 1);
  });

  await test('情境 5c: 合法 JSON 但結構異常也視為受損資料且保留原始值', async () => {
    const badSchemaRaw = JSON.stringify({ version: 1, notes: 'not-an-array' });
    const storage = createMockStorage({ [Notes.STORAGE_KEY]: badSchemaRaw });
    const repo = Notes.createLocalNotesRepository({ storage });

    const res = await repo.list();
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.error.code, Notes.ERROR_CODES.CORRUPT_DATA);
    assert.strictEqual(storage.getItem(Notes.STORAGE_KEY), badSchemaRaw);
  });

  // --- 情境 6: XSS 攻擊向量（貼上與 localStorage 注入）白名單清理 ---
  await test('情境 6a: 白名單清理徹底移除 script、img onerror、iframe、style、a、svg 與所有 HTML 屬性', async () => {
    const payloads = [
      {
        input: '<script>alert("xss")</script><b onclick="alert(1)" style="color:red">安全粗體</b>',
        expected: '<strong>安全粗體</strong>'
      },
      {
        input: '<scr<script>ipt>alert(1)</script>正常文字',
        mustNotContain: ['<script', 'alert(1)']
      },
      {
        input: '<img src=x onerror=alert(1)>前後文字',
        expected: '前後文字'
      },
      {
        input: '<iframe src="javascript:alert(1)">evil</iframe><u>底線</u>',
        expected: '<u>底線</u>'
      },
      {
        input: '<style>body{display:none}</style><a href="javascript:alert(1)" onclick="steal()">連結純文字</a>',
        expected: '連結純文字'
      },
      {
        input: '<svg onload="alert(1)"><script>x()</script></svg><u onmouseover="bad()" class="x">安全</u>',
        expected: '<u>安全</u>'
      },
      {
        input: '<script>unclosed_xss()',
        expected: ''
      }
    ];

    for (const tc of payloads) {
      const sanitized = Notes.sanitizeNoteHtml(tc.input);
      if (tc.expected !== undefined) {
        assert.strictEqual(sanitized, tc.expected, `Failed for payload: ${tc.input}`);
      }
      if (tc.mustNotContain) {
        for (const forbidden of tc.mustNotContain) {
          assert.ok(!sanitized.toLowerCase().includes(forbidden.toLowerCase()), `Output should not contain ${forbidden}: ${sanitized}`);
        }
      }
      // 通用零信任斷言：不得含任何非白名單標籤或 HTML 屬性
      assert.ok(!/<(?!\/?(?:strong|u|br)>)/i.test(sanitized), `Disallowed tag or attribute found in: ${sanitized}`);
      assert.ok(!/on\w+\s*=/i.test(sanitized), `Event handler found in: ${sanitized}`);
      assert.ok(!/javascript:/i.test(sanitized), `javascript: protocol found in: ${sanitized}`);
    }
  });

  await test('情境 6b: 直接注入惡意 HTML 至 localStorage，讀取後必須被清理且 AST 僅含白名單節點', async () => {
    const injectedPayload = JSON.stringify({
      version: 1,
      notes: [
        {
          id: 'note_injected_1',
          content: '<img src=x onerror=alert(1)><script>steal()</script><strong onclick="hack()">重點</strong><br><u style="font-size:99px">底線</u><a href="https://evil.test">連結</a>',
          createdAt: '2026-11-27T00:00:00.000Z',
          updatedAt: '2026-11-27T00:00:00.000Z'
        }
      ]
    });
    const storage = createMockStorage({ [Notes.STORAGE_KEY]: injectedPayload });
    const repo = Notes.createLocalNotesRepository({ storage });

    const res = await repo.list();
    assert.strictEqual(res.ok, true);
    assert.strictEqual(res.notes.length, 1);
    assert.strictEqual(res.notes[0].content, '<strong>重點</strong><br><u>底線</u>連結');

    const ast = Notes.parseSafeNoteToAst(res.notes[0].content);
    const allowedTypes = new Set(['text', 'br', 'strong', 'u']);
    function assertAstSafe(nodes) {
      for (const n of nodes) {
        assert.ok(allowedTypes.has(n.type), `Unexpected AST node type: ${n.type}`);
        if (n.children) assertAstSafe(n.children);
      }
    }
    assertAstSafe(ast);

    // 靜態零信任檢查：index.html 程式碼不可使用 dangerouslySetInnerHTML 或 innerHTML
    const indexHtml = fs.readFileSync(path.join(REPO_ROOT, 'index.html'), 'utf8');
    const indexHtmlNoComments = indexHtml.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
    assert.ok(!indexHtmlNoComments.includes('dangerouslySetInnerHTML'), 'index.html 程式碼不可使用 dangerouslySetInnerHTML');
    assert.ok(!/\.innerHTML\b/.test(indexHtmlNoComments), 'index.html 程式碼不可直接操作 .innerHTML');
  });

  // --- 情境 7: 私人／遺失／個資提醒檢查 ---
  await test('情境 7: 私人筆記頁明確顯示本機保存、遺失風險、不記病人個資與非加密提醒', async () => {
    const indexHtml = fs.readFileSync(path.join(REPO_ROOT, 'index.html'), 'utf8');
    assert.ok(indexHtml.includes('私人筆記'), '漢堡選單與頁面應含「私人筆記」');
    assert.ok(indexHtml.includes('只保存在這台裝置的目前瀏覽器'), '應明確告知僅保存在本機目前瀏覽器');
    assert.ok(indexHtml.includes('清除網站資料、改用其他裝置或瀏覽器'), '應明確告知可能造成筆記遺失');
    assert.ok(indexHtml.includes('請勿記錄可識別病人的個人資料'), '應明確提醒不要記錄可識別病人個資');
    assert.ok(indexHtml.includes('不是加密保險箱'), '應明確提醒本機儲存不是加密保護');
    assert.ok(indexHtml.includes('重設受損資料'), '應提供受損資料重設選項');
    assert.ok(indexHtml.includes('確認清除受損的筆記資料？'), '重設受損資料應有二次確認視窗');
  });

  // --- 情境 8: PWA Service Worker 更新與快取策略驗證 ---
  await test('情境 8: sw.js 快取版本已升級、快取 lib/notes.js、核心頁面採 Network-First 且不快取使用者筆記', async () => {
    const swContent = fs.readFileSync(path.join(REPO_ROOT, 'sw.js'), 'utf8');
    const swCodeOnly = swContent.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
    assert.ok(!swCodeOnly.includes("const CACHE_NAME = 'acupuncture-tool-v2'"), 'CACHE_NAME 必須從 v2 升級');
    assert.ok(swCodeOnly.includes("const CACHE_NAME = 'acupuncture-tool-v3'"), 'CACHE_NAME 應升級至 acupuncture-tool-v3');
    assert.ok(swCodeOnly.includes("'./lib/notes.js'"), 'ASSETS 應包含 ./lib/notes.js');
    assert.ok(swCodeOnly.includes('self.skipWaiting()'), 'install 應呼叫 skipWaiting');
    assert.ok(swCodeOnly.includes('self.clients.claim()'), 'activate 應呼叫 clients.claim');
    assert.ok(swCodeOnly.includes("request.mode === 'navigate'"), 'HTML 導覽應採 Network-First 避免卡在舊快取');
    assert.ok(swCodeOnly.includes("url.pathname.startsWith('/api/')"), '不應攔截或快取 /api/ 請求');
    assert.ok(!swCodeOnly.includes('localStorage'), 'Service Worker 程式碼不可存取或快取 localStorage 筆記資料');
  });

  // --- 情境 9: 邊界與安全性檢查（無雲端密鑰、無未預期後端改動） ---
  await test('情境 9: 驗證前端不含雲端密鑰或 Supabase/Firebase 設定', async () => {
    const notesJs = fs.readFileSync(path.join(REPO_ROOT, 'lib/notes.js'), 'utf8');
    const indexHtml = fs.readFileSync(path.join(REPO_ROOT, 'index.html'), 'utf8');
    for (const forbidden of ['SUPABASE', 'FIREBASE', 'API_KEY', 'BEARER ']) {
      assert.ok(!notesJs.toUpperCase().includes(forbidden), `lib/notes.js 不應包含 ${forbidden}`);
      assert.ok(!indexHtml.toUpperCase().includes(forbidden), `index.html 不應包含 ${forbidden}`);
    }
  });

  console.log('\n====================================================');
  console.log(` 測試總結：通過 ${passed} 項，失敗 ${failed} 項`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAll();
