import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const URLS = [
  'https://raw.githubusercontent.com/CanNuhlar/Turkce-Kelime-Listesi/master/turkce_kelime_listesi.txt',
  'https://raw.githubusercontent.com/mertemin/turkish-word-list/master/words.txt',
  'https://raw.githubusercontent.com/emrahcom/turkce_kelimeler/master/imla_kilavuzu.txt'
];

// Additional common Turkish everyday words and short words that might be missing from dictionaries
const SUPPLEMENTAL_WORDS = [
  'ev', 'su', 'at', 'ot', 'ay', 'ok', 'et', 'el', 'un', 'ak', 'al', 'ek', 'in', 'on', 'öz', 'uç', 'üç',
  'ben', 'sen', 'biz', 'siz', 'onlar', 'bu', 'şu', 'o', 'var', 'yok', 'çok', 'az', 'bir', 'iki', 'üç',
  'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz', 'on', 'yüz', 'bin', 'evet', 'hayır', 'lütfen',
  'merhaba', 'selam', 'teşekkür', 'sağol', 'günaydın', 'iyi', 'kötü', 'güzel', 'çirkin', 'büyük', 'küçük',
  'tamam', 'hadi', 'şimdi', 'sonra', 'önce', 'neden', 'nasıl', 'nerede', 'kim', 'hangi', 'kaç',
  'karpuz', 'makarna', 'ankara', 'istanbul', 'izmir', 'türkiye', 'bilgisayar', 'telefon', 'oyun',
  'bomba', 'patlama', 'fitil', 'puan', 'lider', 'şampiyon', 'dostluk', 'tatil', 'okul', 'ders',
  'kitap', 'defter', 'kalem', 'masa', 'sandalye', 'oda', 'kapı', 'pencere', 'çatı', 'bahçe', 'ağaç',
  'çiçek', 'güneş', 'deniz', 'kum', 'orman', 'dağ', 'nehir', 'göl', 'bulut', 'yağmur', 'kar', 'rüzgar'
];

async function main() {
  console.log('Fetching open Turkish wordlists...');
  const dict = new Set();

  for (const sw of SUPPLEMENTAL_WORDS) {
    dict.add(sw.toLocaleLowerCase('tr-TR'));
  }

  for (const url of URLS) {
    try {
      console.log(`Downloading: ${url}...`);
      const resp = await fetch(url);
      if (!resp.ok) {
        console.warn(`Failed to fetch ${url}: status ${resp.status}`);
        continue;
      }
      const text = await resp.text();
      for (const line of text.split(/\r?\n/)) {
        const clean = line.trim().toLocaleLowerCase('tr-TR');
        if (/^[abcçdefgğhıijklmnoöprsştuüvyz]{2,25}$/.test(clean)) {
          dict.add(clean);
        }
      }
    } catch (err) {
      console.error(`Error downloading from ${url}:`, err.message);
    }
  }

  console.log(`Base dictionary collected: ${dict.size} words.`);

  // Generate plurals (-lar / -ler) using vowel harmony for nouns
  console.log('Generating natural Turkish plurals (-lar/-ler)...');
  const baseList = Array.from(dict);
  let pluralsAdded = 0;
  for (const word of baseList) {
    // Exclude verbs ending with infinitive -mek / -mak
    if (!word.endsWith('mek') && !word.endsWith('mak') && word.length >= 2 && word.length <= 18) {
      const vowels = word.match(/[aıoueiöü]/g);
      if (vowels && vowels.length > 0) {
        const lastVowel = vowels[vowels.length - 1];
        const suffix = ['a', 'ı', 'o', 'u'].includes(lastVowel) ? 'lar' : 'ler';
        const plural = word + suffix;
        if (!dict.has(plural)) {
          dict.add(plural);
          pluralsAdded++;
        }
      }
    }
  }
  console.log(`Added ${pluralsAdded} plurals. Total vocabulary: ${dict.size} words.`);

  // Write compiled words.txt
  const dataDir = path.resolve(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const sortedWords = Array.from(dict).sort((a, b) => a.localeCompare(b, 'tr'));
  fs.writeFileSync(path.join(dataDir, 'words.txt'), sortedWords.join('\n'), 'utf-8');
  console.log(`Saved words.txt (${sortedWords.length} words).`);

  // Analyze syllables / letter clusters (2 and 3 letters)
  console.log('Extracting frequent syllables / letter combinations...');
  const syllableCounts = new Map();

  for (const word of sortedWords) {
    // Only check words length >= 3
    if (word.length < 3) continue;

    // Track seen syllables in THIS word to avoid counting multiple times per word
    const seen = new Set();

    // 2-letter combos
    for (let i = 0; i <= word.length - 2; i++) {
      const sub = word.substring(i, i + 2);
      seen.add(sub);
    }

    // 3-letter combos
    for (let i = 0; i <= word.length - 3; i++) {
      const sub = word.substring(i, i + 3);
      seen.add(sub);
    }

    for (const sub of seen) {
      syllableCounts.set(sub, (syllableCounts.get(sub) || 0) + 1);
    }
  }

  // Filter syllables that have vowels or are valid playable chunks
  const easy = [];
  const medium = [];
  const hard = [];

  for (const [syl, count] of syllableCounts.entries()) {
    // Must contain at least one vowel to be natural/playable
    if (!/[aıoueiöü]/.test(syl)) continue;
    // Prefer 2 or 3 letters
    if (syl.length < 2 || syl.length > 3) continue;

    const upper = syl.toLocaleUpperCase('tr-TR');

    // Kolay: appears in >= 180 words
    if (count >= 180) {
      easy.push({ syllable: upper, count });
    }
    // Orta: appears in 60-179 words
    else if (count >= 60 && count < 180) {
      medium.push({ syllable: upper, count });
    }
    // Zor: appears in 20-59 words
    else if (count >= 20 && count < 60) {
      hard.push({ syllable: upper, count });
    }
  }

  // Sort by popularity
  easy.sort((a, b) => b.count - a.count);
  medium.sort((a, b) => b.count - a.count);
  hard.sort((a, b) => b.count - a.count);

  console.log(`Extracted Syllables: Easy: ${easy.length}, Medium: ${medium.length}, Hard: ${hard.length}`);

  const syllablesOutput = {
    easy: easy.map(x => x.syllable),
    medium: medium.map(x => x.syllable),
    hard: hard.map(x => x.syllable)
  };

  fs.writeFileSync(path.join(dataDir, 'syllables.json'), JSON.stringify(syllablesOutput, null, 2), 'utf-8');
  console.log('Saved syllables.json successfully!');
}

main().catch(err => {
  console.error('Build dictionary error:', err);
  process.exit(1);
});
