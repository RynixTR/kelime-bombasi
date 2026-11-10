import { turkishToLower } from '../utils/turkishString.js';

// Common Turkish offensive words, slurs and vulgar terms to filter from nicknames and chat
const BLOCKED_TERMS = [
  'amk', 'aq', 'orospu', 'piç', 'pic', 'sik', 'siktir', 'yarrak', 'yarak',
  'amcık', 'amcik', 'göt', 'got', 'daşşak', 'dassak', 'tasak', 'taşak',
  'ibne', 'puşt', 'pust', 'pezevenk', 'kahpe', 'fahişe', 'fahise', 'oç', 'oc',
  'gavat', 'kancık', 'kancik', 'sürtük', 'surtuk', 'malafat', 'sikiş', 'sikis'
];

export function containsProfanity(text) {
  if (!text) return false;
  const normalized = turkishToLower(text)
    .replace(/[\s\-_0-9\.\,\*\!\?]/g, ''); // strip leetspeak numbers & separators
  
  for (const term of BLOCKED_TERMS) {
    if (normalized.includes(term)) {
      return true;
    }
  }
  return false;
}
