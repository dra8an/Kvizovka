/**
 * Letter Mapping Utility
 *
 * Maps Serbian Latin letters to Cyrillic equivalents for display.
 */

/**
 * Serbian Latin to Cyrillic letter mapping
 *
 * Based on Serbian alphabet (30 letters in Latin, 30 in Cyrillic)
 */
const LATIN_TO_CYRILLIC: Record<string, string> = {
  'A': 'А',
  'B': 'Б',
  'V': 'В',
  'G': 'Г',
  'D': 'Д',
  'Đ': 'Ђ',
  'E': 'Е',
  'Ž': 'Ж',
  'Z': 'З',
  'I': 'И',
  'J': 'Ј',
  'K': 'К',
  'L': 'Л',
  'LJ': 'Љ',
  'M': 'М',
  'N': 'Н',
  'NJ': 'Њ',
  'O': 'О',
  'P': 'П',
  'R': 'Р',
  'S': 'С',
  'T': 'Т',
  'Ć': 'Ћ',
  'U': 'У',
  'F': 'Ф',
  'H': 'Х',
  'C': 'Ц',
  'Č': 'Ч',
  'DŽ': 'Џ',
  'Š': 'Ш',
}

/**
 * Convert a Latin letter to Cyrillic
 *
 * @param letter - Latin letter (e.g., 'A', 'Č', 'LJ')
 * @param language - Current language code ('en', 'sr', etc.)
 * @returns Cyrillic letter if language is Serbian, otherwise original letter
 *
 * @example
 * ```typescript
 * latinToCyrillic('A', 'sr')  // Returns 'А' (Cyrillic)
 * latinToCyrillic('A', 'en')  // Returns 'A' (Latin)
 * latinToCyrillic('LJ', 'sr') // Returns 'Љ' (Cyrillic)
 * ```
 */
export function latinToCyrillic(letter: string, language: string): string {
  // Only convert if language is Serbian
  if (!language.startsWith('sr')) {
    return letter
  }

  // Return Cyrillic equivalent or original if no mapping exists
  return LATIN_TO_CYRILLIC[letter] || letter
}

/**
 * Check if a letter is a digraph (two-letter combination)
 *
 * Serbian has three digraphs: LJ, NJ, DŽ
 */
export function isDigraph(letter: string): boolean {
  return letter === 'LJ' || letter === 'NJ' || letter === 'DŽ'
}

/**
 * Convert a word from Latin to Cyrillic
 *
 * Handles digraphs (LJ, NJ, DŽ) correctly by checking two characters at a time.
 *
 * @param word - Latin word (e.g., 'LJUBAV', 'NJIVA')
 * @param language - Current language code ('en', 'sr', etc.)
 * @returns Cyrillic word if language is Serbian, otherwise original word
 *
 * @example
 * ```typescript
 * wordToCyrillic('LJUBAV', 'sr')  // Returns 'ЉУБАВ'
 * wordToCyrillic('NJIVA', 'sr')   // Returns 'ЊИВА'
 * wordToCyrillic('HELLO', 'en')   // Returns 'HELLO'
 * ```
 */
export function wordToCyrillic(word: string, language: string): string {
  // Only convert if language is Serbian
  if (!language.startsWith('sr')) {
    return word
  }

  let result = ''
  let i = 0

  while (i < word.length) {
    // Check for two-letter digraphs first
    if (i < word.length - 1) {
      const twoLetters = word.substring(i, i + 2)
      if (LATIN_TO_CYRILLIC[twoLetters]) {
        result += LATIN_TO_CYRILLIC[twoLetters]
        i += 2
        continue
      }
    }

    // Single letter
    const letter = word[i]
    result += LATIN_TO_CYRILLIC[letter] || letter
    i++
  }

  return result
}
