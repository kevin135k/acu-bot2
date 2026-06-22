// 1. 治療原則與穴位資料庫
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

// 【新增】2. 穴位位置指引資料庫
const POINT_LOCATIONS = {
  "曲泉": "🦵膝關節內側，屈膝時橫紋端凹陷處",
  "足臨泣": "🦶足背外側，第四、五蹠骨結合部前方凹陷中",
  "陽輔": "🦵小腿外側，外踝尖上四寸，腓骨前緣",
  "復溜": "🦵小腿內側，太谿穴直上二寸",
  "通谷": "🦶足外側，第五蹠趾關節前緣凹陷中",
  "束骨": "🦶足外側，第五蹠趾關節後緣凹陷中",
  "大都": "🦶足內側，第一蹠趾關節前緣凹陷中",
  "足三里": "🦵小腿前外側，犢鼻下三寸",
  "厲兌": "🦶足第二趾末節外側，距趾甲角0.1寸",
  "中衝": "✋手中指末節尖端中央",
  "支溝": "💪前臂背側，腕背橫紋上三寸",
  "天井": "💪臂外側，屈肘時尺骨鷹嘴上1寸凹陷中",
  "少衝": "✋手小指末節橈側，距趾甲角0.1寸",
  "陽谷": "✋手腕尺側，尺骨莖突與三角骨之間凹陷處",
  "小海": "💪肘內側，尺骨鷹嘴與肱骨內上髁之間凹陷處",
  "太淵": "✋手腕掌側橫紋橈側，橈動脈搏動處",
  "商陽": "✋手食指末節橈側，距趾甲角0.1寸",
  "二間": "✋手食指橈側，第二掌指關節前緣凹陷中",
  "俠溪": "🦶足背外側，第四、五趾間，趾蹼緣後方赤白肉際處",
  "行間": "🦶足背，第一、二趾間，趾蹼緣後方赤白肉際處",
  "至陰": "🦶足小趾末節外側，距趾甲角0.1寸",
  "湧泉": "🦶足底，屈趾時足心最凹陷處",
  "解溪": "🦶足背與小腿交界處的橫紋中央凹陷中",
  "商丘": "🦶足內踝前下方凹陷中",
  "中渚": "✋手背，第四、五掌骨小頭後緣之間凹陷中",
  "大陵": "✋手腕掌側橫紋中央，兩筋之間",
  "後溪": "✋手掌尺側，微握拳，第五掌指關節後的遠側掌橫紋頭赤白肉際",
  "神門": "✋手腕掌側橫紋尺側端，尺側腕屈肌腱的橈側凹陷處",
  "曲池": "💪肘橫紋外側端，屈肘時尺澤與肱骨外上髁連線中點",
  "尺澤": "💪肘橫紋中，肱二頭肌腱橈側凹陷處"
};

// 3. 智能文字解析 (Direct Query)
function parseDirectQuery(text) {
  const gender = text.includes('女') ? '女' : '男';

  let pulse = null;
  if (text.includes('人迎')) pulse = '人迎';
  else if (text.includes('脈口')) pulse = '脈口';

  let level = null;
  if (text.includes('一盛')) level = '一';
  else if (text.includes('二盛')) level = '二';
  else if (text.includes('三盛')) level = '三';

  let zao = '否'; 
  const notZaoRegex = /(不|非|無|沒|沒有|不會).{0,3}躁/; 
  if (notZaoRegex.test(text)) {
    zao = '否';
  } else if (text.includes('躁')) {
    zao = '是';
  }

  if (pulse && level) {
    let principle = "";
    if (pulse === '人迎') {
      if (zao === '否') {
        if (level === '一') principle = "補肝瀉膽";
        if (level === '二') principle = "補腎瀉膀胱";
        if (level === '三') principle = "補脾瀉胃";
      } else { 
        if (level === '一') principle = "補心包瀉三焦";
        if (level === '二') principle = "補心瀉小腸";
        if (level === '三') principle = "補肺瀉大腸";
      }
    } else if (pulse === '脈口') {
      if (zao === '否') {
        if (level === '一') principle = "補膽瀉肝";
        if (level === '二') principle = "補膀胱瀉腎";
        if (level === '三') principle = "補胃瀉脾";
      } else { 
        if (level === '一') principle = "補三焦瀉心包";
        if (level === '二') principle = "補小腸瀉心";
        if (level === '三') principle = "補大腸瀉肺";
      }
    }
    return `${gender},${pulse},${zao},${principle}`;
  }
  return null;
}

// 4. 動態產生問題選單的函式 
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

// 5. 計算最終結果 (並附帶取穴 Quick Reply)
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

  // 抓取這次用到的所有穴位名稱 (為了稍後的「取穴位置」按鈕)
  let pointNames = [];
  for (const pt in POINT_LOCATIONS) {
     if (method.bu.includes(pt) || method.xie.includes(pt)) {
         pointNames.push(pt);
     }
  }
  const pointsStr = pointNames.join(',');

  // 女性左右反轉
  if (gender === '女') {
    buText = buText.replace(/左/g, '__L__').replace(/右/g, '左').replace(/__L__/g, '右');
    xieText = xieText.replace(/左/g, '__L__').replace(/右/g, '左').replace(/__L__/g, '右');
  }

  let resultText = `📋 【針灸治療方針建議】\n────────────\n👤 患者：${gender}性\n🔍 辨證：${pulse} / ${zao === '是' ? '為躁' : '非躁'} -> ${principle}\n────────────\n🟢 補法:\n${buText}\n\n🔴 瀉法:\n${xieText}`;

  // 回傳結果，並在底部加入「查看取穴位置」的捷徑按鈕！
  return { 
    type: 'text', 
    text: resultText,
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

// 6. Vercel 主程式入口
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

    // --- 使用者在群組打字時的判斷 ---
    if (lineEvent.type === 'message' && lineEvent.message.type === 'text') {
      const userMessage = lineEvent.message.text.trim();
      
      // 邏輯 1: 使用者想查位置
      if (userMessage.startsWith('取穴') || userMessage.startsWith('位置')) {
        if (userMessage === '取穴' || userMessage === '位置') {
            // 防呆提示：解釋如何查前一次的紀錄
            replyMessages = [{
               type: 'text',
               text: '💡 提示：為了準確回覆，請在收到「治療方針建議」後，直接點擊下方出現的「📍 查看取穴位置」泡泡按鈕。\n\n您也可以直接加上名稱來查詢，例如輸入：「取穴 曲泉」'
            }];
        } else {
            // 手動輸入穴位名稱查詢
            let foundPoints = [];
            for (const pt in POINT_LOCATIONS) {
              if (userMessage.includes(pt)) foundPoints.push(pt);
            }
            if (foundPoints.length > 0) {
                let locText = "📍 【穴位位置指引】\n────────────\n";
                foundPoints.forEach(pt => { locText += `【${pt}】\n${POINT_LOCATIONS[pt]}\n\n`; });
                replyMessages = [{ type: 'text', text: locText.trim() }];
            } else {
                replyMessages = [{ type: 'text', text: '系統中目前沒有這個穴位的資料喔。' }];
            }
        }
      } else {
        // 邏輯 2: 嘗試「智能解析」這串長文字 (Direct Query)
        const directResultStr = parseDirectQuery(userMessage);

        if (directResultStr) {
          replyMessages = [calculateTreatmentResult(directResultStr)];
        } 
        // 邏輯 3: 什麼都沒猜中，退回泡泡點擊模式
        else if (userMessage.includes('選穴') || userMessage.includes('評估')) {
          replyMessages = [getQuickReplyTemplate(0)];
        }
      }
    } 
    // --- 使用者點選按鈕時的判斷 ---
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
      // 【新增】接收「查看取穴位置」的按鈕點擊事件
      else if (postbackData.get('action') === 'loc') {
        const pts = postbackData.get('pts').split(',');
        let locText = "📍 【穴位位置指引】\n────────────\n";
        pts.forEach(pt => {
           if (pt && POINT_LOCATIONS[pt]) {
              locText += `【${pt}】\n${POINT_LOCATIONS[pt]}\n\n`;
           }
        });
        replyMessages = [{ type: 'text', text: locText.trim() }];
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
