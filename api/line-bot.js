// 強制更新註解 20260618
// ==========================================
// 1. 醫療資料庫 (完全同步自前端 React 工具)
// ==========================================

const POINT_LOCATIONS = {
  '少府': { icon: '✋', text: '手掌面，第4、5掌骨之間，握拳時小指尖處。' },
  '勞宮': { icon: '✋', text: '手掌心，第2、3掌骨之間，握拳時中指尖處。' },
  '少衝': { icon: '✋', text: '小指末節橈側，距指甲角0.1寸。' },
  '中衝': { icon: '✋', text: '中指末節尖端中央。' },
  '前谷': { icon: '✋', text: '手尺側，微握拳，第5指掌關節前尺側，橫紋頭赤白肉際。' },
  '後溪': { icon: '✋', text: '手尺側，微握拳，第5指掌關節後尺側，橫紋頭赤白肉際。' },
  '液門': { icon: '✋', text: '手背，第4、5指間，指蹼緣後方赤白肉際。' },
  '中渚': { icon: '✋', text: '手背，第4、5掌骨間，第4掌指關節後上方凹陷處。' },
  '商陽': { icon: '✋', text: '食指末節橈側，距指甲角0.1寸。' },
  '二間': { icon: '✋', text: '食指本節（第2掌指關節）前，橈側凹陷處。' },
  '經渠': { icon: '💪', text: '前臂掌面橈側，橈骨莖突與橈動脈之間。' },
  '陽溪': { icon: '💪', text: '腕背橫紋橈側，手拇指向上翹起時，在伸拇短肌腱與伸拇長肌腱之間的凹陷中。' },
  '支溝': { icon: '💪', text: '前臂背側，陽池穴上3寸，尺骨與橈骨之間。' },
  '天井': { icon: '💪', text: '臂外側，屈肘時，當肘尖直上1寸凹陷處。' },
  '陽谷': { icon: '💪', text: '手腕尺側，尺骨莖突與三角骨之間的凹陷處。' },
  '小海': { icon: '💪', text: '肘內側，尺骨鷹嘴與肱骨內上髁之間凹陷處。' },
  '太淵': { icon: '💪', text: '腕掌側橫紋橈側，橈動脈搏動處。' },
  '曲池': { icon: '💪', text: '肘橫紋外側端，屈肘，當尺澤與肱骨外上髁連線中點。' },
  '尺澤': { icon: '💪', text: '肘橫紋中，肱二頭肌腱橈側凹陷處。' },
  '神門': { icon: '💪', text: '腕部腕掌橫紋上，尺側腕屈肌腱橈側凹陷處。' },
  '大陵': { icon: '💪', text: '腕掌橫紋的中點處，當掌長肌腱與橈側腕屈肌腱之間。' },
  '大敦': { icon: '🦶', text: '足大趾末節外側，距指甲角0.1寸。' },
  '足竅陰': { icon: '🦶', text: '足第4趾末節外側，距指甲角0.1寸。' },
  '太白': { icon: '🦶', text: '足內側緣，足大趾本節（第1跖趾關節）後下方赤白肉際凹陷處。' },
  '陷谷': { icon: '🦶', text: '足背，第2、3跖骨結合部前方凹陷處。' },
  '足臨泣': { icon: '🦶', text: '足背外側，第4、5跖骨底結合部前方，第5長伸肌腱外側凹陷處。' },
  '俠溪': { icon: '🦶', text: '足背外側，第4、5趾間，趾蹼緣後方赤白肉際。' },
  '通谷': { icon: '🦶', text: '足外側，足小趾本節（第5跖趾關節）前下方赤白肉際凹陷處。' },
  '束骨': { icon: '🦶', text: '足外側，足小趾本節（第5跖趾關節）後下方赤白肉際凹陷處。' },
  '至陰': { icon: '🦶', text: '足小趾末節外側，距指甲角0.1寸。' },
  '大都': { icon: '🦶', text: '足內側緣，足大趾本節（第1跖趾關節）前下方赤白肉際凹陷處。' },
  '厲兌': { icon: '🦶', text: '足第2趾末節外側，距指甲角0.1寸。' },
  '解溪': { icon: '🦶', text: '足背與小腿交界處的橫紋中央凹陷處，拇長伸肌腱與趾長伸肌腱之間。' },
  '行間': { icon: '🦶', text: '足背，第1、2趾間，趾蹼緣後方赤白肉際。' },
  '湧泉': { icon: '🦶', text: '足底，卷足時足前部凹陷處。' },
  '商丘': { icon: '🦶', text: '足內踝前下方凹陷中。' },
  '陰谷': { icon: '🦵', text: '膕窩內側，屈膝時，當半腱肌肌腱與半膜肌肌腱之間。' },
  '委中': { icon: '🦵', text: '膕橫紋中點。' },
  '曲泉': { icon: '🦵', text: '膝內側，屈膝，當膝關節內側面橫紋內側端，股骨內側髁的後緣，半腱肌、半膜肌止端的前緣凹陷處。' },
  '陽輔': { icon: '🦵', text: '小腿外側，外踝尖上4寸，腓骨前緣稍前方。' },
  '復溜': { icon: '🦵', text: '小腿內側，太溪直上2寸，跟腱的前方。' },
  '足三里': { icon: '🦵', text: '小腿前外側，外膝眼下3寸，脛骨前緣一橫指。' }
};

const TANGYE_RULES = {
  male: {
    '心火': { '太過': { sedate: { point: '少府', side: 'left', desc: '向心、深刺45度、陰數、逆轉' }, tonify: { point: '前谷', side: 'right', desc: '遠心、淺刺15度、陽數、順轉' } }, '不足': { tonify: { point: '少府', side: 'left', desc: '遠心、淺刺15度、陽數、順轉' }, sedate: { point: '前谷', side: 'right', desc: '向心、深刺45度、陰數、逆轉' } } },
    '肝木': { '太過': { sedate: { point: '大敦', side: 'right', desc: '向心、深刺45度、陰數、逆轉' }, tonify: { point: '足竅陰', side: 'left', desc: '遠心、淺刺15度、陽數、順轉' } }, '不足': { tonify: { point: '大敦', side: 'right', desc: '遠心、淺刺15度、陽數、順轉' }, sedate: { point: '足竅陰', side: 'left', desc: '向心、深刺45度、陰數、逆轉' } } },
    '腎水': { '太過': { sedate: { point: '陰谷', side: 'right', desc: '向心、深刺45度、陰數、逆轉' }, tonify: { point: '委中', side: 'left', desc: '遠心、淺刺15度、陽數、順轉' } }, '不足': { tonify: { point: '陰谷', side: 'right', desc: '遠心、淺刺15度、陽數、順轉' }, sedate: { point: '委中', side: 'left', desc: '向心、深刺45度、陰數、逆轉' } } },
    '肺金': { '太過': { sedate: { point: '經渠', side: 'left', desc: '向心、深刺45度、陰數、逆轉' }, tonify: { point: '陽溪', side: 'right', desc: '遠心、淺刺15度、陽數、順轉' } }, '不足': { tonify: { point: '經渠', side: 'left', desc: '遠心、淺刺15度、陽數、順轉' }, sedate: { point: '陽溪', side: 'right', desc: '向心、深刺45度、陰數、逆轉' } } },
    '脾土': { '太過': { sedate: { point: '太白', side: 'right', desc: '向心、深刺45度、陰數、逆轉' }, tonify: { point: '陷谷', side: 'left', desc: '遠心、淺刺15度、陽數、順轉' } }, '不足': { tonify: { point: '太白', side: 'right', desc: '遠心、淺刺15度、陽數、順轉' }, sedate: { point: '陷谷', side: 'left', desc: '向心、深刺45度、陰數、逆轉' } } },
    '命門': { '太過': { sedate: { point: '勞宮', side: 'left', desc: '向心、深刺45度、陰數、逆轉' }, tonify: { point: '液門', side: 'right', desc: '遠心、淺刺15度、陽數、順轉' } }, '不足': { tonify: { point: '勞宮', side: 'left', desc: '遠心、淺刺15度、陽數、順轉' }, sedate: { point: '液門', side: 'right', desc: '遠心、淺刺15度、陽數、順轉' } } }
  },
  female: {
    '心火': { '太過': { sedate: { point: '少府', side: 'right', desc: '向心、深刺45度、陰數、逆轉' }, tonify: { point: '前谷', side: 'left', desc: '遠心、淺刺15度、陽數、順轉' } }, '不足': { tonify: { point: '少府', side: 'right', desc: '遠心、淺刺15度、陽數、順轉' }, sedate: { point: '前谷', side: 'left', desc: '向心、深刺45度、陰數、逆轉' } } },
    '肝木': { '太過': { sedate: { point: '大敦', side: 'left', desc: '向心、深刺45度、陰數、逆轉' }, tonify: { point: '足竅陰', side: 'right', desc: '遠心、淺刺15度、陽數、順轉' } }, '不足': { tonify: { point: '大敦', side: 'left', desc: '遠心、淺刺15度、陽數、順轉' }, sedate: { point: '足竅陰', side: 'right', desc: '向心、深刺45度、陰數、逆轉' } } },
    '腎水': { '太過': { sedate: { point: '陰谷', side: 'left', desc: '向心、深刺45度、陰數、逆轉' }, tonify: { point: '委中', side: 'right', desc: '遠心、淺刺15度、陽數、順轉' } }, '不足': { tonify: { point: '陰谷', side: 'left', desc: '遠心、淺刺15度、陽數、順轉' }, sedate: { point: '委中', side: 'right', desc: '向心、深刺45度、陰數、逆轉' } } },
    '肺金': { '太過': { sedate: { point: '經渠', side: 'right', desc: '向心、深刺45度、陰數、逆轉' }, tonify: { point: '陽溪', side: 'left', desc: '遠心、淺刺15度、陽數、順轉' } }, '不足': { tonify: { point: '經渠', side: 'right', desc: '遠心、淺刺15度、陽數、順轉' }, sedate: { point: '陽溪', side: 'left', desc: '向心、深刺45度、陰數、逆轉' } } },
    '脾土': { '太過': { sedate: { point: '太白', side: 'left', desc: '向心、深刺45度、陰數、逆轉' }, tonify: { point: '陷谷', side: 'right', desc: '遠心、淺刺15度、陽數、順轉' } }, '不足': { tonify: { point: '太白', side: 'left', desc: '遠心、淺刺15度、陽數、順轉' }, sedate: { point: '陷谷', side: 'right', desc: '向心、深刺45度、陰數、逆轉' } } },
    '命門': { '太過': { sedate: { point: '勞宮', side: 'right', desc: '向心、深刺45度、陰數、逆轉' }, tonify: { point: '液門', side: 'left', desc: '遠心、淺刺15度、陽數、順轉' } }, '不足': { tonify: { point: '勞宮', side: 'right', desc: '遠心、淺刺15度、陽數、順轉' }, sedate: { point: '液門', side: 'left', desc: '遠心、淺刺15度、陽數、順轉' } } }
  }
};

const ZHONGSHI_RULES = {
  male: {
    '人迎一盛（補肝瀉膽）': { tonify: { point: '曲泉', side: 'right', desc: '遠心、淺刺15度、陽數、順轉' }, sedate: { point: '足臨泣', alias: '陽輔', side: 'left', desc: '向心、深刺45度、陰數、逆轉' } },
    '人迎二盛（補腎瀉膀胱）': { tonify: { point: '復溜', side: 'right', desc: '遠心、淺刺15度、陽數、順轉' }, sedate: { point: '通谷', alias: '束骨', side: 'left', desc: '向心、深刺45度、陰數、逆轉' } },
    '人迎三盛（補脾瀉胃）': { tonify: { point: '大都', side: 'right', desc: '遠心、淺刺15度、陽數、順轉' }, sedate: { point: '足三里', alias: '厲兌', side: 'left', desc: '向心、深刺45度、陰數、逆轉' } },
    '人迎一盛而躁（補心包瀉三焦）': { tonify: { point: '中衝', side: 'left', desc: '遠心、淺刺15度、陽數、順轉' }, sedate: { point: '支溝', alias: '天井', side: 'right', desc: '向心、深刺45度、陰數、逆轉' } },
    '人迎二盛而躁（補心瀉小腸）': { tonify: { point: '少衝', side: 'left', desc: '遠心、淺刺15度、陽數、順轉' }, sedate: { point: '陽谷', alias: '小海', side: 'right', desc: '向心、深刺45度、陰數、逆轉' } },
    '人迎三盛而躁（補肺瀉大腸）': { tonify: { point: '太淵', side: 'left', desc: '遠心、淺刺15度、陽數、順轉' }, sedate: { point: '商陽', alias: '二間', side: 'right', desc: '向心、深刺45度、陰數、逆轉' } },
    '脈口一盛（補膽瀉肝）': { tonify: { point: '足臨泣', alias: '俠溪', side: 'right', desc: '向心、淺刺15度、吐氣進針、陽數、順轉' }, sedate: { point: '行間', side: 'left', desc: '遠心、深刺45度、吐氣進針、陰數、逆轉' } },
    '脈口二盛（補膀胱瀉腎）': { tonify: { point: '通谷', alias: '至陰', side: 'right', desc: '向心、淺刺15度、吐氣進針、陽數、順轉' }, sedate: { point: '湧泉', side: 'left', desc: '遠心、深刺45度、吐氣進針、陰數、逆轉' } },
    '脈口三盛（補胃瀉脾）': { tonify: { point: '足三里', alias: '解溪', side: 'right', desc: '向心、淺刺15度、吐氣進針、陽數、順轉' }, sedate: { point: '商丘', side: 'left', desc: '遠心、深刺45度、吐氣進針、陰數、逆轉' } },
    '脈口一盛而躁（補三焦瀉心包）': { tonify: { point: '支溝', alias: '中渚', side: 'left', desc: '向心、淺刺15度、吐氣進針、陽數、順轉' }, sedate: { point: '大陵', side: 'right', desc: '遠心、深刺45度、吐氣進針、陰數、逆轉' } },
    '脈口二盛而躁（補小腸瀉心）': { tonify: { point: '陽谷', alias: '後溪', side: 'left', desc: '向心、淺刺15度、吐氣進針、陽數、順轉' }, sedate: { point: '神門', side: 'right', desc: '遠心、深刺45度、吐氣進針、陰數、逆轉' } },
    '脈口三盛而躁（補大腸瀉肺）': { tonify: { point: '商陽', alias: '曲池', side: 'left', desc: '向心、淺刺15度、吐氣進針、陽數、順轉' }, sedate: { point: '尺澤', side: 'right', desc: '遠心、深刺45度、吐氣進針、陰數、逆轉' } }
  },
  female: {
    '人迎一盛（補肝瀉膽）': { tonify: { point: '曲泉', side: 'left', desc: '遠心、淺刺15度、陽數、順轉' }, sedate: { point: '足臨泣', alias: '陽輔', side: 'right', desc: '向心、深刺45度、陰數、逆轉' } },
    '人迎二盛（補腎瀉膀胱）': { tonify: { point: '復溜', side: 'left', desc: '遠心、淺刺15度、陽數、順轉' }, sedate: { point: '通谷', alias: '束骨', side: 'right', desc: '向心、深刺45度、陰數、逆轉' } },
    '人迎三盛（補脾瀉胃）': { tonify: { point: '大都', side: 'left', desc: '遠心、淺刺15度、陽數、順轉' }, sedate: { point: '足三里', alias: '厲兌', side: 'right', desc: '向心、深刺45度、陰數、逆轉' } },
    '人迎一盛而躁（補心包瀉三焦）': { tonify: { point: '中衝', side: 'right', desc: '遠心、淺刺15度、陽數、順轉' }, sedate: { point: '支溝', alias: '天井', side: 'left', desc: '向心、深刺45度、陰數、逆轉' } },
    '人迎二盛而躁（補心瀉小腸）': { tonify: { point: '少衝', side: 'right', desc: '遠心、淺刺15度、陽數、順轉' }, sedate: { point: '陽谷', alias: '小海', side: 'left', desc: '向心、深刺45度、陰數、逆轉' } },
    '人迎三盛而躁（補肺瀉大腸）': { tonify: { point: '太淵', side: 'right', desc: '遠心、淺刺15度、陽數、順轉' }, sedate: { point: '商陽', alias: '二間', side: 'left', desc: '向心、深刺45度、陰數、逆轉' } },
    '脈口一盛（補膽瀉肝）': { tonify: { point: '足臨泣', alias: '俠溪', side: 'left', desc: '向心、淺刺15度、吐氣進針、陽數、順轉' }, sedate: { point: '行間', side: 'right', desc: '遠心、深刺45度、吐氣進針、陰數、逆轉' } },
    '脈口二盛（補膀胱瀉腎）': { tonify: { point: '通谷', alias: '至陰', side: 'left', desc: '向心、淺刺15度、吐氣進針、陽數、順轉' }, sedate: { point: '湧泉', side: 'right', desc: '遠心、深刺45度、吐氣進針、陰數、逆轉' } },
    '脈口三盛（補胃瀉脾）': { tonify: { point: '足三里', alias: '解溪', side: 'left', desc: '向心、淺刺15度、吐氣進針、陽數、順轉' }, sedate: { point: '商丘', side: 'right', desc: '遠心、深刺45度、吐氣進針、陰數、逆轉' } },
    '脈口一盛而躁（補三焦瀉心包）': { tonify: { point: '支溝', alias: '中渚', side: 'right', desc: '向心、淺刺15度、吐氣進針、陽數、順轉' }, sedate: { point: '大陵', side: 'left', desc: '遠心、深刺45度、吐氣進針、陰數、逆轉' } },
    '脈口二盛而躁（補小腸瀉心）': { tonify: { point: '陽谷', alias: '後溪', side: 'right', desc: '向心、淺刺15度、吐氣進針、陽數、順轉' }, sedate: { point: '神門', side: 'left', desc: '遠心、深刺45度、吐氣進針、陰數、逆轉' } },
    '脈口三盛而躁（補大腸瀉肺）': { tonify: { point: '商陽', alias: '曲池', side: 'right', desc: '向心、淺刺15度、吐氣進針、陽數、順轉' }, sedate: { point: '尺澤', side: 'left', desc: '遠心、深刺45度、吐氣進針、陰數、逆轉' } }
  }
};


// ==========================================
// 2. 動態問答產生器 (使用 LINE Quick Reply 解決按鈕數量限制)
// ==========================================

function getQuestionTemplate(step, previousAnswers = "") {
  const ansArr = previousAnswers ? previousAnswers.split(',') : [];
  let text = "";
  let options = []; // 選項陣列 { label, value }

  if (step === 0) {
    text = "第一步：請問病人性別？";
    options = [
      { label: "👨 男", value: "male" },
      { label: "👩 女", value: "female" }
    ];
  } else if (step === 1) {
    text = "第二步：請選擇脈相系統？";
    options = [
      { label: "獨異 (湯液針法)", value: "湯液" },
      { label: "陰陽不平衡 (終始針法)", value: "終始" }
    ];
  } else if (step === 2) {
    if (ansArr[1] === "湯液") {
      text = "第三步 (湯液)：哪個脈位獨異？";
      options = ["心火", "肝木", "腎水", "肺金", "脾土", "命門"].map(v => ({ label: v, value: v }));
    } else {
      text = "第三步 (終始)：脈位狀態？";
      options = [{ label: "人迎", value: "人迎" }, { label: "脈口", value: "脈口" }];
    }
  } else if (step === 3) {
    if (ansArr[1] === "湯液") {
      text = "第四步 (湯液)：該脈位狀態？";
      options = [{ label: "太過", value: "太過" }, { label: "不足", value: "不足" }];
    } else {
      text = "第四步 (終始)：是否為躁？";
      options = [{ label: "是 (為躁)", value: "yes" }, { label: "否 (非躁)", value: "no" }];
    }
  } else if (step === 4 && ansArr[1] === "終始") {
    text = "第五步 (終始)：治療原則？";
    const pulse = ansArr[2];
    const agitated = ansArr[3];

    if (pulse === '人迎') {
      if (agitated === 'no') {
        options = ['人迎一盛（補肝瀉膽）', '人迎二盛（補腎瀉膀胱）', '人迎三盛（補脾瀉胃）'].map(v => ({ label: v, value: v }));
      } else {
        options = ['人迎一盛而躁（補心包瀉三焦）', '人迎二盛而躁（補心瀉小腸）', '人迎三盛而躁（補肺瀉大腸）'].map(v => ({ label: v, value: v }));
      }
    } else {
      if (agitated === 'no') {
        options = ['脈口一盛（補膽瀉肝）', '脈口二盛（補膀胱瀉腎）', '脈口三盛（補胃瀉脾）'].map(v => ({ label: v, value: v }));
      } else {
        options = ['脈口一盛而躁（補三焦瀉心包）', '脈口二盛而躁（補小腸瀉心）', '脈口三盛而躁（補大腸瀉肺）'].map(v => ({ label: v, value: v }));
      }
    }
  }

  // 將選項轉換為 LINE Quick Reply 格式 (下方浮動按鈕)
  const quickReplyItems = options.map(opt => {
    const newAnswers = previousAnswers ? `${previousAnswers},${opt.value}` : opt.value;
    return {
      type: "action",
      action: {
        type: "postback",
        label: opt.label.substring(0, 20), // LINE 限制最多 20 字
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


// ==========================================
// 3. 計算結果與文字排版生成
// ==========================================

function calculateResult(ansString) {
  const ansArr = ansString.split(',');
  const gender = ansArr[0];
  const system = ansArr[1];

  let rule = null;
  let title = "";
  let methodTitle = "";

  // 根據選擇的系統抓取對應的資料庫
  if (system === '湯液') {
    const pulse = ansArr[2];
    const state = ansArr[3];
    rule = TANGYE_RULES[gender][pulse][state];
    title = "湯液針法 處方";
    methodTitle = `${pulse} ${state}`;
  } else {
    const treatment = ansArr[4]; 
    rule = ZHONGSHI_RULES[gender][treatment];
    title = "終始針法 處方";
    methodTitle = treatment;
  }

  if (!rule) return { type: 'text', text: '系統查無資料，請重新啟動評估。' };

  // 輔助函式：將單一穴位的文字說明組合起來 (包含定位提示)
  const formatPoint = (actionData) => {
    const sideText = actionData.side === 'left' ? '左' : '右';
    const pointName = actionData.alias ? `${actionData.point}/${actionData.alias}` : actionData.point;
    let text = `${sideText} ${pointName}\n   ${actionData.desc}`;
    
    // 加上部位提示 (若有多個名字，用斜線拆開去對照庫找)
    const searchNames = [actionData.point];
    if (actionData.alias) searchNames.push(actionData.alias);
    
    searchNames.forEach(n => {
      n.split('/').forEach(subName => {
        if (POINT_LOCATIONS[subName]) {
          text += `\n   📍 ${subName}: ${POINT_LOCATIONS[subName].icon} ${POINT_LOCATIONS[subName].text}`;
        }
      });
    });
    return text;
  };

  const genderStr = gender === 'male' ? '男' : '女';
  
  // 組合最終傳送給使用者的文字
  let resText = `📋 【${title}】\n────────────\n👤 病患：${genderStr}性 | ${methodTitle}\n────────────\n\n`;
  resText += `🟢 補法 (Tonify):\n${formatPoint(rule.tonify)}\n\n`;
  resText += `🔴 瀉法 (Sedate):\n${formatPoint(rule.sedate)}`;

  return { type: 'text', text: resText };
}


// ==========================================
// 4. Webhook 核心接收與回覆邏輯
// ==========================================

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const body = JSON.parse(event.body);

    if (body.events && body.events.length > 0) {
      const lineEvent = body.events[0];
      const replyToken = lineEvent.replyToken;
      
      // 有些系統驗證會送假訊息，若無 token 直接略過
      if (!replyToken || replyToken === '00000000000000000000000000000000') {
        return { statusCode: 200, body: 'OK' };
      }

      let replyMessages = [];

      // 觸發條件一：在群組輸入「評估」、「選穴」或「針灸」
      if (lineEvent.type === 'message' && lineEvent.message.type === 'text') {
        const userMessage = lineEvent.message.text.trim();
        if (userMessage.includes('選穴') || userMessage.includes('評估') || userMessage.includes('針灸')) {
          replyMessages = [getQuestionTemplate(0)];
        }
      } 
      
      // 觸發條件二：使用者點選 Quick Reply 按鈕 (隱藏回傳 Postback)
      else if (lineEvent.type === 'postback') {
        const postbackData = new URLSearchParams(lineEvent.postback.data);
        
        if (postbackData.get('action') === 'survey') {
          const qIndex = parseInt(postbackData.get('q'));
          const ansString = postbackData.get('ans');
          const ansArr = ansString.split(',');
          const system = ansArr[1]; // 取得使用者選擇的系統

          // 判斷是否已經問完最後一題
          if ((system === '湯液' && qIndex === 4) || (system === '終始' && qIndex === 5)) {
            // 已走完流程，輸出結果
            replyMessages = [calculateResult(ansString)];
          } else {
            // 還沒問完，繼續給下一題
            replyMessages = [getQuestionTemplate(qIndex, ansString)];
          }
        }
      }

      // 如果有訊息要回，打 LINE API
      if (replyMessages.length > 0) {
        await fetch('https://api.line.me/v2/bot/message/reply', {
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
      }
    }
    return { statusCode: 200, body: 'OK' };

  } catch (error) {
    console.error('Webhook Error:', error);
    return { statusCode: 500, body: 'Error' };
  }
};