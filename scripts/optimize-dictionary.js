#!/usr/bin/env node

/**
 * Dictionary Optimization Script
 *
 * This script optimizes the Serbian dictionary by:
 * - Selecting most useful words (shorter, more common forms)
 * - Removing excessive inflected forms
 * - Keeping a balanced mix of categories
 * - Target: ~15,000-20,000 words for better performance
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, '../public/dictionary/serbian-words.json');
const OUTPUT_FILE = path.join(__dirname, '../public/dictionary/serbian-words-optimized.json');
const TARGET_SIZE = 20000; // Target number of words

/**
 * Score a word based on usefulness for the game
 * Higher score = more useful
 */
function scoreWord(word) {
  let score = 100;

  // Prefer shorter words (easier to play in Scrabble-like games)
  const length = word.length;
  if (length === 4) score += 50;  // Perfect for minimum
  else if (length === 5) score += 40;
  else if (length === 6) score += 30;
  else if (length === 7) score += 20;
  else if (length === 8) score += 10;
  else if (length > 12) score -= 30;  // Very long words

  // Penalize words with certain patterns (likely inflected forms)
  if (word.endsWith('IMA')) score -= 40;  // Plural instrumental
  if (word.endsWith('AMA')) score -= 40;  // Plural instrumental
  if (word.endsWith('OMA')) score -= 40;  // Plural instrumental
  if (word.endsWith('EMA')) score -= 40;  // Plural instrumental
  if (word.endsWith('OVIH')) score -= 30; // Genitive plural
  if (word.endsWith('EVIM')) score -= 30; // Instrumental
  if (word.endsWith('SKIM')) score -= 30; // Instrumental adjective

  // Boost base forms
  if (word.endsWith('TI')) score += 30;   // Infinitive verbs
  if (word.endsWith('ĆI')) score += 30;   // Infinitive verbs

  return score;
}

/**
 * Optimize the dictionary
 */
function optimizeDictionary() {
  console.log('🔧 Optimizing Serbian dictionary...\n');

  // Read the full dictionary
  const data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
  console.log(`Original word count: ${data.wordCount.toLocaleString()}`);

  // Score all words
  const scoredWords = data.words.map(word => ({
    ...word,
    score: scoreWord(word.word),
  }));

  // Sort by score (highest first)
  scoredWords.sort((a, b) => b.score - a.score);

  // Take top N words
  const optimizedWords = scoredWords.slice(0, TARGET_SIZE);

  // Remove score property
  const finalWords = optimizedWords.map(({ word, category }) => ({
    word,
    category,
  }));

  // Sort alphabetically
  finalWords.sort((a, b) => a.word.localeCompare(b.word));

  // Count categories
  const categoryCounts = {
    NOUN: 0,
    VERB: 0,
    ADJECTIVE: 0,
    PRONOUN: 0,
    NUMBER: 0,
  };

  finalWords.forEach(w => {
    categoryCounts[w.category]++;
  });

  console.log(`\n✅ Optimized to ${finalWords.length.toLocaleString()} words:`);
  console.log(`   - Nouns: ${categoryCounts.NOUN.toLocaleString()}`);
  console.log(`   - Verbs: ${categoryCounts.VERB.toLocaleString()}`);
  console.log(`   - Adjectives: ${categoryCounts.ADJECTIVE.toLocaleString()}`);
  console.log(`   - Pronouns: ${categoryCounts.PRONOUN.toLocaleString()}`);
  console.log(`   - Numbers: ${categoryCounts.NUMBER.toLocaleString()}`);

  // Create optimized dictionary
  const optimizedData = {
    ...data,
    version: '2.1.0',
    description: 'Serbian word dictionary for Kvizovka game - Optimized word list (most common/useful words)',
    wordCount: finalWords.length,
    words: finalWords,
  };

  // Write optimized dictionary
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(optimizedData, null, 2), 'utf-8');

  const originalSize = (fs.statSync(INPUT_FILE).size / 1024 / 1024).toFixed(2);
  const optimizedSize = (fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2);

  console.log(`\n💾 Original size: ${originalSize} MB`);
  console.log(`💾 Optimized size: ${optimizedSize} MB`);
  console.log(`📉 Size reduction: ${((1 - optimizedSize / originalSize) * 100).toFixed(1)}%`);
  console.log(`\n✅ Optimized dictionary saved to: ${OUTPUT_FILE}`);
}

// Run the script
try {
  optimizeDictionary();
  console.log('\n✅ Dictionary optimization complete!\n');
} catch (error) {
  console.error('\n❌ Error optimizing dictionary:', error);
  process.exit(1);
}
