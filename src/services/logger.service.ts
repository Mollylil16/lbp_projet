/**
 * Service de logging structuré
 * - En développement : log dans la console
 * - En production : peut être envoyé à Sentry ou autre service
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogContext {
  [key: string]: any
}

class LoggerService {
  private isDevelopment = import.meta.env.DEV

  /**
   * Log un message avec un niveau et un contexte
   */
  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      message,
      context: context || {},
      url: window.location.href,
      userAgent: navigator.userAgent,
    }

    // En développement, log dans la console
    if (this.isDevelopment) {
      const style = this.getLogStyle(level)
      console.log(`%c[${level.toUpperCase()}] ${timestamp}`, style, message, context || '')
    }

    // En production, envoyer à un service externe (Sentry, etc.)
    if (!this.isDevelopment && level === LogLevel.ERROR) {
      // TODO: Intégrer Sentry ou autre service de monitoring
      // Sentry.captureException(new Error(message), { extra: logEntry })
    }

    // Stocker les erreurs critiques dans localStorage pour debug
    if (level === LogLevel.ERROR) {
      this.storeErrorLog(logEntry)
    }
  }

  /**
   * Obtenir le style CSS pour le log console
   */
  private getLogStyle(level: LogLevel): string {
    const styles = {
      [LogLevel.DEBUG]: 'color: #6b7280; font-weight: normal',
      [LogLevel.INFO]: 'color: #3b82f6; font-weight: normal',
      [LogLevel.WARN]: 'color: #f59e0b; font-weight: bold',
      [LogLevel.ERROR]: 'color: #ef4444; font-weight: bold',
    }
    return styles[level]
  }

  /**
   * Stocker les erreurs dans localStorage (limité à 50)
   */
  private storeErrorLog(logEntry: any) {
    try {
      const errorLogs = JSON.parse(localStorage.getItem('lbp_error_logs') || '[]')
      errorLogs.push(logEntry)
      
      // Garder seulement les 50 dernières erreurs
      if (errorLogs.length > 50) {
        errorLogs.shift()
      }
      
      localStorage.setItem('lbp_error_logs', JSON.stringify(errorLogs))
    } catch (error) {
      console.error('Erreur lors du stockage du log:', error)
    }
  }

  /**
   * Log de debug (développement uniquement)
   */
  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      this.log(LogLevel.DEBUG, message, context)
    }
  }

  /**
   * Log d'information
   */
  info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, message, context)
  }

  /**
   * Log d'avertissement
   */
  warn(message: string, context?: LogContext) {
    this.log(LogLevel.WARN, message, context)
  }

  /**
   * Log d'erreur
   */
  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorContext: LogContext = {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    }

    this.log(LogLevel.ERROR, message, errorContext)
  }

  /**
   * Récupérer les logs d'erreur stockés
   */
  getErrorLogs(): any[] {
    try {
      return JSON.parse(localStorage.getItem('lbp_error_logs') || '[]')
    } catch {
      return []
    }
  }

  /**
   * Effacer les logs d'erreur stockés
   */
  clearErrorLogs() {
    localStorage.removeItem('lbp_error_logs')
  }
}

export const logger = new LoggerService()
