// errors.js
export class AionError extends Error {
  constructor(message, code, module) {
    super(message);
    this.code = code;
    this.module = module;
    this.timestamp = new Date();
  }
  
  toJSON() {
    return {
      message: this.message,
      code: this.code,
      module: this.module,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

// Usage
throw new AionError('Quantum gate application failed', 'QUANTUM_001', 'quantum.js');