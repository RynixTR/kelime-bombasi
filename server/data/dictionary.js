import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { turkishToLower, turkishToUpper, cleanTurkishWord } from '../utils/turkishString.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TurkishDictionary {
  constructor() {
    this.wordsSet = new Set();
    this.syllables = {
      easy: [],
      medium: [],
      hard: []
    };
    this.loaded = false;
  }

  load() {
    if (this.loaded) return;
    const wordsPath = path.join(__dirname, 'words.txt');
    const syllablesPath = path.join(__dirname, 'syllables.json');

    console.log('[Dictionary] Loading Turkish word list from disk...');
    const start = Date.now();

    if (fs.existsSync(wordsPath)) {
      const content = fs.readFileSync(wordsPath, 'utf-8');
      const lines = content.split(/\r?\n/);
      for (const line of lines) {
        const w = line.trim();
        if (w) this.wordsSet.add(w);
      }
    } else {
      console.error('[Dictionary] words.txt not found! Please run buildDictionary.js');
    }

    if (fs.existsSync(syllablesPath)) {
      const sylContent = fs.readFileSync(syllablesPath, 'utf-8');
      this.syllables = JSON.parse(sylContent);
    }

    this.loaded = true;
    console.log(`[Dictionary] Loaded ${this.wordsSet.size} words and ${
      this.syllables.easy.length + this.syllables.medium.length + this.syllables.hard.length
    } syllables in ${Date.now() - start}ms.`);
  }

  isValidWord(rawWord) {
    if (!rawWord) return false;
    const cleaned = cleanTurkishWord(rawWord);
    if (cleaned.length < 2) return false;
    return this.wordsSet.has(cleaned);
  }

  wordContainsSyllable(rawWord, syllable) {
    if (!rawWord || !syllable) return false;
    const cleanedWord = cleanTurkishWord(rawWord);
    const cleanedSyllable = cleanTurkishWord(syllable);
    return cleanedWord.includes(cleanedSyllable);
  }

  // Get a random syllable according to difficulty ('easy', 'medium', 'hard')
  getRandomSyllable(difficulty = 'easy', excludedSyllables = []) {
    let pool = this.syllables[difficulty];
    if (!pool || pool.length === 0) {
      pool = this.syllables.easy;
    }
    if (!pool || pool.length === 0) {
      // Fallback common Turkish syllables
      pool = ['KAR', 'LAR', 'TAN', 'GEL', 'BİL', 'KAP', 'YAZ', 'SON', 'DUR', 'GÖZ', 'KOR', 'YOL'];
    }

    // Filter out recently used if pool is large enough
    const filtered = pool.filter(s => !excludedSyllables.includes(s));
    const activePool = filtered.length > 5 ? filtered : pool;

    const randomIndex = Math.floor(Math.random() * activePool.length);
    return activePool[randomIndex];
  }
}

export const dictionary = new TurkishDictionary();
