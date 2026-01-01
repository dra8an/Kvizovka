# Kvizovka - Official Game Rules

## Table of Contents
1. [Game Overview](#game-overview)
2. [Equipment](#equipment)
3. [Setup](#setup)
4. [Gameplay](#gameplay)
5. [Valid Words](#valid-words)
6. [Scoring](#scoring)
7. [Tournament Rules](#tournament-rules)
8. [Game End](#game-end)

---

## Game Overview

**Kvizovka** is a Serbian word board game designed as the Serbian-Croatian version of Scrabble. Like Scrabble, players form interconnected words on a board using letter tiles, but Kvizovka has unique rules adapted for the Serbian language and competitive play.

### Key Differences from Scrabble
| Feature | Scrabble | Kvizovka |
|---------|----------|----------|
| Board Size | 15×15 | **17×17** |
| Tiles per Player | 7 | **10** |
| Minimum Word Length | 2-3 letters | **4 letters** (3 at edge) |
| Game Rounds | Until tiles run out | **10 rounds per player** |
| Time Control | Optional | **30-35 minutes per player** (chess clock) |
| Total Tiles | 100 | **238** (228 letters + 10 jokers) |

---

## Equipment

### The Board
- **Size**: 17 rows × 17 columns = 289 squares
- **Premium Fields**: 45 special squares with multipliers
- **Center Square**: Starting position (row 8, column 8)

### Premium Field Types

#### Letter Multipliers (apply to single tile)
| Symbol | Color | Multiplier | Count |
|--------|-------|------------|-------|
| 2 dots | Yellow | 2× letter value | 24 |
| 3 dots | Green | 3× letter value | 12 |
| 4 dots | Red | 4× letter value | 8 |

#### Word Multipliers (apply to entire word)
| Symbol | Multiplier | Count | Notes |
|--------|------------|-------|-------|
| X | 2× word value | 16 | Can stack: 2 X's = 4× |

**Important**: Each premium field can only be used **once** during the entire game. Once a tile is placed on a premium square, that square becomes "used" and provides no bonus on subsequent turns.

### Tile Set

**Total Tiles**: 238
- **Letter Tiles**: 228 (Serbian alphabet)
- **Joker Tiles**: 10 (blank tiles, can represent any letter)

#### Serbian Letter Distribution

| Letter | Count | Value | Letter | Count | Value |
|--------|-------|-------|--------|-------|-------|
| A | 14 | 1 | N | 10 | 1 |
| E | 12 | 1 | R | 10 | 1 |
| I | 11 | 1 | S | 9 | 1 |
| O | 10 | 1 | T | 8 | 1 |
| J | 8 | 2 | V | 7 | 2 |
| D | 7 | 2 | K | 6 | 2 |
| L | 6 | 2 | M | 6 | 2 |
| P | 6 | 2 | U | 6 | 2 |
| G | 4 | 3 | B | 4 | 3 |
| Z | 4 | 3 | C | 4 | 3 |
| Č | 3 | 3 | Ć | 3 | 3 |
| H | 3 | 3 | Ž | 3 | 3 |
| Š | 3 | 3 | Đ | 2 | 4 |
| DŽ | 2 | 4 | LJ | 2 | 4 |
| NJ | 2 | 4 | F | 2 | 4 |
| **Joker** | **10** | **0** | | | |

**Notes**:
- Letter values are based on frequency in Serbian language
- Common letters (A, E, I, O, N, R, S, T) = 1 point
- Rare letters (Đ, DŽ, LJ, NJ, F) = 4 points
- Jokers have no point value but can be any letter

### Black Blocker Tiles
- **Special tiles** used to "close" words after they're placed
- Prevent words from being extended or crossed
- Automatically placed at the start and end of each word
- **Not placed** if the word touches the board edge

### Other Equipment
- **Tile Bag**: Non-transparent bag to hold undrawn tiles
- **Chess Clock**: For tournament time control
- **Score Sheet**: To track moves and scores
- **Dictionary**: Official Serbian word reference

---

## Setup

### Game Preparation
1. **Place the board** on a flat surface between the two players
2. **Put all 238 tiles** in the non-transparent bag
3. **Shuffle the tiles** thoroughly
4. **Each player draws 10 tiles** (keep them hidden from opponent)
5. **Set the chess clock** to 30-35 minutes per player
6. **Determine who goes first** (coin flip, or agree)

### Starting Configuration
- Board starts empty
- Each player has 10 tiles
- Remaining ~218 tiles in the bag
- Clock ready to start
- Score starts at 0-0

---

## Gameplay

### Turn Structure

A player's turn consists of:
1. **Optionally**: Exchange some/all tiles (return to bag, draw new ones)
2. **Place tiles** on the board to form word(s)
3. **Black blocker tiles are automatically placed** around the word(s)
4. **Announce the score** for the move
5. **Draw tiles** to refill to 10 tiles
6. **Press the clock** to end turn

### Black Blocker Tiles Rule ⚫

**IMPORTANT**: After a word is placed, **black blocker tiles** are automatically added around it.

**Blocker Placement**:
- One black tile is placed **before** the first letter of the word
- One black tile is placed **after** the last letter of the word
- **Exception**: If the word starts/ends at the board edge, no blocker is placed there

**Blocker Effect**:
- ❌ **Words cannot be extended** past a blocker
- ❌ **Words cannot cross through** a blocker
- ✅ Blockers make words "final" - they cannot be changed
- ✅ New words can still be placed perpendicular to blocked words

**Example**:
```
Before placing "CATS":
. . . . .

After placing "CATS":
. ■ C A T S ■ .
  ↑         ↑
  Black    Black
  blocker  blocker

Note: The word "CATS" can never be extended to "CATSY" or "SCATS"
      because blockers prevent any extension
```

**Edge Cases**:
```
Word touching left edge:
C A T S ■ .
(No blocker on the left because word touches board edge)

Word touching both edges (spans entire row):
C A T S . . . . . . . . D O G S
(No blockers because word touches both edges - max 17 letters)
```

### Placement Rules

#### First Move (Opening)
The first move of the game **must**:
- ✅ Cover the **center square** (row 8, col 8)
- ✅ Form a valid word of **at least 4 letters**
- ✅ Be placed horizontally or vertically (not diagonal)
- ✅ Black blockers will be added around the word

Example:
```
        8
      -----
    7 |   |
    8 |CAT|  ← First word crosses center (but only 3 letters - INVALID!)
    9 |   |
      -----

        8
      -----
    7 |   |
    8 |CATS|  ← Valid first move (4 letters, crosses center)
    9 |   |
      -----
```

#### Subsequent Moves
After the first move, all placements **must**:
- ✅ **Connect to existing tiles** (at least one tile must touch an already-placed tile)
- ✅ Form **valid words** (main word + all perpendicular cross-words)
- ✅ Be placed in a **straight line** (horizontal or vertical only)
- ✅ Minimum **4 letters** per word (3 letters allowed only if perpendicular to board edge)

#### What Counts as "Connected"
Tiles must be **adjacent** (touching horizontally or vertically, not diagonally):

```
Valid:           Invalid:
  T                T
CATS             CATS
  S                  S
```

**Important**: New words **cannot cross black blocker tiles**:
```
Invalid placement:
■ C A T S ■
    N         ← Cannot place 'N' here - would cross blocker
    E
    W

Valid placement:
■ C A T S ■
  ↓
  N E W     ← Can place perpendicular word
```

### Word Formation

When you place tiles, you must form valid words in **all directions**:

**Important Note**: Due to black blocker tiles, **words cannot be extended** once placed. You can only:
- ✅ Place new words using existing letters as connection points
- ✅ Form cross-words perpendicular to existing words
- ❌ Extend existing words (blockers prevent this)

**Example**: Cross-words (the main way to build in Kvizovka)
```
Before:              After:
■ C A T S ■         ■ C A T S ■
                    ■ T I G E R ■ ← Placed T, I, G, E, R
                      ↑
                    Uses the 'T' from CATS

Words formed:
- "TIGER" (horizontal) = new word
- "TT" would be formed but... we only placed I, G, E, R
  Actually: the 'T' from both words is the same tile (connection point)

Both words must be valid!
Black blockers are now around "TIGER" preventing its extension
```

### Joker Tiles (Kvizovac)

- **Blank tiles** that can represent **any letter**
- Player declares what letter the joker represents when playing it
- Joker contributes **0 points** to the score (but allows word formation)
- Once placed, the joker's letter assignment is **permanent** for that game
- If unplayed at game end: **-10 point penalty per joker**

**Example**:
```
Player has: C, A, [JOKER], S
Plays: [JOKER]=T, forming "CATS"
Score: C(3) + A(1) + [JOKER](0) + S(1) = 5 points
```

### Exchanging Tiles

Instead of placing tiles, a player may **exchange** tiles:
- Return any number of tiles to the bag
- Draw the same number of new tiles
- **Turn ends** (no points scored)
- No penalty (allowed strategy)

**When to exchange**:
- Bad letter combination
- All vowels or all consonants
- High-value letters you can't use

### Skipping a Turn

A player may **skip their turn** without placing tiles or exchanging:
- Simply pass the turn
- Clock continues running
- No penalty (but wastes time)

---

## Valid Words

### Accepted Word Categories

✅ **Nouns** - Nominative case only
- ✅ "PAS" (dog)
- ✅ "KUĆA" (house)
- ❌ "PSA" (dog, genitive - INVALID)
- ❌ "KUĆE" (house, genitive - INVALID)

✅ **Verbs** - Infinitive form, non-reflexive only
- ✅ "TRČATI" (to run)
- ✅ "JESTI" (to eat)
- ❌ "TRČI" (runs, conjugated - INVALID)
- ❌ "SE TRČATI" (reflexive - INVALID)

✅ **Adjectives** - All genders and cases, positive form only
- ✅ "LEP" (beautiful, masculine)
- ✅ "LEPA" (beautiful, feminine)
- ✅ "LEPO" (beautiful, neuter)
- ✅ "LEPOG" (beautiful, genitive)
- ❌ "LEPŠI" (more beautiful, comparative - INVALID)

✅ **Pronouns**
- ✅ "OVO" (this)
- ✅ "ONO" (that)
- ✅ "KOJI" (which)

✅ **Numbers**
- ✅ "JEDAN" (one)
- ✅ "DVA" (two)
- ✅ "PRVI" (first)

### Excluded Word Categories

❌ **Proper Nouns**
- Names of people, places, brands
- ❌ "BEOGRAD" (Belgrade)
- ❌ "MARKO" (Mark)

❌ **Exclamations & Interjections**
- ❌ "AHA"
- ❌ "EJ"

❌ **Abbreviations**
- ❌ "SAD" (for "Sjedinjene Američke Države")
- ❌ "SRB" (for "Srbija")

❌ **Dependent Morphemes**
- Prefixes, suffixes that can't stand alone
- ❌ "PRE-" (prefix)
- ❌ "-NOST" (suffix)

### Dictionary Reference

In tournaments, disputes are resolved using:
- Official Kvizovka tournament dictionary
- Serbian language reference materials
- Judge's ruling (final decision)

In casual play:
- Players can agree on word validity
- Use online Serbian dictionaries
- Consensus-based

---

## Scoring

### Basic Scoring Formula

```
Word Score = (Sum of tile values with letter multipliers) × Word multipliers
Total Move Score = Sum of all words formed + Bonuses
```

### Step-by-Step Calculation

1. **For each word formed in the move**:

   a. **Add up tile values**:
      - Each tile has a base value (1-4 points)
      - Jokers = 0 points

   b. **Apply letter multipliers** (only on **newly placed tiles** on **unused** premium squares):
      - 2 dots (Yellow) → Tile value × 2
      - 3 dots (Green) → Tile value × 3
      - 4 dots (Red) → Tile value × 4

   c. **Sum all letter values** (with multipliers applied)

   d. **Apply word multipliers** (only if any **newly placed tile** is on an **unused** X-marked square):
      - One X → Word score × 2
      - Two X's → Word score × 4
      - (Word multipliers can stack!)

2. **Sum the scores of all words** formed in this move

3. **Add bonuses**:
   - All 10 tiles used → +40 to +50 points
   - 10+ letter word → +20 to +50 points

### Scoring Examples

#### Example 1: Simple Word
```
C(3) + A(1) + T(1) + S(1) = 6 points
No premium fields used → Final: 6 points
```

#### Example 2: Double Letter
```
Placing "CATS" with A on a yellow square (2×):
C(3) + A(1×2) + T(1) + S(1) = 3 + 2 + 1 + 1 = 7 points
```

#### Example 3: Word Multiplier
```
Placing "CATS" with C on an X-marked square:
Base word value: 3 + 1 + 1 + 1 = 6
Word multiplier: 6 × 2 = 12 points
```

#### Example 4: Stacked Multipliers
```
Placing "TIGER" covering two X-marked squares:
Base word value: T(1) + I(1) + G(3) + E(1) + R(1) = 7
Two word multipliers: 7 × 2 × 2 = 28 points
```

#### Example 5: Cross-Words
```
Before:          After:
  C                C
  A                A
  T              TIGER
  S                S

"TIGER" = T(1) + I(1) + G(3) + E(1) + R(1) = 7 pts
"CAT" = C(3) + A(1) + T(1) = 5 pts (if T is newly placed)
Total = 7 + 5 = 12 points (plus any multipliers)
```

### Bonuses

#### All Tiles Bonus (10 tiles in one move)
- If a player uses **all 10 tiles** in a single move
- Bonus: **+40 to +50 points** (configurable)
- Added to total move score

#### Long Word Bonus (10+ letters)
- Words with **10 or more letters**
- Bonus: **+20 to +50 points** (scales with length)
- Added to total move score

Example bonuses:
- 10 letters → +20 pts
- 12 letters → +30 pts
- 15 letters → +45 pts
- 17 letters → +50 pts (max, entire row/column)

### Penalties

#### End-of-Game Tile Penalty
- **Unused letter tiles**: Subtract tile values from final score
- **Unused jokers**: -10 points each

Example:
```
Final score: 450 points
Unused tiles: C(3), A(1), [JOKER](10) = 14 points
Actual final score: 450 - 14 = 436 points
```

#### Invalid Word Penalty (Tournament)
- **Time penalties** (not point penalties)
- First invalid word: **-1 minute** from clock
- Second invalid word: **-2 minutes**
- Third+ invalid word: **-4 minutes**

---

## Tournament Rules

### Time Control
- **Standard**: Each player has **30 minutes** total for all 10 rounds
- **Long format**: Each player has **35 minutes**
- **Chess clock** used (one player's time runs while it's their turn)
- Running out of time = **automatic loss** (regardless of score)

### Number of Rounds
- Each player plays **exactly 10 rounds**
- Game can end earlier if:
  - All tiles are exhausted and no more moves possible
  - One player runs out of time
  - Both players agree to end

### Move Validation
- After each move, opponent can **challenge** word validity
- If challenged:
  - **Word is valid** → Challenger receives time penalty
  - **Word is invalid** → Player who placed it receives time penalty and must remove tiles
- Judges with dictionaries resolve disputes

### Winning Condition
- Player with **higher score** after 10 rounds wins
- **If time runs out**: Opponent wins automatically
- **Tie score**: Player with more time remaining wins

### Tournament Etiquette
- Keep tiles hidden from opponent
- Don't disturb opponent during their turn
- Accept judge's rulings
- No electronic devices during play

---

## Game End

### How the Game Ends

1. **10 Rounds Completed**: Each player has played 10 turns
2. **Tiles Exhausted**: No more tiles in bag and no more valid moves
3. **Time Expires**: One player runs out of time (automatic loss)
4. **Mutual Agreement**: Both players agree to end

### Final Scoring

1. **Calculate each player's move scores** (sum of all rounds)

2. **Apply end-game penalties**:
   - Subtract unused tile values
   - Subtract 10 points per unused joker

3. **Determine winner**:
   - Highest score wins
   - If tied: Most time remaining wins
   - If still tied: Declared a draw

### Example Final Score
```
Player 1:
- Move scores total: 485 points
- Unused tiles: A(1) + T(1) = 2 points
- Final score: 485 - 2 = 483 points
- Time remaining: 3:24

Player 2:
- Move scores total: 470 points
- Unused tiles: [JOKER](10) + S(1) = 11 points
- Final score: 470 - 11 = 459 points
- Time remaining: 5:12

Winner: Player 1 (483 > 459)
```

---

## Strategy Tips

### Opening Strategy
- Try to use the center premium fields
- Balance vowels and consonants in your tiles
- Don't waste high-value letters on low-scoring words

### Mid-Game Strategy
- Look for opportunities to use premium fields
- Form multiple words in one move (cross-words)
- Manage your time wisely
- Block opponent's access to premium fields

### End-Game Strategy
- Use remaining high-value tiles
- Try to use all tiles for bonus
- Don't leave jokers unplayed (-10 penalty!)
- Calculate if you can win with remaining moves

### Tile Management
- Exchange tiles when you have unusable combinations
- Keep a balance of vowels and consonants
- Save jokers for high-scoring opportunities
- Use rare high-value letters when multipliers are available

---

## Variants & House Rules

### Casual Play Adjustments
- No time limit (play at your own pace)
- Allow 3-letter words everywhere
- Use simpler dictionary (more permissive)
- Allow challenges without time penalty

### Learning Mode
- Show premium field values on board
- Allow undo moves
- Provide word suggestions
- No penalties for invalid words

### Advanced Variants
- Speed mode: 15 minutes per player
- No jokers: Remove all 10 joker tiles
- Marathon: 20 rounds per player

---

## Quick Reference

### Turn Actions
1. ☐ Exchange tiles (optional)
2. ☐ Place tiles on board
3. ☐ Calculate and announce score
4. ☐ Draw tiles to refill to 10
5. ☐ Press clock to end turn

### Minimum Word Lengths
- **Standard**: 4 letters
- **At board edge** (perpendicular): 3 letters
- **First move**: 4 letters, must cross center

### Premium Field Colors
- 🟨 Yellow (2 dots) → 2× letter
- 🟩 Green (3 dots) → 3× letter
- 🟥 Red (4 dots) → 4× letter
- ❌ X-marked → 2× word (stackable)

### Bonuses
- All 10 tiles used: **+40-50 points**
- 10+ letter word: **+20-50 points**

### Penalties
- Unused tiles: **-tile value**
- Unused jokers: **-10 per joker**
- Invalid word (tournament): **time penalty**

---

## Additional Resources

- **Official Kvizovka Website**: [kvizovka.rs](http://kvizovka.rs) (if available)
- **Serbian Dictionary**: [Vukajlija](https://vukajlija.com/), [Recnik.org](https://recnik.org/)
- **Tournament Calendar**: Check local enigmatika clubs
- **Practice**: Play online or with friends

---

**Enjoy playing Kvizovka!** 🎲📝

May the best word-builder win! 🏆
