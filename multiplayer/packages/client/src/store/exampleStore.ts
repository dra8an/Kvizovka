/**
 * Example Zustand Store
 *
 * This is a simple example to demonstrate Zustand state management.
 * Zustand is much simpler than Redux - no providers, actions, or reducers needed!
 *
 * Key concepts:
 * - create(): Creates a store
 * - State: The data (like React useState)
 * - Actions: Functions that update state (like setState)
 * - Hooks: Use the store in components with useStore()
 */

import { create } from 'zustand'

/**
 * Define the shape of our store's state
 * This is a TypeScript interface describing what data we have
 */
interface ExampleState {
  // State: A simple counter
  count: number

  // Actions: Functions to modify state
  increment: () => void
  decrement: () => void
  reset: () => void
}

/**
 * Create the Zustand store
 *
 * The create() function takes a callback that receives:
 * - set: Function to update state
 * - get: Function to read current state
 *
 * It returns a React hook that you can use in components
 */
export const useExampleStore = create<ExampleState>((set, get) => ({
  // Initial state
  count: 0,

  // Actions (functions that modify state)

  /**
   * Increment counter by 1
   */
  increment: () => set((state) => ({ count: state.count + 1 })),

  /**
   * Decrement counter by 1
   */
  decrement: () => set((state) => ({ count: state.count - 1 })),

  /**
   * Reset counter to 0
   */
  reset: () => set({ count: 0 }),
}))

/**
 * How to use in a component:
 *
 * function MyComponent() {
 *   // Get state and actions from the store
 *   const count = useExampleStore((state) => state.count)
 *   const increment = useExampleStore((state) => state.increment)
 *
 *   // Or get everything:
 *   const { count, increment, decrement } = useExampleStore()
 *
 *   return (
 *     <div>
 *       <p>Count: {count}</p>
 *       <button onClick={increment}>+</button>
 *     </div>
 *   )
 * }
 */

/**
 * Zustand vs Redux comparison:
 *
 * Redux:
 * - Provider wrapper needed
 * - Actions, reducers, dispatch
 * - Lots of boilerplate
 * - Learning curve
 *
 * Zustand:
 * - No provider needed
 * - Direct state updates
 * - Minimal boilerplate
 * - Easy to learn
 */
