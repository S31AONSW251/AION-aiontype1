// config.js
export const AION_CONFIG = {
  memory: {
    maxMemories: 1000,
    embeddingDimensions: 512,
    recencyHalfLife: 30 // days
  },
  neural: {
    activation: 'relu',
    learningRate: 0.01
  },
  quantum: {
    maxQubits: 12,
    defaultGate: 'H'
  }
};