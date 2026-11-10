// Turkish string utilities with full Unicode and Turkish character handling
// Crucial for i/İ and ı/I differentiation

export function turkishToLower(str) {
  if (!str) return '';
  return str.toString().trim().toLocaleLowerCase('tr-TR');
}

export function turkishToUpper(str) {
  if (!str) return '';
  return str.toString().trim().toLocaleUpperCase('tr-TR');
}

// Clean and sanitize a word input: keep only Turkish alphabet letters
export function cleanTurkishWord(input) {
  if (!input) return '';
  const lower = turkishToLower(input);
  // Match standard Turkish alphabet: a-z plus ç, ğ, ı, ö, ş, ü
  return lower.replace(/[^abcçdefgğhıijklmnoöprsştuüvyz]/g, '');
}

// Clean nickname: strip HTML/scripts, trim, allow letters and numbers
export function sanitizeNickname(input) {
  if (!input) return '';
  let cleaned = input.toString().trim();
  // Strip dangerous HTML/script characters
  cleaned = cleaned.replace(/[<>'"\/\\;`]/g, '');
  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ');
  return cleaned;
}
