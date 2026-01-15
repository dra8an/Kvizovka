/**
 * Logger Utility
 *
 * Centralized logging with environment-based log levels.
 * Reduces production log output while keeping development verbose.
 *
 * Usage:
 * ```typescript
 * import { Logger } from '@kvizovka/shared'
 *
 * Logger.error('Critical error', error)
 * Logger.warn('Warning message')
 * Logger.info('Important state change')
 * Logger.debug('Detailed debugging info')
 * ```
 */

export enum LogLevel {
  ERROR = 0,   // Always log - critical failures
  WARN = 1,    // Important warnings
  INFO = 2,    // Important state changes
  DEBUG = 3,   // Detailed debugging
}

export class Logger {
  private static level: LogLevel = LogLevel.INFO
  private static context: string = ''

  /**
   * Set the logging level
   * Production should use WARN, development should use DEBUG
   */
  static setLevel(level: LogLevel) {
    this.level = level
  }

  /**
   * Set a context prefix for all subsequent log messages
   * Example: '[game:make-move]'
   */
  static setContext(context: string) {
    this.context = context
  }

  /**
   * Clear the context prefix
   */
  static clearContext() {
    this.context = ''
  }

  /**
   * Log an error - always shown in production
   */
  static error(message: string, ...args: any[]) {
    if (this.level >= LogLevel.ERROR) {
      const prefix = this.context ? `[ERROR]${this.context}` : '[ERROR]'
      console.error(`${prefix} ${message}`, ...args)
    }
  }

  /**
   * Log a warning - shown in production
   */
  static warn(message: string, ...args: any[]) {
    if (this.level >= LogLevel.WARN) {
      const prefix = this.context ? `[WARN]${this.context}` : '[WARN]'
      console.warn(`${prefix} ${message}`, ...args)
    }
  }

  /**
   * Log important information - hidden in production
   */
  static info(message: string, ...args: any[]) {
    if (this.level >= LogLevel.INFO) {
      const prefix = this.context ? `[INFO]${this.context}` : '[INFO]'
      console.log(`${prefix} ${message}`, ...args)
    }
  }

  /**
   * Log debug information - only in development
   */
  static debug(message: string, ...args: any[]) {
    if (this.level >= LogLevel.DEBUG) {
      const prefix = this.context ? `[DEBUG]${this.context}` : '[DEBUG]'
      console.log(`${prefix} ${message}`, ...args)
    }
  }
}

// Initialize based on environment
// Note: This works for both Node.js (server) and browser (client)
const getLogLevel = (): LogLevel => {
  // Check for explicit LOG_LEVEL environment variable first
  const logLevelEnv = typeof process !== 'undefined' ? process.env.LOG_LEVEL : undefined
  if (logLevelEnv) {
    switch (logLevelEnv.toLowerCase()) {
      case 'error': return LogLevel.ERROR
      case 'warn': return LogLevel.WARN
      case 'info': return LogLevel.INFO
      case 'debug': return LogLevel.DEBUG
    }
  }

  // Default based on NODE_ENV
  const nodeEnv = typeof process !== 'undefined' ? process.env.NODE_ENV : undefined
  if (nodeEnv === 'production') {
    return LogLevel.WARN  // Production: Only errors and warnings
  } else {
    return LogLevel.DEBUG  // Development: Everything
  }
}

// Set initial log level
Logger.setLevel(getLogLevel())
