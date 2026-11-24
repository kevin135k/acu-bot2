const assert = require('assert');
const { POINT_LOCATIONS, POINT_NAMES_REGEX, TANGYE_RULES, ZHONGSHI_RULES, YUANLUO_RULES } = require('./lib/rules.js');

console.log('--- 測試 1: 規則載入完整性 ---');
assert.ok(POINT_LOCATIONS, 'POINT_LOCATIONS should be defined');
assert.ok(POINT_NAMES_REGEX, 'POINT_NAMES_REGEX should be defined');
assert.ok(TANGYE_RULES, 'TANGYE_RULES should be defined');
assert.ok(ZHONGSHI_RULES, 'ZHONGSHI_RULES should be defined');
assert.ok(YUANLUO_RULES, 'YUANLUO_RULES should be defined');
console.log('✅ 規則載入正常');

console.log('\n--- 測試 2: 原絡針法左右手腳選擇邏輯驗證 ---');
// 穴位屬性表
// 經脈定義:
// 心火: 腕骨(陽經,手), 通里(陰經,手), 神門(陰經,手), 支正(陽經,手)
// 肝木: 丘墟(陽經,腳), 蠡溝(陰經,腳), 太衝(陰經,腳), 光明(陽經,腳)
// 腎水: 京骨(陽經,腳), 大鍾(陰經,腳), 太溪(陰經,腳), 飛揚(陽經,腳)
// 肺金: 合谷(陽經,手), 列缺(陰經,手), 太淵(陰經,手), 偏歷(陽經,手)
// 脾土: 衝陽(陽經,腳), 公孫(陰經,腳), 太白(陰經,腳), 豐隆(陽經,腳)
// 命門: 陽池(陽經,手), 內關(陰經,手), 大陵(陰經,手), 外關(陽經,手)

const expected = {
  male: {
    '心火': {
      '太過': { tonify: { point: '腕骨', side: 'right' }, sedate: { point: '通里', side: 'left' } },
      '不足': { tonify: { point: '神門', side: 'left' }, sedate: { point: '支正', side: 'right' } }
    },
    '肝木': {
      '太過': { tonify: { point: '丘墟', side: 'left' }, sedate: { point: '蠡溝', side: 'right' } },
      '不足': { tonify: { point: '太衝', side: 'right' }, sedate: { point: '光明', side: 'left' } }
    },
    '腎水': {
      '太過': { tonify: { point: '京骨', side: 'left' }, sedate: { point: '大鍾', side: 'right' } },
      '不足': { tonify: { point: '太溪', side: 'right' }, sedate: { point: '飛揚', side: 'left' } }
    },
    '肺金': {
      '太過': { tonify: { point: '合谷', side: 'right' }, sedate: { point: '列缺', side: 'left' } },
      '不足': { tonify: { point: '太淵', side: 'left' }, sedate: { point: '偏歷', side: 'right' } }
    },
    '脾土': {
      '太過': { tonify: { point: '衝陽', side: 'left' }, sedate: { point: '公孫', side: 'right' } },
      '不足': { tonify: { point: '太白', side: 'right' }, sedate: { point: '豐隆', side: 'left' } }
    },
    '命門': {
      '太過': { tonify: { point: '陽池', side: 'right' }, sedate: { point: '內關', side: 'left' } },
      '不足': { tonify: { point: '大陵', side: 'left' }, sedate: { point: '外關', side: 'right' } }
    }
  },
  female: {
    '心火': {
      '太過': { tonify: { point: '腕骨', side: 'left' }, sedate: { point: '通里', side: 'right' } },
      '不足': { tonify: { point: '神門', side: 'right' }, sedate: { point: '支正', side: 'left' } }
    },
    '肝木': {
      '太過': { tonify: { point: '丘墟', side: 'right' }, sedate: { point: '蠡溝', side: 'left' } },
      '不足': { tonify: { point: '太衝', side: 'left' }, sedate: { point: '光明', side: 'right' } }
    },
    '腎水': {
      '太過': { tonify: { point: '京骨', side: 'right' }, sedate: { point: '大鍾', side: 'left' } },
      '不足': { tonify: { point: '太溪', side: 'left' }, sedate: { point: '飛揚', side: 'right' } }
    },
    '肺金': {
      '太過': { tonify: { point: '合谷', side: 'left' }, sedate: { point: '列缺', side: 'right' } },
      '不足': { tonify: { point: '太淵', side: 'right' }, sedate: { point: '偏歷', side: 'left' } }
    },
    '脾土': {
      '太過': { tonify: { point: '衝陽', side: 'right' }, sedate: { point: '公孫', side: 'left' } },
      '不足': { tonify: { point: '太白', side: 'left' }, sedate: { point: '豐隆', side: 'right' } }
    },
    '命門': {
      '太過': { tonify: { point: '陽池', side: 'left' }, sedate: { point: '內關', side: 'right' } },
      '不足': { tonify: { point: '大陵', side: 'right' }, sedate: { point: '外關', side: 'left' } }
    }
  }
};

for (const gender of ['male', 'female']) {
  for (const organ of Object.keys(expected[gender])) {
    for (const state of ['太過', '不足']) {
      const exp = expected[gender][organ][state];
      const actual = YUANLUO_RULES[gender][organ][state];
      assert.ok(actual, `Missing rule for ${gender} ${organ} ${state}`);
      
      // 驗證 tonify / sedate
      assert.strictEqual(actual.tonify.point, exp.tonify.point, `tonify.point mismatch for ${gender} ${organ} ${state}`);
      assert.strictEqual(actual.tonify.side, exp.tonify.side, `tonify.side mismatch for ${gender} ${organ} ${state}`);
      assert.strictEqual(actual.sedate.point, exp.sedate.point, `sedate.point mismatch for ${gender} ${organ} ${state}`);
      assert.strictEqual(actual.sedate.side, exp.sedate.side, `sedate.side mismatch for ${gender} ${organ} ${state}`);

      // 驗證 pt1 / pt2 相容性
      assert.strictEqual(actual.pt1.point, exp.tonify.point, `pt1.point mismatch for ${gender} ${organ} ${state}`);
      assert.strictEqual(actual.pt1.side, exp.tonify.side, `pt1.side mismatch for ${gender} ${organ} ${state}`);
      assert.strictEqual(actual.pt2.point, exp.sedate.point, `pt2.point mismatch for ${gender} ${organ} ${state}`);
      assert.strictEqual(actual.pt2.side, exp.sedate.side, `pt2.side mismatch for ${gender} ${organ} ${state}`);
    }
  }
}
console.log('✅ 原絡針法男女陰陽手腳全部 24 組情境驗證通過！');

console.log('\n--- 測試 3: index.html 規則同步驗證 ---');
const fs = require('fs');
const indexHtml = fs.readFileSync('./index.html', 'utf8');

// 驗證 164 行錯別字修復
assert.ok(indexHtml.includes('淺刺15度、陽數、順轉'), 'index.html 應包含正確的太白穴描述');
assert.ok(!indexHtml.includes('吸氣進針、數、順轉'), 'index.html 不應再有「數、順轉」漏字錯誤');

// 驗證原絡規則更新到 index.html
assert.ok(indexHtml.includes("'太過': { tonify: { point: '丘墟', side: 'left'"), 'index.html 應包含男肝木太過丘墟在左');
assert.ok(indexHtml.includes("'太過': { tonify: { point: '丘墟', side: 'right'"), 'index.html 應包含女肝木太過丘墟在右');
console.log('✅ index.html 規則同步驗證通過！');

console.log('\n--- 測試 4: Service Worker 資源快取驗證 ---');
const swContent = fs.readFileSync('./sw.js', 'utf8');
assert.ok(swContent.includes('cdnjs.cloudflare.com/ajax/libs/react'), 'sw.js 應快取實際引用的 React CDN');
assert.ok(swContent.includes('hand1.jpg') && swContent.includes('foot1.jpg'), 'sw.js 應快取圖片資源');
console.log('✅ Service Worker 資源快取驗證通過！');

console.log('\n🎉 全部測試順利通過！');

console.log('\n--- 測試 5: LINE Bot Webhook 模擬測試 ---');
async function testLineBot() {
  const handler = (await import('./api/line-bot.js')).default;
  let replied = null;
  global.fetch = async (url, options) => {
    replied = JSON.parse(options.body);
    return { ok: true };
  };
  process.env.LINE_CHANNEL_ACCESS_TOKEN = 'test-token';

  // 1. 男 原絡 肝木 太過 -> 左 丘墟、右 蠡溝
  let req = {
    method: 'POST',
    body: {
      events: [{
        replyToken: 'valid-token',
        type: 'message',
        message: { type: 'text', text: '男 原絡 肝木 太過' }
      }]
    }
  };
  let res = { status: () => ({ send: () => {} }) };
  await handler(req, res);
  assert.ok(replied, 'LINE reply should be sent');
  let text = replied.messages[0].text;
  assert.ok(text.includes('左 丘墟') && text.includes('右 蠡溝'), '男 原絡 肝木 太過 應為左丘墟右蠡溝');

  // 2. 女 原絡 肝木 不足 -> 左 太衝、右 光明
  req.body.events[0].message.text = '女 原絡 肝木 不足';
  await handler(req, res);
  text = replied.messages[0].text;
  assert.ok(text.includes('左 太衝') && text.includes('右 光明'), '女 原絡 肝木 不足 應為左太衝右光明');

  // 3. 測試 Quick Reply 包含用藥按鈕
  assert.ok(replied.messages[0].quickReply, '處方回傳應包含 quickReply');
  const qrItems = replied.messages[0].quickReply.items;
  const medBtn = qrItems.find(i => i.action.label === '💊 查看用藥策略');
  assert.ok(medBtn, '處方回傳應包含「💊 查看用藥策略」快捷按鈕');

  // 4. 關鍵字「人迎一盛」用藥查詢
  req.body.events[0].message.text = '人迎一盛用藥';
  await handler(req, res);
  text = replied.messages[0].text;
  assert.ok(text.includes('梔子1.3g 1.3錢') && text.includes('龍膽草0.8g 0.8錢') && text.includes('桂枝0.8g 1.8錢'), '人迎一盛應包含蕭醫師正確藥物與劑量');

  // 5. 關鍵字「脈口三盛而躁」用藥查詢
  req.body.events[0].message.text = '脈口三盛而躁';
  await handler(req, res);
  text = replied.messages[0].text;
  assert.ok(text.includes('黃耆1.9g 4.9錢') && text.includes('升麻0.4g 1.4錢') && text.includes('葶藶子1.9g 4.9錢'), '脈口三盛而躁應包含蕭醫師正確藥物與劑量');

  // 6. 關鍵字「蕭醫師」查詢
  req.body.events[0].message.text = '蕭醫師用藥';
  await handler(req, res);
  text = replied.messages[0].text;
  assert.ok(text.includes('蕭醫師用藥策略') && text.includes('人迎一盛') && text.includes('脈口一盛'), '蕭醫師關鍵字應回傳終始藥方系統');

  // 7. 關鍵字「潘老師」查詢
  req.body.events[0].message.text = '潘老師用藥';
  await handler(req, res);
  text = replied.messages[0].text;
  assert.ok(text.includes('潘老師用藥策略') && text.includes('湯液藥精系統') && text.includes('溫升涼降系統'), '潘老師關鍵字應回傳五大系統');

  // 8. 關鍵字「心火用藥」五行查詢
  req.body.events[0].message.text = '心火用藥';
  await handler(req, res);
  text = replied.messages[0].text;
  assert.ok(text.includes('心火 用藥策略整合') && text.includes('蕭醫師') && text.includes('潘老師'), '心火關鍵字應整合蕭醫師與潘老師用藥');

  // 9. postback action=med 測試
  let postbackReq = {
    method: 'POST',
    body: {
      events: [{
        replyToken: 'valid-token',
        type: 'postback',
        postback: { data: 'action=med&type=zs&treatment=' + encodeURIComponent('人迎二盛（補腎瀉膀胱）') }
      }]
    }
  };
  await handler(postbackReq, res);
  text = replied.messages[0].text;
  assert.ok(text.includes('人迎二盛 用藥策略') && text.includes('滑石1.6g 6錢') && text.includes('木通1g 1錢') && text.includes('熟地黃1.6g 6錢'), 'postback action=med 人迎二盛應回傳滑石、木通、熟地黃及劑量');

  console.log('✅ LINE Bot Webhook 模擬運算與用藥自動回應驗證通過！');
}

console.log('\n--- 測試 6: 蕭醫師 12 組用藥與劑量精確性驗證 ---');
const { XIAO_MEDICINE_MAP, PAN_MEDICINE_SYSTEMS, XIAO_MEDICINE_SYSTEMS } = require('./lib/rules.js');

const expectedXiao = {
  '人迎一盛': ['梔子1.3g 1.3錢', '龍膽草0.8g 0.8錢', '桂枝0.8g 1.8錢'],
  '人迎一盛而躁': ['生地黃1.7g 7錢', '山茱萸1.2g 2錢', '旋覆花0.7g 0.7錢'],
  '人迎二盛': ['滑石1.6g 6錢', '木通1g 1錢', '熟地黃1.6g 6錢'],
  '人迎二盛而躁': ['淡竹葉1.7g 2.7錢', '木通1.2g 1.2錢', '旋覆花0.7g 0.7錢'],
  '人迎三盛': ['牡丹皮0.5g 0.5錢', '生地黃1g 1錢', '黨參1g 5錢'],
  '人迎三盛而躁': ['大黃0.9g 0.9錢', '厚朴1.4g 4錢', '五味子0.9g 0.9錢'],
  '脈口一盛': ['吳茱萸0.8g 1.8錢', '生薑1.3g 3錢', '枳實0.8g 3.8錢'],
  '脈口一盛而躁': ['熟地黃1.7g 7錢', '肉桂0.2g 1.2錢', '黃連0.7g 0.7錢'],
  '脈口二盛': ['桂枝1g 1錢', '白朮1.6g 6錢', '茯苓1.6g 6錢'],
  '脈口二盛而躁': ['薤白1.7g 2.7錢', '桂枝1.2g 1.2錢', '黃連0.7g 0.7錢'],
  '脈口三盛': ['沙參0.5g 1.5錢', '麥門冬1g 3錢', '附子1g 1錢'],
  '脈口三盛而躁': ['黃耆1.9g 4.9錢', '升麻0.4g 1.4錢', '葶藶子1.9g 4.9錢']
};

for (const [key, meds] of Object.entries(expectedXiao)) {
  assert.ok(XIAO_MEDICINE_MAP[key], `XIAO_MEDICINE_MAP 應有 ${key}`);
  assert.deepStrictEqual(XIAO_MEDICINE_MAP[key].list, meds, `${key} 藥物與劑量應完全一致`);
}
assert.strictEqual(XIAO_MEDICINE_SYSTEMS.length, 2, '蕭醫師應有兩組系統（人迎、脈口）');
assert.strictEqual(PAN_MEDICINE_SYSTEMS.length, 5, '潘老師應有五組系統');
console.log('✅ 蕭醫師 12 組用藥與劑量 100% 精確匹配！');

console.log('\n--- 測試 7: index.html 介面選單與手法文案驗證 ---');
assert.ok(indexHtml.includes('潘老師用藥策略'), 'index.html 應有潘老師用藥策略');
assert.ok(indexHtml.includes('蕭醫師用藥策略'), 'index.html 應有蕭醫師用藥策略');
assert.ok(indexHtml.includes("currentPage === 'xiao_medicine'"), 'index.html 應有 xiao_medicine 頁面切換');
assert.ok(indexHtml.includes('穴位圖一覽'), 'index.html 應有穴位圖一覽選單');
assert.ok(indexHtml.includes("currentPage === 'gallery'"), 'index.html 應有 gallery 頁面切換');
assert.ok(indexHtml.includes('脈法判讀為蕭醫師的脈法'), 'index.html 第二頁應加註「脈法判讀為蕭醫師的脈法」');
assert.ok(!indexHtml.includes('逆轉'), 'index.html 不應再包含「逆轉」');
const rulesJs = fs.readFileSync('./lib/rules.js', 'utf8');
assert.ok(!rulesJs.includes('逆轉'), 'lib/rules.js 不應再包含「逆轉」');
console.log('✅ index.html 與 lib/rules.js 頁面、選單與手法文案驗證通過！');

console.log('\n--- 測試 8: 終始針法奇經八脈選穴邏輯與介面驗證 ---');
const { EIGHT_EXTRA_DIRECTIONS, evaluateExtraordinaryMeridian } = require('./lib/rules.js');

// 驗證八方位代號
const expectedCodes = {
  'up': '外開', 'up-left': '浮弦澀', 'left': '關偏', 'down-left': '沉弦',
  'up-right': '寸偏', 'right': '牢', 'down-right': '尺偏', 'down': '內收'
};
for (const [dir, code] of Object.entries(expectedCodes)) {
  assert.strictEqual(EIGHT_EXTRA_DIRECTIONS[dir].code, code, `${dir} 代號應為 ${code}`);
}

// 驗證 申脈、照海 穴位位置
assert.ok(POINT_LOCATIONS['申脈'] && POINT_LOCATIONS['照海'], 'lib/rules.js 應包含申脈與照海位置');
assert.ok(indexHtml.includes("'申脈'") && indexHtml.includes("'照海'"), 'index.html 應包含申脈與照海位置');

// 模擬終始針法解答：男 人迎一盛（補肝瀉膽） -> 陰經(曲泉)在右、遠心、順轉
const zsMaleRenying = { method: '人迎一盛（補肝瀉膽）', ...ZHONGSHI_RULES.male['人迎一盛（補肝瀉膽）'] };
// 模擬終始針法解答：男 脈口一盛（補膽瀉肝） -> 陰經(行間)在左、遠心、順轉
const zsMaleMaikou = { method: '脈口一盛（補膽瀉肝）', ...ZHONGSHI_RULES.male['脈口一盛（補膽瀉肝）'] };

// 1. 雙手右方(牢) -> 公孫 (與陰經相反側：人迎陰經在右 -> 公孫在左)
let resExtra = evaluateExtraordinaryMeridian('right', 'right', zsMaleRenying);
assert.strictEqual(resExtra.status, 'single');
assert.strictEqual(resExtra.points[0].point, '公孫');
assert.strictEqual(resExtra.points[0].side, 'left');
assert.ok(resExtra.points[0].desc.includes('遠心') && resExtra.points[0].desc.includes('順轉'));

// 2. 單手右方(牢) -> 防呆：脈象不完全符合奇經八脈
resExtra = evaluateExtraordinaryMeridian('right', null, zsMaleRenying);
assert.strictEqual(resExtra.status, 'unmatched');
assert.strictEqual(resExtra.message, '脈象不完全符合奇經八脈');

// 3. 右手左上(浮弦澀) -> 列缺 (與陰經相同側：脈口陰經在左 -> 列缺在左)
resExtra = evaluateExtraordinaryMeridian('up-left', null, zsMaleMaikou);
assert.strictEqual(resExtra.points[0].point, '列缺');
assert.strictEqual(resExtra.points[0].side, 'left');

// 4. 左手左上(浮弦澀) -> 後溪 (與陰經相同側：人迎陰經在右 -> 後溪在右)
resExtra = evaluateExtraordinaryMeridian(null, 'up-left', zsMaleRenying);
assert.strictEqual(resExtra.points[0].point, '後溪');
assert.strictEqual(resExtra.points[0].side, 'right');

// 5. 雙手同時選正上 -> 外關 (相同側) / 雙手同時選正下 -> 內關 (相同側)
resExtra = evaluateExtraordinaryMeridian('up', 'up', zsMaleRenying);
assert.strictEqual(resExtra.points[0].point, '外關');
assert.strictEqual(resExtra.points[0].side, 'right');
resExtra = evaluateExtraordinaryMeridian('down', 'down', zsMaleMaikou);
assert.strictEqual(resExtra.points[0].point, '內關');
assert.strictEqual(resExtra.points[0].side, 'left');

// 6. 任一手選左方/右上/右下 -> 足臨泣/申脈/照海 (相反側)
assert.strictEqual(evaluateExtraordinaryMeridian('left', null, zsMaleRenying).points[0].point, '足臨泣');
assert.strictEqual(evaluateExtraordinaryMeridian('left', null, zsMaleRenying).points[0].side, 'left');
assert.strictEqual(evaluateExtraordinaryMeridian(null, 'up-right', zsMaleRenying).points[0].point, '申脈');
assert.strictEqual(evaluateExtraordinaryMeridian(null, 'up-right', zsMaleRenying).points[0].side, 'left');
assert.strictEqual(evaluateExtraordinaryMeridian('down-right', null, zsMaleMaikou).points[0].point, '照海');
assert.strictEqual(evaluateExtraordinaryMeridian('down-right', null, zsMaleMaikou).points[0].side, 'right');

// 7. 同時符合兩條奇經八脈 -> 顯示兩個穴位與提示
resExtra = evaluateExtraordinaryMeridian('up-left', 'up-left', zsMaleRenying);
assert.strictEqual(resExtra.status, 'multiple');
assert.deepStrictEqual(resExtra.points.map(p => p.point), ['列缺', '後溪']);
assert.strictEqual(resExtra.note, '脈象同時符合兩條奇經八脈，請斟酌參考');

// 8. 驗證 index.html UI 與邏輯同步
assert.ok(indexHtml.includes('OctagonBox'), 'index.html 應包含 OctagonBox 八角形組件');
assert.ok(indexHtml.includes('bg-amber-50'), 'index.html 應包含淡黃色第三區間');
assert.ok(indexHtml.includes('靈龜八法穴組參考'), 'index.html 應包含靈龜八法穴組參考頁面');
assert.ok(indexHtml.includes('離(火)：列缺') && indexHtml.includes('坎(水)：申脈') && indexHtml.includes('坤、艮(土)：照海、內關') && indexHtml.includes('震、巽(木)：外關、足臨泣') && indexHtml.includes('兌、乾(金)：後溪、公孫'), 'index.html 應包含完整靈龜八法穴組筆記');
assert.ok(indexHtml.indexOf("setCurrentPage('linggui_bafa')") < indexHtml.indexOf("setCurrentPage('gallery')"), '靈龜八法穴組參考應排在穴位圖一覽上一層');
console.log('✅ 終始針法奇經八脈選穴邏輯與介面驗證通過！');

testLineBot().then(() => {
  console.log('\n=========================================');
  console.log(' 🏁 全套自動化單元測試 100% 通過！');
  console.log('=========================================');
}).catch(err => {
  console.error('❌ 測試失敗:', err);
  process.exit(1);
});
