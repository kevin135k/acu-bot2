// 1. 治療原則與穴位資料庫 (以男性為基準預設值)
const treatmentDB = {
  "補肝瀉膽": { bu: "右腳曲泉(遠心、淺刺15度、陽數、順轉)", xie: "左腳足臨泣/陽輔(向心、深刺45度、陰數、逆轉)" },
  "補腎瀉膀胱": { bu: "右腳復溜(遠心、淺刺15度、陽數、順轉)", xie: "左腳通谷/束骨(向心、深刺45度、陰數、逆轉)" },
  "補脾瀉胃": { bu: "右腳大都(遠心、淺刺15度、陽數、順轉)", xie: "左腳足三里/厲兌(向心、深刺45度、陰數、逆轉)" },
  "補心包瀉三焦": { bu: "左手中衝(遠心、淺刺15度、陽數、順轉)", xie: "右手支溝/天井(向心、深刺45度、陰數、逆轉)" },
  "補心瀉小腸": { bu: "左手少衝(遠心、淺刺15度、陽數、順轉)", xie: "右手陽谷/小海(向心、深刺45度、陰數、逆轉)" },
  "補肺瀉大腸": { bu: "左手太淵(遠心、淺刺15度、陽數、順轉)", xie: "右手商陽/二間(向心、深刺45度、陰數、逆轉)" },
  "補膽瀉肝": { bu: "右腳足臨泣/俠溪(向心、淺刺15度、吐氣進針、陽數、順轉)", xie: "左腳行間(遠心、深刺45度、吐氣進針、陰數、逆轉)" },
  "補膀胱瀉腎": { bu: "右腳通谷/至陰(向心、淺刺15度、吐氣進針、陽數、順轉)", xie: "左腳湧泉(遠心、深刺45度、吐氣進針、陰數、逆轉)" },
  "補胃瀉脾": { bu: "右腳足三里/解溪(向心、淺刺15度、吐氣進針、陽數、順轉)", xie: "左腳商丘(遠心、深刺45度、吐氣進針、陰數、逆轉)" },
  "補三焦瀉心包": { bu: "左手支溝/中渚(向心、淺刺15度、吐氣進針、陽數、順轉)", xie: "右手大陵(遠心、深刺45度、吐氣進針、陰數、逆轉)" },
  "補小腸瀉心": { bu: "左手陽谷/後溪(向心、淺刺15度、吐氣進針、陽數、順轉)", xie: "右手神門(遠心、深刺45度、吐氣進針、陰數、逆轉)" },
  "補大腸瀉肺": { bu: "左手商陽/曲池(向心、淺刺15度、吐氣進針、陽數、順轉)", xie: "右手尺澤(遠心、深刺45度、吐氣進針、陰數、逆轉)" }
};

// 2. 智能文字解析 (Direct Query)
function parseDirectQuery(text) {
  // 1. 抓取性別 (預設男)
  const gender = text.includes('女') ? '女' : '男';

  // 2. 抓取脈位
  let pulse = null;
  if (text.includes('人迎')) pulse = '人迎';
  else if (text.includes('脈口')) pulse = '脈口';

  // 3. 抓取盛衰程度
  let level = null;
  if (text.includes('一盛')) level = '一';
  else if (text.includes('二盛')) level = '二';
  else if (text.includes('三盛')) level = '三';

  // 4. 抓取「躁」的防呆邏輯
  let zao = '否'; // 預設為否 (完全沒提到也當作否)
  // 升級版防呆：包含「不/非/無/沒/沒有/不會」，且與「躁」之間最多可以隔 3 個字 (例如: 不覺得躁、沒有很躁)
  const notZaoRegex = /(不|非|無|沒|沒有|不會).{0,3}躁/; 
  
  if (notZaoRegex.test(text)) {
    zao = '否';
  } else if (text.includes('躁')) {
    // 只有在「沒有否定詞」且「有躁字」的情況下，才判定為是
    zao = '是';
  }

  // 核心判斷：只要這段文字同時包含「脈位」和「盛衰程度」，我們就啟動直覺回答！
  if (pulse && level) {
    let principle = "";
    if (pulse === '人迎') {
      if (zao === '否') {
        if (level === '一') principle = "補肝瀉膽";
        if (level === '二') principle = "補腎瀉膀胱";
        if (level === '三') principle = "補脾瀉胃";
      } else { // 是躁
        if (level === '一') principle = "補心包瀉三焦";
        if (level === '二') principle = "補心瀉小腸";
        if (level === '三') principle = "補肺瀉大腸";
      }
    } else if (pulse === '脈口') {
      if (zao === '否') {
        if (level === '一') principle = "補膽瀉肝";
        if (level === '二') principle = "補膀胱瀉腎";
        if (level === '三') principle = "補胃瀉脾";
      } else { // 是躁
        if (level === '一') principle = "補三焦瀉心包";
        if (level === '二') principle = "補小腸瀉心";
        if (level === '三') principle = "補大腸瀉肺";
      }
    }
    
    // 將結果組合為之前寫好的答案字串格式，交給 calculateTreatmentResult 處理
    return `${gender},${pulse},${zao},${principle}`;
  }
  
  // 資訊不足，無法直接給答案
  return null;
}

// 3. 動態產生問題選單的函式 (Quick Reply 泡泡按鈕版)
function getQuickReplyTemplate(step, previousAnswers = "") {
  let text = "";
  let options = [];
  const ansArr = previousAnswers ? previousAnswers.split(',') : [];

  if (step === 0) {
    text = "1/4: 請問病人性別？";
    options = [{ label: "👨 男", value: "男" }, { label: "👩 女", value: "女" }];
  } else if (step === 1) {
    text = "2/4: 請問脈位狀態？";
    options = [{ label: "人迎", value: "人迎" }, { label: "脈口", value: "脈口" }];
  } else if (step === 2) {
    text = "3/4: 脈象是否為躁？";
    options = [{ label: "是 (為躁)", value: "是" }, { label: "否 (非躁)", value: "否" }];
  } else if (step === 3) {
    text = "4/4: 請問盛衰程度與治療原則？";
    const pulse = ansArr[1];
    const zao = ansArr[2];
    if (pulse === "人迎" && zao === "否") {
      options = [{ label: "一盛(肝/膽)", value: "補肝瀉膽" }, { label: "二盛(腎/膀)", value: "補腎瀉膀胱" }, { label: "三盛(脾/胃)", value: "補脾瀉胃" }];
    } else if (pulse === "人迎" && zao === "是") {
      options = [{ label: "一盛而躁", value: "補心包瀉三焦" }, { label: "二盛而躁", value: "補心瀉小腸" }, { label: "三盛而躁", value: "補肺瀉大腸" }];
    } else if (pulse === "脈口" && zao === "否") {
      options = [{ label: "一盛(膽/肝)", value: "補膽瀉肝" }, { label: "二盛(膀/腎)", value: "補膀胱瀉腎" }, { label: "三盛(胃/脾)", value: "補胃瀉脾" }];
    } else if (pulse === "脈口" && zao === "是") {
      options = [{ label: "一盛而躁", value: "補三焦瀉心包" }, { label: "二盛而躁", value: "補小腸瀉心" }, { label: "三盛而躁", value: "補大腸瀉肺" }];
    }
  }

  const quickReplyItems = options.map(opt => {
    const newAnswers = previousAnswers ? `${previousAnswers},${opt.value}` : opt.value;
    return {
      type: "action",
      action: {
        type: "postback",
        label: opt.label,
        data: `action=survey&q=${step + 1}&ans=${newAnswers}`,
        displayText: opt.label
      }
    };
  });

  return { type: "text", text: text, quickReply: { items: quickReplyItems } };
}

// 4. 計算最終結果與「女性左右反轉」邏輯
function calculateTreatmentResult(answerString) {
  const ansArr = answerString.split(',');
  const gender = ansArr[0];
  const pulse = ansArr[1];
  const zao = ansArr[2];
  const principle = ansArr[3];

  const method = treatmentDB[principle];
  if (!method) return { type: 'text', text: '系統查詢出錯，請重新發起選穴。' };

  let buText = method.bu;
  let xieText = method.xie;

  // 女性左右反轉
  if (gender === '女') {
    buText = buText.replace(/左/g, '__L__').replace(/右/g, '左').replace(/__L__/g, '右');
    xieText = xieText.replace(/左/g, '__L__').replace(/右/g, '左').replace(/__L__/g, '右');
  }

  let resultText = `📋 【針灸治療方針建議】\n────────────\n👤 患者：${gender}性\n🔍 辨證：${pulse} / ${zao === '是' ? '為躁' : '非躁'} -> ${principle}\n────────────\n🟢 補法:\n${buText}\n\n🔴 瀉法:\n${xieText}`;

  return { type: 'text', text: resultText };
}

// 5. Vercel 主程式入口
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

    // --- 【修改重點】: 使用者在群組打字時的判斷 ---
    if (lineEvent.type === 'message' && lineEvent.message.type === 'text') {
      const userMessage = lineEvent.message.text.trim();
      
      // 1. 先嘗試「智能解析」這串長文字
      const directResultStr = parseDirectQuery(userMessage);

      // 2. 如果成功解析出脈位+盛度，直接給出最終解答！
      if (directResultStr) {
        replyMessages = [calculateTreatmentResult(directResultStr)];
      } 
      // 3. 如果解析失敗(沒提到脈位或盛度)，但句子裡有「選穴」兩字，就退回泡泡點擊模式
      else if (userMessage.includes('選穴') || userMessage.includes('評估')) {
        replyMessages = [getQuickReplyTemplate(0)];
      }
    } 
    // --- 使用者點選按鈕時的判斷 (維持不變) ---
    else if (lineEvent.type === 'postback') {
      const postbackData = new URLSearchParams(lineEvent.postback.data);
      if (postbackData.get('action') === 'survey') {
        const nextQuestionIndex = parseInt(postbackData.get('q'));
        const currentAnswers = postbackData.get('ans');

        if (nextQuestionIndex < 4) {
          replyMessages = [getQuickReplyTemplate(nextQuestionIndex, currentAnswers)];
        } else {
          replyMessages = [calculateTreatmentResult(currentAnswers)];
        }
      }
    }

    // 發送回覆給 LINE
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
    console.error('執行過程中發生錯誤:', error);
    return res.status(500).send('Internal Server Error');
  }
}
