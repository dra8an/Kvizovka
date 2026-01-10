import React from 'react'
import ReactDOM from 'react-dom/client'
import './i18n/config' // Initialize i18n before App
import App from './App.tsx'
import './index.css'

/**
 * Main entry point for the Kvizovka application
 * This file initializes React and mounts the App component
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
