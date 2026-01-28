
export function questIcon(type) {
  if (type === "CorrectPer1M" || type === "CorrectPer2M") return "時"
  else if (type === "Percent") return "率"
  else if (type === "InRow1M" || type === "InRow2M") return "列"
  else if (type === "CorrectSum") return "総"
  else return "那"
}

export function getLevel(x) {
  if (x < 0) throw new Error("x must be non-negative");

  const k = Math.ceil((1 + Math.sqrt(1 + 4 * x / 5)) / 2);

  return k - 1;
}

export function getRemainXP(x, k) {
  if (x < 0) throw new Error("x must be non-negative");

  const threshold = 5 * k * (k - 1);
  return x - threshold;
}

export function getMaxXPForLevel(level) {
  if (level < 0) throw new Error("level must be non-negative");

  const nextLevelMinXP = 5 * (level + 1) * level;
  return nextLevelMinXP;
}

export function getLevelXP(level) {
  return getMaxXPForLevel(level) - getMaxXPForLevel(level - 1);
}


const CLIENT_ID = "Ov23liOda3qqFTKeKow1";

export function loginGit() {
  window.location.assign("https://github.com/login/oauth/authorize?client_id=" + CLIENT_ID);
}

export function unlogin() {
  localStorage.removeItem("accessToken");
  window.location.reload();
}

export function getTimeRemaining(targetDateString) {
  const targetDate = new Date(targetDateString);
  const now = new Date();
  const diffMs = targetDate - now;

  if (diffMs <= 0) {
    return "00:00:00";
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const format = (num) => String(num).padStart(2, '0');

  return `${format(hours)}:${format(minutes)}:${format(seconds)}`;
}



function getTrailingKanaRomaji(word) {
  // Регулярное выражение для хираганы (U+3040–U+309F) и катаканы (U+30A0–U+30FF)
  const kanaRegex = /^[\u3040-\u309F\u30A0-\u30FF]$/;

  // Таблица ромадзи (базовые знаки + ёон, дакуон, хандакуон)
  const romajiMap = {
    // Хирагана
    'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
    'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
    'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
    'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
    'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
    'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
    'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
    'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
    'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
    'わ': 'wa', 'を': 'o', 'ん': 'n',
    // Ёон (смягчённые)
    'ゃ': 'ya', 'ゅ': 'yu', 'ょ': 'yo',
    // Дакуон (озвончение)
    'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
    'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
    'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
    'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
    // Хандакуон (приглушение)
    'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
    // Катакана (аналогично хирагане)
    'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
    'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
    'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
    'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
    'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
    'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
    'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
    'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',
    'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
    'ワ': 'wa', 'ヲ': 'o', 'ン': 'n',
    'ャ': 'ya', 'ュ': 'yu', 'ョ': 'yo',
    'ガ': 'ga', 'ギ': 'gi', 'グ': 'gu', 'ゲ': 'ge', 'ゴ': 'go',
    'ザ': 'za', 'ジ': 'ji', 'ズ': 'zu', 'ゼ': 'ze', 'ゾ': 'zo',
    'ダ': 'da', 'ヂ': 'ji', 'ヅ': 'zu', 'デ': 'de', 'ド': 'do',
    'バ': 'ba', 'ビ': 'bi', 'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo',
    'パ': 'pa', 'ピ': 'pi', 'プ': 'pu', 'ペ': 'pe', 'ポ': 'po'
  };

  const trailingKana = [];
  for (let i = word.length - 1; i >= 0; i--) {
    const char = word[i];
    if (kanaRegex.test(char)) {
      trailingKana.push(char);
    } else {
      break;
    }
  }

  const romajiParts = trailingKana
    .reverse()
    .map(char => romajiMap[char] || '');

  return romajiParts.join('');
}


export function checkReading(input, kanji, romaji) {

  if (input === romaji) return true
  else if (getTrailingKanaRomaji(kanji).length > 0 && romaji.slice(0, -getTrailingKanaRomaji(kanji).length) === input) return true
  else return false
}