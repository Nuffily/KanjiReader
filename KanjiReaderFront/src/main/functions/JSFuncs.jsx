


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
  const cleanInput = input.trim();

  // 1. Полное совпадение — всегда истина
  if (cleanInput === romaji) return true;

  const trailingRomaji = getTrailingKanaRomaji(kanji);

  if (trailingRomaji.length > 0) {
    // Вырезаем корень, относящийся к кандзи (например, "tabe" для 食べる)
    const kanjiRomajiPart = romaji.slice(0, -trailingRomaji.length);

    // Если ввод даже не начинается с правильного корня кандзи — сразу бан
    if (!cleanInput.startsWith(kanjiRomajiPart)) return false;

    // Вытаскиваем то, что пользователь ввёл ВМЕСТО хвоста с каной
    const userTrailingInput = cleanInput.slice(kanjiRomajiPart.length);

    // Если хвост пустой (пользователь ввёл только корень "tabe") — это легально
    if (userTrailingInput.length === 0) return true;

    // Проверяем, что введённый хвост является честным НАЧАЛОМ правильного ромадзи-хвоста.
    // Например, для "ru" легально ввести "r", но введение "x" или "run" — это бан.
    return trailingRomaji.startsWith(userTrailingInput);
  }

  return false;
}