// 1. 治療原則與穴位資料庫 (以男性為基準預設值)
const treatmentDB = {
  // ... (與原本相同，這裡省略以節省篇幅，請保留你原本的 treatmentDB) ...
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

// 2. 動態產生問題選單的函式 (Quick Reply 版)
function getQuickReplyTemplate(step, previousAnswers = "") {
  // ... (與原本的 getQuickReplyTemplate 相同，請保留你原本的邏輯) ...
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

  return {
    type: "text",
    text: text,
    quickReply: { items: quickReplyItems }
  };
}

// 3. 計算最終結果與「女性左右反轉」邏輯
function calculateTreatmentResult(answerString) {
  // ... (與原本的 calculateTreatmentResult 相同) ...
  const ansArr = answerString.split(',');
  const gender = ansArr[0];
  const pulse = ansArr[1];
  const zao = ansArr[2];
  const principle = ansArr[3];

  const method = treatmentDB[principle];
  if (!method) return { type: 'text', text: '系統查詢出錯，請重新發起選穴。' };

  let buText = method.bu;
  let xieText = method.xie;

  if (gender === '女') {
    buText = buText.replace(/左/g, '__L__').replace(/右/g, '左').replace(/__L__/g, '右');
    xieText = xieText.replace(/左/g, '__L__').replace(/右/g, '左').replace(/__L__/g, '右');
  }

  let resultText = `📋 【針灸治療方針建議】\n────────────\n👤 患者：${gender}性\n🔍 辨證：${pulse} / ${zao === '是' ? '為躁' : '非躁'} -> ${principle}\n────────────\n🟢 補法:\n${buText}\n\n🔴 瀉法:\n${xieText}`;

  return { type: 'text', text: resultText };
}

// 4. Vercel 專用的主程式入口 (注意 req, res 的寫法改變了)
export default async function handler(req, res) {
  // 處理非 POST 請求 (避免 GET 訪問時崩潰)
  if (req.method !== 'POST') {
    return res.status(200).send('LINE Bot Webhook is running!');
  }

  try {
    // Vercel 自動解析了 JSON，不需要 JSON.parse(event.body)
    const body = req.body;

    // 防呆機制：LINE 驗證 Webhook 時，可能會傳送空的 events 陣列
    if (!body || !body.events || body.events.length === 0) {
      console.log("收到空的 events，回應 200 OK (可能為 LINE 驗證)");
      return res.status(200).send('OK');
    }

    const lineEvent = body.events[0];
    const replyToken = lineEvent.replyToken;
    
    // 如果是 webhook 驗證事件 (例如 00000000000000000000000000000000)，直接回應
    if (replyToken === '00000000000000000000000000000000' || replyToken === 'ffffffffffffffffffffffffffffffff') {
        return res.status(200).send('OK');
    }

    let replyMessages = [];

    if (lineEvent.type === 'message' && lineEvent.message.type === 'text') {
      const userMessage = lineEvent.message.text.trim();
      if (userMessage.includes('選穴') || userMessage.includes('評估')) {
        replyMessages = [getQuickReplyTemplate(0)];
      }
    } else if (lineEvent.type === 'postback') {
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

    // 發送回覆
    if (replyMessages.length > 0) {
      if (!process.env.LINE_CHANNEL_ACCESS_TOKEN) {
          console.error("錯誤：環境變數 LINE_CHANNEL_ACCESS_TOKEN 尚未設定！");
          return res.status(500).send('Missing Access Token');
      }

      const response = await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          replyToken: replyToken,
          messages: replyMessages
        })
      });

      if (!response.ok) {
          const errorText = await response.text();
          console.error('LINE API 發生錯誤:', errorText);
      }
    }

    return res.status(200).send('OK');

  } catch (error) {
    console.error('執行過程中發生未預期的錯誤:', error);
    return res.status(500).send('Internal Server Error');
  }
}
