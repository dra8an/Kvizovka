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
import { useExampleStore } from './store/exampleStore'
import { dictionary } from './utils/dictionary'
import { WordCategory } from './types'

function App() {
  // Get state and actions from Zustand store
  // This is like useState, but the state is shared across all components!
  const count = useExampleStore((state) => state.count)
  const increment = useExampleStore((state) => state.increment)
  const decrement = useExampleStore((state) => state.decrement)
  const reset = useExampleStore((state) => state.reset)

  // Dictionary state
  const [dictionaryLoaded, setDictionaryLoaded] = useState(false)
  const [dictionaryError, setDictionaryError] = useState<string | null>(null)
  const [testWord, setTestWord] = useState('')
  const [validationResult, setValidationResult] = useState<string | null>(null)

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

  // Handle word validation
  const validateWord = () => {
    if (!testWord.trim()) {
      setValidationResult('Please enter a word')
      return
    }

    const result = dictionary.validateWord(testWord)

    if (result.isValid) {
      setValidationResult(
        `✅ "${result.word}" is valid! Category: ${result.category}`
      )
    } else {
      setValidationResult(`❌ Invalid: ${result.reason}`)
    }
  }
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header with gradient background */}
      <header className="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg">
        <div className="container mx-auto px-6 py-8 text-center">
          <h1 className="text-5xl font-bold mb-2">Kvizovka</h1>
          <p className="text-xl opacity-90">Serbian Word Board Game</p>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="card max-w-2xl w-full">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome to Kvizovka!
          </h2>
          <p className="text-lg text-gray-600 mb-4">
            A Serbian word game similar to Scrabble
          </p>

          {/* Status badge with Tailwind */}
          {dictionaryError ? (
            <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-red-800 font-medium">
                ❌ Dictionary Error: {dictionaryError}
              </p>
            </div>
          ) : dictionaryLoaded ? (
            <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
              <p className="text-green-800 font-medium">
                ✅ Step 4 Complete - Dictionary loaded ({dictionary.getWordCount()}{' '}
                words)!
              </p>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
              <p className="text-yellow-800 font-medium">
                ⏳ Loading dictionary...
              </p>
            </div>
          )}

          {/* Zustand Counter Example */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h3 className="text-xl font-bold text-blue-900 mb-4">
              Zustand State Management Demo
            </h3>
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={decrement}
                className="btn btn-secondary w-12 h-12 text-xl"
              >
                -
              </button>
              <div className="text-4xl font-bold text-blue-600 min-w-[80px] text-center">
                {count}
              </div>
              <button
                onClick={increment}
                className="btn btn-primary w-12 h-12 text-xl"
              >
                +
              </button>
            </div>
            <button
              onClick={reset}
              className="btn btn-secondary w-full"
            >
              Reset
            </button>
            <p className="text-sm text-blue-700 mt-3 text-center">
              State is managed by Zustand (no Redux needed!)
            </p>
          </div>

          {/* Dictionary Testing Section */}
          {dictionaryLoaded && (
            <div className="mt-8 p-6 bg-purple-50 rounded-lg border-2 border-purple-200">
              <h3 className="text-xl font-bold text-purple-900 mb-4">
                Dictionary Word Validation
              </h3>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={testWord}
                  onChange={(e) => setTestWord(e.target.value.toUpperCase())}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') validateWord()
                  }}
                  placeholder="Enter a word (e.g., KUĆA)"
                  className="flex-1 px-4 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={validateWord}
                  className="btn btn-primary px-6"
                >
                  Validate
                </button>
              </div>
              {validationResult && (
                <div className="p-3 bg-white rounded border-2 border-purple-300">
                  <p className="text-sm font-medium">{validationResult}</p>
                </div>
              )}
              <div className="mt-4 text-sm text-purple-700">
                <p className="font-semibold mb-2">Try these words:</p>
                <div className="flex flex-wrap gap-2">
                  {['KUĆA', 'VODA', 'JESTI', 'VELIKI', 'INVALID'].map((word) => (
                    <button
                      key={word}
                      onClick={() => {
                        setTestWord(word)
                        const result = dictionary.validateWord(word)
                        if (result.isValid) {
                          setValidationResult(
                            `✅ "${result.word}" is valid! Category: ${result.category}`
                          )
                        } else {
                          setValidationResult(`❌ Invalid: ${result.reason}`)
                        }
                      }}
                      className="px-3 py-1 bg-purple-200 hover:bg-purple-300 rounded text-purple-900 transition-colors"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Example of Tailwind utilities - Premium field colors */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="p-4 bg-premium-yellow rounded-lg text-center">
              <p className="font-semibold">Double Letter</p>
              <p className="text-sm text-gray-600">2x</p>
            </div>
            <div className="p-4 bg-premium-green text-white rounded-lg text-center">
              <p className="font-semibold">Triple Letter</p>
              <p className="text-sm">3x</p>
            </div>
            <div className="p-4 bg-premium-red text-white rounded-lg text-center">
              <p className="font-semibold">Quadruple Letter</p>
              <p className="text-sm">4x</p>
            </div>
            <div className="p-4 bg-premium-blue text-white rounded-lg text-center">
              <p className="font-semibold">Word Multiplier</p>
              <p className="text-sm">X</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-6 text-center text-gray-600 text-sm">
          Built with React + TypeScript + Tailwind CSS
        </div>
      </footer>
    </div>
  )
}

export default App
