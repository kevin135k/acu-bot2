import { 
  POINT_LOCATIONS, 
  POINT_NAMES_REGEX, 
  TANGYE_RULES, 
  ZHONGSHI_RULES, 
  YUANLUO_RULES,
  PAN_MEDICINE_SYSTEMS,
  XIAO_MEDICINE_SYSTEMS,
  XIAO_MEDICINE_MAP
} from '../lib/rules.js';

// ==========================================
// 1.1 用藥策略回覆格式化 (蕭醫師 & 潘老師)
// ==========================================
export function formatXiaoMedicineAll() {
  let text = "👨‍⚕️ 【蕭醫師用藥策略】終始藥方系統\n────────────\n";
  text += "☀️ 【人迎終始藥方】\n";
  const renyingKeys = ['人迎一盛', '人迎一盛而躁', '人迎二盛', '人迎二盛而躁', '人迎三盛', '人迎三盛而躁'];
  renyingKeys.forEach(k => {
    const item = XIAO_MEDICINE_MAP[k];
    text += `• ${k}（${item.element}）：\n  ${item.list.join('、')}\n`;
  });
  text += "\n🌙 【脈口終始藥方】\n";
  const maikouKeys = ['脈口一盛', '脈口一盛而躁', '脈口二盛', '脈口二盛而躁', '脈口三盛', '脈口三盛而躁'];
  maikouKeys.forEach(k => {
    const item = XIAO_MEDICINE_MAP[k];
    text += `• ${k}（${item.element}）：\n  ${item.list.join('、')}\n`;
  });
  return text.trim();
}

export function formatXiaoMedicineSystem(pulseType) {
  const isRenying = pulseType.includes('人迎');
  const header = isRenying ? "☀️ 【蕭醫師用藥策略】人迎終始藥方" : "🌙 【蕭醫師用藥策略】脈口終始藥方";
  let text = `${header}\n────────────\n`;
  const prefix = isRenying ? '人迎' : '脈口';
  const keys = [`${prefix}一盛`, `${prefix}一盛而躁`, `${prefix}二盛`, `${prefix}二盛而躁`, `${prefix}三盛`, `${prefix}三盛而躁`];
  keys.forEach(k => {
    const item = XIAO_MEDICINE_MAP[k];
    text += `• ${k}（${item.element}）：\n  ${item.list.join('、')}\n`;
  });
  return text.trim();
}

export function formatPanMedicineAll() {
  let text = "🧑‍🏫 【潘老師用藥策略】五大用藥系統\n────────────\n";
  PAN_MEDICINE_SYSTEMS.forEach(sys => {
    text += `${sys.icon} 【${sys.title}】\n`;
    if (sys.type === 'list') {
      Object.values(sys.data).forEach(d => {
        text += `  • ${d.element} (${d.state}): ${d.list.join('、')}\n`;
      });
    } else {
      Object.values(sys.data).forEach(d => {
        text += `  • ${d.element}: ${sys.leftAction} ${d.left} / ${sys.rightAction} ${d.right}\n`;
      });
    }
    text += "\n";
  });
  return text.trim();
}

export function formatElementMedicine(organ) {
  if (!['心火', '肝木', '腎水', '肺金', '脾土', '命門'].includes(organ)) {
    return '查無此脈位或臟腑資料。';
  }
  let text = `💊 【${organ} 用藥策略整合】\n────────────\n`;
  
  // 蕭醫師
  text += `👨‍⚕️ 【蕭醫師終始藥方及劑量】\n`;
  let foundXiao = false;
  Object.entries(XIAO_MEDICINE_MAP).forEach(([key, val]) => {
    if (val.element === organ) {
      foundXiao = true;
      text += `• ${key}：\n  ${val.list.join('、')}\n`;
    }
  });
  if (!foundXiao) text += `• 尚無特定資料\n`;

  // 潘老師
  text += `\n🧑‍🏫 【潘老師五大系統】\n`;
  PAN_MEDICINE_SYSTEMS.forEach(sys => {
    const d = sys.data[organ];
    if (d) {
      if (sys.type === 'list') {
        text += `• ${sys.title} (${d.state})：\n  ${d.list.join('、')}\n`;
      } else {
        text += `• ${sys.title}：\n  ${sys.leftAction} ${d.left} / ${sys.rightAction} ${d.right}\n`;
      }
    }
  });

  return text.trim();
}

export function handleMedicineQuery(text) {
  const cleanText = text.trim();
  const hasMedKeyword = cleanText.includes('藥') || cleanText.includes('方') || cleanText.includes('劑量');
  const hasDoctor = cleanText.includes('蕭') || cleanText.includes('潘');
  const pulseLevels = ['人迎一盛而躁', '人迎二盛而躁', '人迎三盛而躁', '人迎一盛', '人迎二盛', '人迎三盛', '脈口一盛而躁', '脈口二盛而躁', '脈口三盛而躁', '脈口一盛', '脈口二盛', '脈口三盛'];
  const isPulseLevelOnly = pulseLevels.some(k => cleanText.replace(/\s+/g, '') === k);

  if (!hasMedKeyword && !hasDoctor && !isPulseLevelOnly) {
    return null;
  }

  // 1. 蕭醫師相關查詢
  if (cleanText.includes('蕭') || cleanText.includes('終始藥方')) {
    if (cleanText.includes('人迎')) {
      for (const k of ['人迎一盛而躁', '人迎二盛而躁', '人迎三盛而躁', '人迎一盛', '人迎二盛', '人迎三盛']) {
        if (cleanText.includes(k) || cleanText.replace(/\s+/g, '').includes(k)) {
          const item = XIAO_MEDICINE_MAP[k];
          let res = `👨‍⚕️ 【蕭醫師用藥策略】${k}（${item.element}）\n────────────\n`;
          res += `💊 精準藥物及劑量：\n`;
          item.list.forEach(m => { res += `• ${m}\n`; });
          return { type: 'text', text: res.trim() };
        }
      }
      return { type: 'text', text: formatXiaoMedicineSystem('人迎') };
    }
    if (cleanText.includes('脈口')) {
      for (const k of ['脈口一盛而躁', '脈口二盛而躁', '脈口三盛而躁', '脈口一盛', '脈口二盛', '脈口三盛']) {
        if (cleanText.includes(k) || cleanText.replace(/\s+/g, '').includes(k)) {
          const item = XIAO_MEDICINE_MAP[k];
          let res = `👨‍⚕️ 【蕭醫師用藥策略】${k}（${item.element}）\n────────────\n`;
          res += `💊 精準藥物及劑量：\n`;
          item.list.forEach(m => { res += `• ${m}\n`; });
          return { type: 'text', text: res.trim() };
        }
      }
      return { type: 'text', text: formatXiaoMedicineSystem('脈口') };
    }
    for (const organ of ['心火', '肝木', '腎水', '肺金', '脾土', '命門']) {
      if (cleanText.includes(organ)) {
        let res = `👨‍⚕️ 【蕭醫師用藥策略】${organ}\n────────────\n`;
        Object.entries(XIAO_MEDICINE_MAP).forEach(([k, item]) => {
          if (item.element === organ) {
            res += `• ${k}：\n  ${item.list.join('、')}\n`;
          }
        });
        return { type: 'text', text: res.trim() };
      }
    }
    return { type: 'text', text: formatXiaoMedicineAll() };
  }

  // 2. 潘老師相關查詢
  if (cleanText.includes('潘') || cleanText.includes('湯液藥精') || cleanText.includes('溫升涼降') || cleanText.includes('涼升溫降')) {
    if (cleanText.includes('湯液') || cleanText.includes('藥精')) {
      const sys = PAN_MEDICINE_SYSTEMS[0];
      let res = `${sys.icon} 【潘老師 - ${sys.title}】\n────────────\n`;
      Object.values(sys.data).forEach(d => {
        res += `• ${d.element}：${sys.leftAction} ${d.left} / ${sys.rightAction} ${d.right}\n`;
      });
      return { type: 'text', text: res.trim() };
    }
    if (cleanText.includes('溫升') || cleanText.includes('涼降')) {
      const sys = PAN_MEDICINE_SYSTEMS[1];
      let res = `${sys.icon} 【潘老師 - ${sys.title}】\n────────────\n`;
      Object.values(sys.data).forEach(d => {
        res += `• ${d.element}：${sys.leftAction} ${d.left} / ${sys.rightAction} ${d.right}\n`;
      });
      return { type: 'text', text: res.trim() };
    }
    if (cleanText.includes('涼升') || cleanText.includes('溫降')) {
      const sys = PAN_MEDICINE_SYSTEMS[2];
      let res = `${sys.icon} 【潘老師 - ${sys.title}】\n────────────\n`;
      Object.values(sys.data).forEach(d => {
        res += `• ${d.element}：${sys.leftAction} ${d.left} / ${sys.rightAction} ${d.right}\n`;
      });
      return { type: 'text', text: res.trim() };
    }
    return { type: 'text', text: formatPanMedicineAll() };
  }

  // 3. 盛衰關鍵字直接查詢
  for (const k of ['人迎一盛而躁', '人迎二盛而躁', '人迎三盛而躁', '人迎一盛', '人迎二盛', '人迎三盛', '脈口一盛而躁', '脈口二盛而躁', '脈口三盛而躁', '脈口一盛', '脈口二盛', '脈口三盛']) {
    if (cleanText.includes(k) || cleanText.replace(/\s+/g, '').includes(k)) {
      const item = XIAO_MEDICINE_MAP[k];
      let res = `💊 【${k} 用藥策略】\n────────────\n`;
      res += `👨‍⚕️ 【蕭醫師精準處方與劑量】\n• 對應臟腑：${item.element}\n• 處方藥物：\n`;
      item.list.forEach(m => { res += `  ▫️ ${m}\n`; });

      res += `\n🧑‍🏫 【潘老師用藥參考】\n`;
      const panZsSys = item.pulse === '人迎' ? PAN_MEDICINE_SYSTEMS[3] : PAN_MEDICINE_SYSTEMS[4];
      const panData = panZsSys.data[item.element];
      if (panData) {
        res += `• ${panZsSys.title}：${panData.list.join('、')}\n`;
      }
      const panTyData = PAN_MEDICINE_SYSTEMS[0].data[item.element];
      if (panTyData) {
        res += `• 湯液藥精：補 ${panTyData.left} / 瀉 ${panTyData.right}\n`;
      }
      return { type: 'text', text: res.trim() };
    }
  }

  // 4. 五行臟腑關鍵字查詢
  for (const organ of ['心火', '肝木', '腎水', '肺金', '脾土', '命門']) {
    if (cleanText.includes(organ)) {
      return { type: 'text', text: formatElementMedicine(organ) };
    }
  }

  // 5. 通用用藥引導
  if (cleanText === '用藥' || cleanText === '藥方' || cleanText === '中藥' || cleanText === '用藥策略' || cleanText.includes('藥')) {
    const guideText = `💊 【中醫用藥策略資料庫】\n────────────\n系統已收錄「👨‍⚕️ 蕭醫師用藥策略」與「🧑‍🏫 潘老師用藥策略」：\n\n1️⃣ 👨‍⚕️ 蕭醫師終始藥方系統：\n收錄人迎與脈口各盛衰精準用藥及劑量（公克g / 錢）。\n\n2️⃣ 🧑‍🏫 潘老師五大用藥系統：\n收錄湯液藥精、溫升涼降、涼升溫降、終始藥方人迎/脈口。\n\n請點選下方快捷泡泡按鈕，或直接輸入如「人迎一盛」、「蕭醫師」、「潘老師」、「心火用藥」進行查詢！`;
    return {
      type: 'text',
      text: guideText,
      quickReply: {
        items: [
          {
            type: "action",
            action: {
              type: "message",
              label: "👨‍⚕️ 蕭醫師全藥方",
              text: "蕭醫師用藥"
            }
          },
          {
            type: "action",
            action: {
              type: "message",
              label: "☀️ 蕭-人迎藥方",
              text: "蕭醫師 人迎"
            }
          },
          {
            type: "action",
            action: {
              type: "message",
              label: "🌙 蕭-脈口藥方",
              text: "蕭醫師 脈口"
            }
          },
          {
            type: "action",
            action: {
              type: "message",
              label: "🧑‍🏫 潘老師用藥",
              text: "潘老師用藥"
            }
          }
        ]
      }
    };
  }

  return null;
}

// ==========================================
// 2. 智能文字解析 (Direct Query)
// ==========================================
function parseDirectQuery(text) {
  const gender = text.includes('女') ? 'female' : 'male';

  // 嘗試解析「湯液」或「原絡」
  const organPulses = ['心火', '肝木', '腎水', '肺金', '脾土', '命門'];
  const organPulse = organPulses.find(p => text.includes(p));
  let organState = null;
  if (text.includes('太過')) organState = '太過';
  else if (text.includes('不足')) organState = '不足';

  if (organPulse && organState) {
    // 預設為湯液，除非特別提到原絡
    const system = text.includes('原絡') ? '原絡' : '湯液';
    return `${gender},${system},${organPulse},${organState}`;
  }

  // 嘗試解析「終始針法」
  let pulse = null;
  if (text.includes('人迎')) pulse = '人迎';
  else if (text.includes('脈口')) pulse = '脈口';

  let level = null;
  if (text.includes('一盛')) level = '一';
  else if (text.includes('二盛')) level = '二';
  else if (text.includes('三盛')) level = '三';

  let agitated = 'no'; 
  const notZaoRegex = /(不|非|無|沒|沒有|不會).{0,3}躁/; 
  if (notZaoRegex.test(text)) {
    agitated = 'no';
  } else if (text.includes('躁')) {
    agitated = 'yes';
  }

  if (pulse && level) {
    let treatment = "";
    if (pulse === '人迎') {
      if (agitated === 'no') {
        if (level === '一') treatment = "人迎一盛（補肝瀉膽）";
        if (level === '二') treatment = "人迎二盛（補腎瀉膀胱）";
        if (level === '三') treatment = "人迎三盛（補脾瀉胃）";
      } else { 
        if (level === '一') treatment = "人迎一盛而躁（補心包瀉三焦）";
        if (level === '二') treatment = "人迎二盛而躁（補心瀉小腸）";
        if (level === '三') treatment = "人迎三盛而躁（補肺瀉大腸）";
      }
    } else if (pulse === '脈口') {
      if (agitated === 'no') {
        if (level === '一') treatment = "脈口一盛（補膽瀉肝）";
        if (level === '二') treatment = "脈口二盛（補膀胱瀉腎）";
        if (level === '三') treatment = "脈口三盛（補胃瀉脾）";
      } else { 
        if (level === '一') treatment = "脈口一盛而躁（補三焦瀉心包）";
        if (level === '二') treatment = "脈口二盛而躁（補小腸瀉心）";
        if (level === '三') treatment = "脈口三盛而躁（補大腸瀉肺）";
      }
    }
    return `${gender},終始,${pulse},${agitated},${treatment}`;
  }

  return null;
}

// ==========================================
// 3. 動態產生問題選單 (Quick Reply)
// ==========================================
function getQuickReplyTemplate(step, previousAnswers = "") {
  const ansArr = previousAnswers ? previousAnswers.split(',') : [];
  let text = "";
  let options = [];

  if (step === 0) {
    text = "1. 請問病人性別？";
    options = [{ label: "👨 男", value: "male" }, { label: "👩 女", value: "female" }];
  } else if (step === 1) {
    text = "2. 請選擇針法系統？";
    options = [
        { label: "湯液針法", value: "湯液" }, 
        { label: "終始針法", value: "終始" },
        { label: "原絡針法", value: "原絡" }
    ];
  } else if (step === 2) {
    if (ansArr[1] === '湯液' || ansArr[1] === '原絡') {
      text = "3. 請問對應脈位？";
      options = ['心火', '肝木', '腎水', '肺金', '脾土', '命門'].map(v => ({ label: v, value: v }));
    } else {
      text = "3. 請問脈位狀態？";
      options = [{ label: "人迎", value: "人迎" }, { label: "脈口", value: "脈口" }];
    }
  } else if (step === 3) {
    if (ansArr[1] === '湯液' || ansArr[1] === '原絡') {
      text = "4. 該脈位狀態？";
      options = [{ label: "太過", value: "太過" }, { label: "不足", value: "不足" }];
    } else {
      text = "4. 脈象是否為躁？";
      options = [{ label: "是 (為躁)", value: "yes" }, { label: "否 (非躁)", value: "no" }];
    }
  } else if (step === 4 && ansArr[1] === '終始') {
    text = "5. 治療原則？";
    const pulse = ansArr[2];
    const agitated = ansArr[3];
    if (pulse === '人迎') {
      if (agitated === 'no') options = ['人迎一盛（補肝瀉膽）', '人迎二盛（補腎瀉膀胱）', '人迎三盛（補脾瀉胃）'].map(v => ({ label: v, value: v }));
      else options = ['人迎一盛而躁（補心包瀉三焦）', '人迎二盛而躁（補心瀉小腸）', '人迎三盛而躁（補肺瀉大腸）'].map(v => ({ label: v, value: v }));
    } else {
      if (agitated === 'no') options = ['脈口一盛（補膽瀉肝）', '脈口二盛（補膀胱瀉腎）', '脈口三盛（補胃瀉脾）'].map(v => ({ label: v, value: v }));
      else options = ['脈口一盛而躁（補三焦瀉心包）', '脈口二盛而躁（補小腸瀉心）', '脈口三盛而躁（補大腸瀉肺）'].map(v => ({ label: v, value: v }));
    }
  }

  const quickReplyItems = options.map(opt => {
    const newAnswers = previousAnswers ? `${previousAnswers},${opt.value}` : opt.value;
    return {
      type: "action",
      action: {
        type: "postback",
        label: opt.label.substring(0, 20),
        data: `action=survey&q=${step + 1}&ans=${newAnswers}`,
        displayText: opt.label
      }
    };
  });

  return { type: "text", text: text, quickReply: { items: quickReplyItems } };
}

// ==========================================
// 4. 計算結果並組合文字排版 (附帶取穴按鈕)
// ==========================================
function calculateTreatmentResult(ansString) {
  const ansArr = ansString.split(',');
  const gender = ansArr[0];
  const system = ansArr[1];

  let rule = null;
  let title = "";
  let methodTitle = "";
  let resultText = "";
  let pointNames = [];

  const formatPoint = (actionData) => {
    const sideText = actionData.side === 'left' ? '左' : '右';
    const pointName = actionData.alias ? `${actionData.point}/${actionData.alias}` : actionData.point;
    return `${sideText} ${pointName}\n  (${actionData.desc})`;
  };

  const genderStr = gender === 'female' ? '女' : '男';

  if (system === '原絡') {
    const pulse = ansArr[2];
    const state = ansArr[3];
    rule = YUANLUO_RULES[gender][pulse][state];
    title = "原絡針法";
    methodTitle = `${pulse} ${state}`;

    resultText = `📋 【${title} 處方】\n────────────\n👤 病患：${genderStr}性 | ${methodTitle}\n────────────\n\n`;
    resultText += `🟢 補法 (Tonify):\n${formatPoint(rule.pt1)}\n\n${formatPoint(rule.pt2)}`;

    [rule.pt1, rule.pt2].forEach(action => {
       if (action.point) pointNames.push(action.point);
    });

  } else {
    if (system === '湯液') {
      const pulse = ansArr[2];
      const state = ansArr[3];
      rule = TANGYE_RULES[gender][pulse][state];
      title = "湯液針法";
      methodTitle = `${pulse} ${state}`;
    } else {
      const treatment = ansArr[4];
      rule = ZHONGSHI_RULES[gender][treatment];
      title = "終始針法";
      methodTitle = treatment;
    }

    resultText = `📋 【${title} 處方】\n────────────\n👤 病患：${genderStr}性 | ${methodTitle}\n────────────\n\n`;
    resultText += `🟢 補法 (Tonify):\n${formatPoint(rule.tonify)}\n\n`;
    resultText += `🔴 瀉法 (Sedate):\n${formatPoint(rule.sedate)}`;

    [rule.tonify, rule.sedate].forEach(action => {
       if (action.point) pointNames.push(action.point);
       if (action.alias) pointNames.push(action.alias);
    });
  }

  if (!rule) return { type: 'text', text: '系統查無資料，請重新啟動評估。' };

  const pointsStr = pointNames.join(',');

  const medAction = system === '終始'
    ? {
        type: "action",
        action: {
          type: "postback",
          label: "💊 查看用藥策略",
          data: `action=med&type=zs&treatment=${encodeURIComponent(ansArr[4] || '')}`,
          displayText: "用藥策略"
        }
      }
    : {
        type: "action",
        action: {
          type: "postback",
          label: "💊 查看用藥策略",
          data: `action=med&type=organ&organ=${encodeURIComponent(ansArr[2] || '')}&state=${encodeURIComponent(ansArr[3] || '')}`,
          displayText: "用藥策略"
        }
      };

  return { 
    type: 'text', 
    text: resultText.trim(),
    quickReply: {
      items: [
        {
          type: "action",
          action: {
            type: "postback",
            label: "📍 查看取穴位置",
            data: `action=loc&pts=${pointsStr}`,
            displayText: "取穴"
          }
        },
        medAction
      ]
    }
  };
}

// ==========================================
// 5. Vercel 主程式入口 (Webhook Handler)
// ==========================================
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).send('LINE Bot Webhook is running!');

  try {
    const body = req.body;
    if (!body || !body.events || body.events.length === 0) return res.status(200).send('OK');

    const lineEvent = body.events[0];
    const replyToken = lineEvent.replyToken;
    
    if (replyToken === '00000000000000000000000000000000' || replyToken === 'ffffffffffffffffffffffffffffffff') {
        return res.status(200).send('OK');
    }

    let replyMessages = [];

    // --- 使用者在群組打字時 ---
    if (lineEvent.type === 'message' && lineEvent.message.type === 'text') {
      const userMessage = lineEvent.message.text.trim();
      
      if (userMessage.startsWith('取穴') || userMessage.startsWith('位置')) {
        if (userMessage === '取穴' || userMessage === '位置') {
            replyMessages = [{
               type: 'text',
               text: '💡 提示：為了準確回覆，請在收到處方後，直接點擊下方出現的「📍 查看取穴位置」泡泡按鈕。\n\n您也可以直接加上名稱來查詢，例如：「取穴 曲泉」'
            }];
        } else {
            const matches = userMessage.match(POINT_NAMES_REGEX);
            let foundPoints = matches ? Array.from(new Set(matches)) : [];

            if (foundPoints.length > 0) {
                let locText = "📍 【穴位位置指引】\n────────────\n";
                foundPoints.forEach(pt => { 
                    locText += `【${pt}】 ${POINT_LOCATIONS[pt].icon}\n${POINT_LOCATIONS[pt].text}\n\n`; 
                });
                replyMessages = [{ type: 'text', text: locText.trim() }];
            } else {
                replyMessages = [{ type: 'text', text: '系統中目前沒有這個穴位的資料喔。' }];
            }
        }
      } else {
        // 優先檢查是否為用藥查詢
        const medQueryResult = handleMedicineQuery(userMessage);
        if (medQueryResult) {
          replyMessages = [medQueryResult];
        } else {
          // 嘗試「智能解析」長文字 (Direct Query)
          const directResultStr = parseDirectQuery(userMessage);

          if (directResultStr) {
            // 直接拋出解答
            replyMessages = [calculateTreatmentResult(directResultStr)];
          } 
          else if (userMessage.includes('選穴') || userMessage.includes('評估') || userMessage.includes('針灸')) {
            // 啟動泡泡按鈕流程
            replyMessages = [getQuickReplyTemplate(0)];
          }
        }
      }
    } 
    // --- 使用者點選按鈕時 ---
    else if (lineEvent.type === 'postback') {
      const postbackData = new URLSearchParams(lineEvent.postback.data);
      
      if (postbackData.get('action') === 'survey') {
        const nextQuestionIndex = parseInt(postbackData.get('q'));
        const currentAnswers = postbackData.get('ans');
        const ansArr = currentAnswers.split(',');
        const system = ansArr[1];

        // 判斷是否已經抵達該系統的終點 (湯液與原絡都在第4層結束，終始在第5層結束)
        if (((system === '湯液' || system === '原絡') && nextQuestionIndex === 4) || (system === '終始' && nextQuestionIndex === 5)) {
          replyMessages = [calculateTreatmentResult(currentAnswers)];
        } else {
          replyMessages = [getQuickReplyTemplate(nextQuestionIndex, currentAnswers)];
        }
      } 
      else if (postbackData.get('action') === 'loc') {
        // 接收「查看取穴位置」的按鈕事件
        const pts = postbackData.get('pts').split(',');
        let locText = "📍 【穴位位置指引】\n────────────\n";
        pts.forEach(pt => {
           if (pt && POINT_LOCATIONS[pt]) {
              locText += `【${pt}】 ${POINT_LOCATIONS[pt].icon}\n${POINT_LOCATIONS[pt].text}\n\n`;
           }
        });
        replyMessages = [{ type: 'text', text: locText.trim() }];
      }
      else if (postbackData.get('action') === 'med') {
        // 接收「查看用藥策略」的按鈕事件
        const type = postbackData.get('type');
        let medText = "";
        if (type === 'zs') {
          const treatment = decodeURIComponent(postbackData.get('treatment') || '');
          const matchKey = Object.keys(XIAO_MEDICINE_MAP).find(k => treatment.includes(k));
          if (matchKey) {
            const item = XIAO_MEDICINE_MAP[matchKey];
            medText = `💊 【${matchKey} 用藥策略】\n────────────\n`;
            medText += `👨‍⚕️ 【蕭醫師精準處方與劑量】\n• 對應臟腑：${item.element}\n• 處方藥物：\n`;
            item.list.forEach(m => { medText += `  ▫️ ${m}\n`; });
            
            medText += `\n🧑‍🏫 【潘老師用藥參考】\n`;
            const panZsSys = item.pulse === '人迎' ? PAN_MEDICINE_SYSTEMS[3] : PAN_MEDICINE_SYSTEMS[4];
            const panData = panZsSys.data[item.element];
            if (panData) {
              medText += `• ${panZsSys.title}：${panData.list.join('、')}\n`;
            }
            const panTyData = PAN_MEDICINE_SYSTEMS[0].data[item.element];
            if (panTyData) {
              medText += `• 湯液藥精：補 ${panTyData.left} / 瀉 ${panTyData.right}\n`;
            }
          } else {
            medText = formatXiaoMedicineAll();
          }
        } else if (type === 'organ') {
          const organ = decodeURIComponent(postbackData.get('organ') || '');
          medText = formatElementMedicine(organ);
        } else {
          medText = formatXiaoMedicineAll();
        }
        replyMessages = [{ type: 'text', text: medText.trim() }];
      }
    }

    // 發送給 LINE
    if (replyMessages.length > 0) {
      if (!process.env.LINE_CHANNEL_ACCESS_TOKEN) return res.status(500).send('Missing Access Token');
      
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
        },
        body: JSON.stringify({ replyToken: replyToken, messages: replyMessages })
      });
    }

    return res.status(200).send('OK');

  } catch (error) {
    console.error('執行錯誤:', error);
    return res.status(500).send('Internal Server Error');
  }
}
