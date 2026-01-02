/**
 * App Component - Root component for Kvizovka
 *
 * This is the main component that will contain our game.
 * Now using Tailwind CSS for styling instead of custom CSS.
 * Demonstrates Zustand state management and dictionary integration.
 *
 * Tailwind classes explained:
 * - min-h-screen: minimum height of 100vh (full viewport)
 * - flex, flex-col: flexbox with column direction
 * - bg-gray-100: light gray background
 */

import { useState, useEffect } from 'react'
import { dictionary } from './utils/dictionary'
import { Game } from './components/Game/Game'

function App() {
  // Dictionary state
  const [dictionaryLoaded, setDictionaryLoaded] = useState(false)
  const [dictionaryError, setDictionaryError] = useState<string | null>(null)

  // Load dictionary on component mount
  useEffect(() => {
    const loadDictionary = async () => {
      try {
        await dictionary.load()
        setDictionaryLoaded(true)
        console.log('Dictionary statistics:', dictionary.getCategoryCounts())
      } catch (error) {
        setDictionaryError(
          error instanceof Error ? error.message : 'Unknown error'
        )
      }
    }

    loadDictionary()
  }, [])

  // If dictionary is still loading, show loading screen
  if (!dictionaryLoaded && !dictionaryError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="card max-w-md w-full text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Dictionary...</h2>
          <p className="text-gray-600">Preparing {dictionary.getWordCount()} Serbian words</p>
        </div>
      </div>
    )
  }

  // If dictionary failed to load, show error
  if (dictionaryError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="card max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-800 mb-2">Dictionary Error</h2>
          <p className="text-gray-600">{dictionaryError}</p>
        </div>
      </div>
    )
  }

  // Dictionary loaded successfully - show game!
  return <Game />
}

export default App
