/**
 * Dictionary Loader
 *
 * Loads the Serbian word dictionary on server startup.
 *
 * The dictionary is loaded into memory (1.2 MB, 20K words)
 * and shared across all games for word validation.
 */

import { promises as fs } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { Dictionary } from '@kvizovka/shared'

/**
 * Get directory name (ES modules)
 */
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Dictionary singleton instance
 */
let dictionaryInstance: Dictionary | null = null

/**
 * Load dictionary from file system
 *
 * @returns Promise resolving to Dictionary instance
 */
export async function loadDictionary(): Promise<Dictionary> {
  // Return existing instance if already loaded
  if (dictionaryInstance) {
    return dictionaryInstance
  }

  console.log('[Dictionary] Loading Serbian word dictionary...')

  try {
    // Path to dictionary file
    // Dictionary is in the client's public folder for now
    // We'll copy it to server's assets in production
    const dictionaryPath = join(__dirname, '../../dictionary/serbian-words.json')

    console.log(`[Dictionary] Reading from: ${dictionaryPath}`)

    // Read file
    const data = await fs.readFile(dictionaryPath, 'utf-8')

    // Parse JSON
    const parsed = JSON.parse(data)

    // Create dictionary instance
    const dict = new Dictionary()

    // Load data
    dict.loadFromData(parsed)

    // Cache instance
    dictionaryInstance = dict

    // Log stats
    const counts = dict.getCategoryCounts()
    console.log('[Dictionary] Loaded successfully!')
    console.log(`[Dictionary] Total words: ${dict.getWordCount()}`)
    console.log(`[Dictionary] Categories:`, counts)

    return dict
  } catch (error) {
    console.error('[Dictionary] Failed to load:', error)
    throw new Error(
      `Failed to load dictionary: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Get dictionary instance (must call loadDictionary first)
 *
 * @returns Dictionary instance or null if not loaded
 */
export function getDictionary(): Dictionary | null {
  return dictionaryInstance
}
