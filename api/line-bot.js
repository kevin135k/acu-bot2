import { POINT_LOCATIONS, TANGYE_RULES, ZHONGSHI_RULES, YUANLUO_RULES } from '../shared-data.js';

const POINT_NAMES_REGEX = new RegExp(Object.keys(POINT_LOCATIONS).join('|'), 'g');

// ==========================================
// 1. 醫療資料庫 (整合湯液、終始、原絡針法)
// ==========================================






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
    resultText += `🟢 補法 (Tonify):\n${formatPoint(rule.tonify)}\n\n${formatPoint(rule.sedate)}`;

    [rule.tonify, rule.sedate].forEach(action => {
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
        }
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
