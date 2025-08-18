type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    if (this.isDevelopment) {
      // Only log in development mode for debugging
      const color = this.getColorForLevel(level);
      try {
        console.log(
          `%c[${entry.timestamp}] ${level.toUpperCase()}: ${message}`,
          `color: ${color}`,
          data || ''
        );
      } catch {
        // Fail silently in case console is not available
      }
    }

    // In production, send to external monitoring service
    // Example: this.sendToMonitoring(entry);
  }

  private getColorForLevel(level: LogLevel): string {
    switch (level) {
      case 'error': return '#ef4444';
      case 'warn': return '#f59e0b';
      case 'info': return '#3b82f6';
      case 'debug': return '#6b7280';
      default: return '#000000';
    }
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }
}

export const logger = new Logger();