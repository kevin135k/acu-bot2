// ==========================================
// 1. 醫療資料庫 (整合湯液與終始針法)
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
// 2. 智能文字解析 (Direct Query)
// ==========================================
function parseDirectQuery(text) {
  const gender = text.includes('女') ? 'female' : 'male';

  // 嘗試解析「湯液針法」
  const tangyePulses = ['心火', '肝木', '腎水', '肺金', '脾土', '命門'];
  const tangyePulse = tangyePulses.find(p => text.includes(p));
  let tangyeState = null;
  if (text.includes('太過')) tangyeState = '太過';
  else if (text.includes('不足')) tangyeState = '不足';

  if (tangyePulse && tangyeState) {
    // 回傳格式: 性別,系統,脈位,狀態
    return `${gender},湯液,${tangyePulse},${tangyeState}`;
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
    // 回傳格式: 性別,系統,脈位,躁,治療原則 (長度 5)
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
    text = "2. 請選擇脈相系統？";
    options = [{ label: "獨異脈 (湯液)", value: "湯液" }, { label: "陰陽不和 (終始)", value: "終始" }];
  } else if (step === 2) {
    if (ansArr[1] === '湯液') {
      text = "3. 哪個脈位獨異？";
      options = ['心火', '肝木', '腎水', '肺金', '脾土', '命門'].map(v => ({ label: v, value: v }));
    } else {
      text = "3. 請問脈位狀態？";
      options = [{ label: "人迎", value: "人迎" }, { label: "脈口", value: "脈口" }];
    }
  } else if (step === 3) {
    if (ansArr[1] === '湯液') {
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

  if (!rule) return { type: 'text', text: '系統查無資料，請重新啟動評估。' };

  const formatPoint = (actionData) => {
    const sideText = actionData.side === 'left' ? '左' : '右';
    const pointName = actionData.alias ? `${actionData.point}/${actionData.alias}` : actionData.point;
    return `${sideText} ${pointName}\n  (${actionData.desc})`;
  };

  const genderStr = gender === 'female' ? '女' : '男';

  let resultText = `📋 【${title} 處方】\n────────────\n👤 病患：${genderStr}性 | ${methodTitle}\n────────────\n\n`;
  resultText += `🟢 補法 (Tonify):\n${formatPoint(rule.tonify)}\n\n`;
  resultText += `🔴 瀉法 (Sedate):\n${formatPoint(rule.sedate)}`;

  // 抓取這次用到的穴位，用於 Quick Reply 捷徑
  let pointNames = [];
  [rule.tonify, rule.sedate].forEach(action => {
     if (action.point) pointNames.push(action.point);
     if (action.alias) pointNames.push(action.alias);
  });
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
            let foundPoints = [];
            for (const pt in POINT_LOCATIONS) {
              if (userMessage.includes(pt)) foundPoints.push(pt);
            }
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

        // 判斷是否已經抵達該系統的終點
        if ((system === '湯液' && nextQuestionIndex === 4) || (system === '終始' && nextQuestionIndex === 5)) {
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
