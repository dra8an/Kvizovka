/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Custom colors for Kvizovka game
      colors: {
        // Premium field colors
        'premium-yellow': '#ffd700',     // Double letter (2x)
        'premium-green': '#4ade80',      // Triple letter (3x)
        'premium-red': '#ef4444',        // Quadruple letter (4x)
        'premium-blue': '#3b82f6',       // Word multiplier (X)

        // Board colors
        'board-bg': '#1e293b',           // Dark board background
        'board-square': '#f8fafc',       // Regular square
        'board-center': '#fbbf24',       // Center square

        // Tile colors
        'tile-bg': '#fef3c7',            // Tile background
        'tile-text': '#1e293b',          // Tile letter
        'tile-value': '#78716c',         // Tile point value

        // Black blocker
        'blocker': '#1f2937',            // Black blocker tile
      },

      // Grid template for 17x17 board
      gridTemplateColumns: {
        '17': 'repeat(17, minmax(0, 1fr))',
      },
      gridTemplateRows: {
        '17': 'repeat(17, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
}
