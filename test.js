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

  console.log('✅ LINE Bot Webhook 模擬運算驗證通過！');
}

testLineBot().then(() => {
  console.log('\n=========================================');
  console.log(' 🏁 全套自動化單元測試 100% 通過！');
  console.log('=========================================');
}).catch(err => {
  console.error('❌ 測試失敗:', err);
  process.exit(1);
});
