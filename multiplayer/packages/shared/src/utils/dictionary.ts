/**
 * Dictionary Utility
 *
 * This file provides functions to load and search the Serbian word dictionary.
 *
 * The dictionary is stored in a JSON file and loaded at runtime.
 * Words can be validated and searched by category.
 */

import { DictionaryWord, WordCategory, ValidationResult } from '../types'

/**
 * Dictionary Data Structure
 *
 * This matches the structure of serbian-words.json
 */
interface DictionaryFile {
  version: string
  language: string
  script: string
  description: string
  wordCount: number
  minWordLength: number
  categories: Record<string, string>
  words: DictionaryWord[]
}

/**
 * Dictionary Class
 *
 * Manages loading and searching the word dictionary.
 * Uses a Set for O(1) lookup performance.
 *
 * Example usage:
 * ```typescript
 * const dict = new Dictionary()
 * await dict.load()
 * const isValid = dict.isValidWord('KUĆA')  // true
 * ```
 */
export class Dictionary {
  /**
   * All dictionary words stored as DictionaryWord objects
   */
  private words: DictionaryWord[] = []

  /**
   * Set of all valid words (uppercase) for fast lookup
   * Set provides O(1) lookup time vs O(n) for array
   *
   * Example: Set(['KUĆA', 'VODA', 'GRAD', ...])
   */
  private wordSet: Set<string> = new Set()

  /**
   * Map of words grouped by category
   * Makes it fast to get all words of a specific type
   *
   * Example: {
   *   'NOUN': Set(['KUĆA', 'VODA', 'GRAD', ...]),
   *   'VERB': Set(['JESTI', 'PITI', 'SPAVATI', ...]),
   *   ...
   * }
   */
  private categoryMap: Map<WordCategory, Set<string>> = new Map()

  /**
   * Map of word -> category for fast category lookup
   *
   * Example: { 'KUĆA': 'NOUN', 'JESTI': 'VERB', ... }
   */
  private wordCategoryMap: Map<string, WordCategory> = new Map()

  /**
   * Whether the dictionary has been loaded
   */
  private loaded: boolean = false

  /**
   * Load the dictionary from JSON file
   *
   * This is an async function because it fetches data from a file.
   * Must be called before using any other methods.
   *
   * @throws Error if dictionary file cannot be loaded
   *
   * Example:
   * ```typescript
   * const dict = new Dictionary()
   * await dict.load()  // Wait for loading to complete
   * ```
   */
  async load(): Promise<void> {
    try {
      // Fetch the dictionary JSON file from public folder
      // In production, this will be bundled with the app
      const response = await fetch('/dictionary/serbian-words.json')

      if (!response.ok) {
        throw new Error(`Failed to load dictionary: ${response.statusText}`)
      }

      const data: DictionaryFile = await response.json()

      // Store all words
      this.words = data.words

      // Initialize category map
      this.categoryMap.set(WordCategory.NOUN, new Set())
      this.categoryMap.set(WordCategory.VERB, new Set())
      this.categoryMap.set(WordCategory.ADJECTIVE, new Set())
      this.categoryMap.set(WordCategory.PRONOUN, new Set())
      this.categoryMap.set(WordCategory.NUMBER, new Set())

      // Build lookup structures
      for (const word of data.words) {
        const upperWord = word.word.toUpperCase()

        // Add to word set for fast existence check
        this.wordSet.add(upperWord)

        // Add to category map
        const categorySet = this.categoryMap.get(word.category)
        if (categorySet) {
          categorySet.add(upperWord)
        }

        // Add to word-category map
        this.wordCategoryMap.set(upperWord, word.category)
      }

      this.loaded = true

      console.log(
        `✅ Dictionary loaded: ${data.wordCount} words (${data.language} - ${data.script})`
      )
    } catch (error) {
      console.error('❌ Failed to load dictionary:', error)
      throw error
    }
  }

  /**
   * Check if dictionary is loaded
   *
   * Always call this or load() before using other methods.
   */
  isLoaded(): boolean {
    return this.loaded
  }

  /**
   * Check if a word exists in the dictionary
   *
   * Case-insensitive check.
   * Fast O(1) lookup using Set.
   *
   * @param word - The word to check (any case)
   * @returns true if word is valid, false otherwise
   *
   * Example:
   * ```typescript
   * dict.isValidWord('KUĆA')  // true
   * dict.isValidWord('kuća')  // true (case insensitive)
   * dict.isValidWord('XYZ')   // false
   * ```
   */
  isValidWord(word: string): boolean {
    if (!this.loaded) {
      console.warn('⚠️ Dictionary not loaded yet!')
      return false
    }

    return this.wordSet.has(word.toUpperCase())
  }

  /**
   * Get the category of a word
   *
   * @param word - The word to look up
   * @returns WordCategory if found, undefined otherwise
   *
   * Example:
   * ```typescript
   * dict.getWordCategory('KUĆA')   // WordCategory.NOUN
   * dict.getWordCategory('JESTI')  // WordCategory.VERB
   * dict.getWordCategory('XYZ')    // undefined
   * ```
   */
  getWordCategory(word: string): WordCategory | undefined {
    return this.wordCategoryMap.get(word.toUpperCase())
  }

  /**
   * Validate a word and get detailed result
   *
   * Returns validation result with category or error reason.
   *
   * @param word - The word to validate
   * @returns ValidationResult object with details
   *
   * Example:
   * ```typescript
   * dict.validateWord('KUĆA')
   * // Returns: {
   * //   isValid: true,
   * //   word: 'KUĆA',
   * //   category: WordCategory.NOUN
   * // }
   *
   * dict.validateWord('XYZ')
   * // Returns: {
   * //   isValid: false,
   * //   word: 'XYZ',
   * //   reason: 'Word not found in dictionary'
   * // }
   * ```
   */
  validateWord(word: string): ValidationResult {
    const upperWord = word.toUpperCase()

    // Check dictionary not loaded
    if (!this.loaded) {
      return {
        isValid: false,
        word: upperWord,
        reason: 'Dictionary not loaded',
      }
    }

    // Check word length (minimum 4 letters for Kvizovka)
    if (word.length < 4) {
      return {
        isValid: false,
        word: upperWord,
        reason: 'Word too short (minimum 4 letters)',
      }
    }

    // Check if word exists
    if (!this.wordSet.has(upperWord)) {
      return {
        isValid: false,
        word: upperWord,
        reason: 'Word not found in dictionary',
      }
    }

    // Word is valid - return with category
    const category = this.wordCategoryMap.get(upperWord)

    return {
      isValid: true,
      word: upperWord,
      category,
    }
  }

  /**
   * Get all words of a specific category
   *
   * Useful for testing, AI, or filtering.
   *
   * @param category - The word category to filter by
   * @returns Array of words in that category
   *
   * Example:
   * ```typescript
   * const nouns = dict.getWordsByCategory(WordCategory.NOUN)
   * // Returns: ['KUĆA', 'VODA', 'GRAD', ...]
   * ```
   */
  getWordsByCategory(category: WordCategory): string[] {
    const categorySet = this.categoryMap.get(category)
    return categorySet ? Array.from(categorySet) : []
  }

  /**
   * Get total word count
   */
  getWordCount(): number {
    return this.words.length
  }

  /**
   * Get count by category
   *
   * @returns Object with counts for each category
   *
   * Example:
   * ```typescript
   * dict.getCategoryCounts()
   * // Returns: {
   * //   NOUN: 80,
   * //   VERB: 35,
   * //   ADJECTIVE: 24,
   * //   PRONOUN: 7,
   * //   NUMBER: 9
   * // }
   * ```
   */
  getCategoryCounts(): Record<string, number> {
    const counts: Record<string, number> = {}

    for (const [category, wordSet] of this.categoryMap.entries()) {
      counts[category] = wordSet.size
    }

    return counts
  }

  /**
   * Search for words matching a pattern
   *
   * Supports wildcards: ? = any single letter, * = any letters
   *
   * @param pattern - Search pattern (e.g., "KU?A", "P*TI")
   * @returns Array of matching words
   *
   * Example:
   * ```typescript
   * dict.searchWords('KU?A')   // ['KUĆA']
   * dict.searchWords('P*TI')   // ['PITI', 'PEVATI', 'PLESATI', ...]
   * dict.searchWords('????')   // All 4-letter words
   * ```
   *
   * Note: This is a simple implementation. For MVP, we can optimize later.
   */
  searchWords(pattern: string): string[] {
    const upperPattern = pattern.toUpperCase()

    // Convert pattern to regex
    // ? = any single character
    // * = any number of characters
    const regexPattern = upperPattern
      .replace(/\?/g, '.') // ? becomes . (any char)
      .replace(/\*/g, '.*') // * becomes .* (any chars)

    const regex = new RegExp(`^${regexPattern}$`)

    // Filter words that match
    return Array.from(this.wordSet).filter((word) => regex.test(word))
  }

  /**
   * Get a random word (for testing or AI)
   *
   * @param category - Optional category to filter by
   * @returns Random word, or empty string if no words available
   *
   * Example:
   * ```typescript
   * const randomNoun = dict.getRandomWord(WordCategory.NOUN)
   * const anyWord = dict.getRandomWord()
   * ```
   */
  getRandomWord(category?: WordCategory): string {
    let words: string[]

    if (category) {
      words = this.getWordsByCategory(category)
    } else {
      words = Array.from(this.wordSet)
    }

    if (words.length === 0) {
      return ''
    }

    const randomIndex = Math.floor(Math.random() * words.length)
    return words[randomIndex]
  }
}

/**
 * Singleton instance of Dictionary
 *
 * Export a single shared instance that can be imported anywhere.
 * This ensures the dictionary is only loaded once.
 *
 * Usage in other files:
 * ```typescript
 * import { dictionary } from './utils/dictionary'
 *
 * // In your component or game logic:
 * await dictionary.load()  // Call once at app start
 * const isValid = dictionary.isValidWord('KUĆA')
 * ```
 */
export const dictionary = new Dictionary()

/**
 * Example Usage:
 *
 * ```typescript
 * // 1. Load dictionary at app startup
 * import { dictionary } from './utils/dictionary'
 *
 * async function initializeApp() {
 *   try {
 *     await dictionary.load()
 *     console.log('Dictionary ready!')
 *   } catch (error) {
 *     console.error('Failed to initialize dictionary')
 *   }
 * }
 *
 * // 2. Validate words during gameplay
 * const result = dictionary.validateWord('KUĆA')
 * if (result.isValid) {
 *   console.log(`${result.word} is a valid ${result.category}`)
 * } else {
 *   console.log(`Invalid: ${result.reason}`)
 * }
 *
 * // 3. Search for words (for AI or hints)
 * const fourLetterWords = dictionary.searchWords('????')
 * const wordsStartingWithK = dictionary.searchWords('K*')
 *
 * // 4. Get category statistics
 * const counts = dictionary.getCategoryCounts()
 * console.log(`Nouns: ${counts.NOUN}, Verbs: ${counts.VERB}`)
 * ```
 */
