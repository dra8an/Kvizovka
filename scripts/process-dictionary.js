#!/usr/bin/env node

/**
 * Dictionary Processing Script
 *
 * This script processes the Hunspell Serbian dictionary and converts it
 * to the format used by the Kvizovka game.
 *
 * Features:
 * - Filters words with minimum 4 letters
 * - Removes duplicate words
 * - Converts to uppercase
 * - Categorizes words (basic heuristics)
 * - Outputs JSON format
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Input and output paths
const INPUT_FILE = '/tmp/serbian-hunspell.dic';
const OUTPUT_FILE = path.join(__dirname, '../public/dictionary/serbian-words.json');

/**
 * Simple heuristic to categorize Serbian words
 *
 * Note: This is very basic. Proper categorization would require
 * morphological analysis. For now, we'll categorize based on common patterns.
 */
function categorizeWord(word) {
  const lower = word.toLowerCase();

  // Verb patterns (infinitive ending in -ti, -ći)
  if (lower.endsWith('ti') || lower.endsWith('ći')) {
    return 'VERB';
  }

  // Adjective patterns (common endings)
  if (
    lower.endsWith('ski') ||
    lower.endsWith('ški') ||
    lower.endsWith('čki') ||
    lower.endsWith('ki') ||
    lower.endsWith('ni') ||
    lower.endsWith('na') ||
    lower.endsWith('no') ||
    lower.endsWith('va') ||
    lower.endsWith('vo') ||
    lower.endsWith('iv') ||
    lower.endsWith('iva') ||
    lower.endsWith('ljiv') ||
    lower.endsWith('ljiva')
  ) {
    return 'ADJECTIVE';
  }

  // Numbers
  if (
    lower.match(/^(jedan|dva|tri|četiri|pet|šest|sedam|osam|devet|deset)/) ||
    lower.match(/^(prvi|drugi|treći|četvrti|peti)/)
  ) {
    return 'NUMBER';
  }

  // Pronouns (small set of common words)
  const pronouns = [
    'ja', 'ti', 'on', 'ona', 'ono', 'mi', 'vi', 'oni', 'one',
    'mene', 'tebe', 'meni', 'tebi', 'nešto', 'ništa', 'neko', 'niko',
    'koji', 'koja', 'koje', 'svaki', 'svaka', 'svako', 'neki', 'neka', 'neko',
    'ovaj', 'taj', 'onaj', 'ova', 'ta', 'ona'
  ];

  if (pronouns.includes(lower)) {
    return 'PRONOUN';
  }

  // Default to NOUN
  return 'NOUN';
}

/**
 * Process the dictionary file
 */
function processDictionary() {
  console.log('📚 Processing Serbian dictionary...\n');

  // Read the Hunspell dictionary file
  const content = fs.readFileSync(INPUT_FILE, 'utf-8');
  const lines = content.trim().split('\n');

  // First line is the word count, skip it
  const wordCount = parseInt(lines[0]);
  console.log(`Total entries in Hunspell dictionary: ${wordCount.toLocaleString()}`);

  // Process words
  const wordSet = new Set();
  const words = [];
  const categoryCounts = {
    NOUN: 0,
    VERB: 0,
    ADJECTIVE: 0,
    PRONOUN: 0,
    NUMBER: 0,
  };

  for (let i = 1; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;

    // Remove Hunspell affixes (marked with /)
    // Example: "abažur/a" -> "abažur"
    let word = line.split('/')[0];

    // Filter requirements:
    // 1. Minimum 4 letters (game rule)
    // 2. Only letters (no numbers or special chars)
    // 3. No duplicates
    if (word.length < 4) continue;
    if (!/^[a-zčćžšđA-ZČĆŽŠĐ]+$/.test(word)) continue;

    const upperWord = word.toUpperCase();

    // Skip if already added
    if (wordSet.has(upperWord)) continue;

    wordSet.add(upperWord);

    // Categorize the word
    const category = categorizeWord(word);
    categoryCounts[category]++;

    words.push({
      word: upperWord,
      category: category,
    });
  }

  // Sort words alphabetically
  words.sort((a, b) => a.word.localeCompare(b.word));

  console.log(`\n✅ Processed words:`);
  console.log(`   - Total unique words (4+ letters): ${words.length.toLocaleString()}`);
  console.log(`   - Nouns: ${categoryCounts.NOUN.toLocaleString()}`);
  console.log(`   - Verbs: ${categoryCounts.VERB.toLocaleString()}`);
  console.log(`   - Adjectives: ${categoryCounts.ADJECTIVE.toLocaleString()}`);
  console.log(`   - Pronouns: ${categoryCounts.PRONOUN.toLocaleString()}`);
  console.log(`   - Numbers: ${categoryCounts.NUMBER.toLocaleString()}`);

  // Create JSON structure
  const dictionaryData = {
    version: '2.0.0',
    language: 'sr',
    script: 'latin',
    description: 'Serbian word dictionary for Kvizovka game - Comprehensive word list from Hunspell',
    source: 'Hunspell Serbian Latin dictionary (https://github.com/titoBouzout/Dictionaries)',
    wordCount: words.length,
    minWordLength: 4,
    categories: {
      NOUN: 'Nouns (heuristically detected)',
      VERB: 'Verbs (infinitive forms ending in -ti, -ći)',
      ADJECTIVE: 'Adjectives (common endings)',
      PRONOUN: 'Pronouns',
      NUMBER: 'Numbers',
    },
    words: words,
  };

  // Write to output file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(dictionaryData, null, 2), 'utf-8');

  console.log(`\n💾 Dictionary saved to: ${OUTPUT_FILE}`);
  console.log(`📊 File size: ${(fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2)} MB`);
}

// Run the script
try {
  processDictionary();
  console.log('\n✅ Dictionary processing complete!\n');
} catch (error) {
  console.error('\n❌ Error processing dictionary:', error);
  process.exit(1);
}
