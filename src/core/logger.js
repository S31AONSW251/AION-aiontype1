// logger.js
export class AionLogger {
  constructor(level = 'info') {
    this.level = level;
    this.levels = { error: 0, warn: 1, info: 2, debug: 3 };
    this.consoleMap = {
      error: console.error.bind(console),
      warn: console.warn.bind(console),
      info: console.info ? console.info.bind(console) : console.log.bind(console),
      debug: console.debug ? console.debug.bind(console) : console.log.bind(console)
    };
  }
  
  log(message, level = 'info') {
    if (!this.levels.hasOwnProperty(level)) level = 'info';
    if (this.levels[level] <= this.levels[this.level]) {
      const fn = this.consoleMap[level] || console.log.bind(console);
      fn(`[${level.toUpperCase()}] ${new Date().toISOString()}: ${message}`);
    }
  }
  
  error(message) { this.log(message, 'error'); }
  warn(message) { this.log(message, 'warn'); }
  info(message) { this.log(message, 'info'); }
  debug(message) { this.log(message, 'debug'); }
}

export const logger = new AionLogger();