/**
 * App Component - Root component for Kvizovka
 *
 * This is the main component that will contain our game.
 * For now, it just displays a welcome message.
 * We'll build the actual game components in later steps.
 */
function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Kvizovka</h1>
        <p>Serbian Word Board Game</p>
      </header>
      <main>
        <div className="welcome-message">
          <h2>Welcome to Kvizovka!</h2>
          <p>A Serbian word game similar to Scrabble</p>
          <p className="status">🚧 Project setup complete - Ready for development</p>
        </div>
      </main>
    </div>
  )
}

export default App
