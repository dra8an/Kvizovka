/**
 * App Component - Root component for Kvizovka
 *
 * This is the main component that will contain our game.
 * Now using Tailwind CSS for styling instead of custom CSS.
 * Also demonstrates Zustand state management with a simple counter.
 *
 * Tailwind classes explained:
 * - min-h-screen: minimum height of 100vh (full viewport)
 * - flex, flex-col: flexbox with column direction
 * - bg-gray-100: light gray background
 */

import { useExampleStore } from './store/exampleStore'

function App() {
  // Get state and actions from Zustand store
  // This is like useState, but the state is shared across all components!
  const count = useExampleStore((state) => state.count)
  const increment = useExampleStore((state) => state.increment)
  const decrement = useExampleStore((state) => state.decrement)
  const reset = useExampleStore((state) => state.reset)
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
          <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
            <p className="text-green-800 font-medium">
              🚧 Step 2 Complete - Tailwind CSS is working!
            </p>
          </div>

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
