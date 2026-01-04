# Dictionary Processing Scripts

This directory contains scripts for processing and optimizing the Serbian dictionary used in the Kvizovka game.

## Scripts

### `process-dictionary.js`

Processes the Hunspell Serbian dictionary and converts it to the game's JSON format.

**Features:**
- Downloads Serbian word list from Hunspell
- Filters words (minimum 4 letters, letters only)
- Categorizes words using heuristics (nouns, verbs, adjectives, etc.)
- Removes duplicates
- Outputs JSON format

**Usage:**
```bash
# First, download the Hunspell dictionary
curl -s "https://raw.githubusercontent.com/titoBouzout/Dictionaries/master/Serbian%20(Latin).dic" -o /tmp/serbian-hunspell.dic

# Then run the processing script
node scripts/process-dictionary.js
```

**Output:**
- File: `public/dictionary/serbian-words.json`
- Words: ~261,000
- Size: ~16 MB

### `optimize-dictionary.js`

Optimizes the dictionary by selecting the most useful words for gameplay.

**Features:**
- Scores words based on usefulness (length, form, patterns)
- Prefers base forms over inflected forms
- Balances category distribution
- Reduces file size by 90%+

**Usage:**
```bash
node scripts/optimize-dictionary.js
```

**Output:**
- File: `public/dictionary/serbian-words-optimized.json`
- Words: ~20,000
- Size: ~1.2 MB

## Word Selection Criteria

The optimization script scores words based on:

1. **Length** (higher score for 4-7 letter words)
2. **Form** (base forms preferred over inflections)
3. **Patterns** (infinitive verbs get bonus points)

### Penalized Patterns
- Words ending in `-IMA`, `-AMA`, `-OMA` (instrumental plural)
- Words ending in `-OVIH` (genitive plural)
- Very long words (12+ letters)

### Boosted Patterns
- Words ending in `-TI`, `-ĆI` (infinitive verbs)
- 4-letter words (minimum for gameplay)
- 5-6 letter words (ideal for gameplay)

## Dictionary Versions

The project maintains three dictionary files:

1. **`serbian-words.json`** (Active)
   - Optimized version (20,000 words, 1.2 MB)
   - Used by the game

2. **`serbian-words-full.json`** (Backup)
   - Full version (261,000 words, 16 MB)
   - Available for advanced features or AI

3. **`serbian-words-backup-150.json`** (Original)
   - Original starter dictionary (150 words)
   - Kept for reference

## Data Source

**Primary Source:** Hunspell Serbian Latin Dictionary
- Repository: https://github.com/titoBouzout/Dictionaries
- File: Serbian (Latin).dic
- License: Various open-source licenses (check repository)
- Words: 263,909 entries (including inflections)

## Categorization

Words are categorized using simple heuristics:

| Category | Detection Pattern | Example |
|----------|------------------|---------|
| VERB | Ends with `-ti`, `-ći` | JESTI, PITI, DOĆI |
| ADJECTIVE | Ends with `-ski`, `-ni`, `-va`, `-iv` | VELIKI, MALI, SRPSKI |
| PRONOUN | Small set of common words | JA, TI, ON, KOJI |
| NUMBER | Starts with number words | JEDAN, DVA, PRVI |
| NOUN | Default (everything else) | KUĆA, VODA, GRAD |

**Note:** This is basic categorization. Proper morphological analysis would require a more sophisticated tool.

## Future Improvements

- [ ] Add word frequency data from corpus
- [ ] Implement proper morphological analysis
- [ ] Support Cyrillic script
- [ ] Add word definitions/translations
- [ ] Create separate dictionaries for different difficulty levels
- [ ] Implement Trie data structure for faster lookups

## License

The scripts in this directory are part of the Kvizovka project.
The dictionary data comes from open-source projects (see Data Source above).
