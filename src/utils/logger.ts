type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isDevelopment = import.meta.env.MODE === 'development';

  info(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.log(`[SmartGPay INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.warn(`[SmartGPay WARN] ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]) {
    console.error(`[SmartGPay ERROR] ${message}`, ...args);
  }

  debug(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.debug(`[SmartGPay DEBUG] ${message}`, ...args);
    }
  }
}

export const logger = new Logger();
