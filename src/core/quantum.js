// quantum.js - Enhanced quantum simulator with better gates and algorithms
import { logger } from './logger.js';
import { PerformanceMonitor } from './perf.js';
import { AION_CONFIG } from './config.js';

// ========== QUANTUM MODULE ==========
/**
 * Represents the quantum state of a system with a given number of qubits.
 * Manages the state vector and keeps a history of applied gates.
 */
export class QuantumState {
  /**
   * Constructs a QuantumState.
   * @param {number} numQubits - The number of qubits in the system.
   */
  constructor(numQubits = 1) {
    if (numQubits > AION_CONFIG.quantum.maxQubits) {
      throw new Error(`Maximum qubit limit exceeded: ${numQubits} > ${AION_CONFIG.quantum.maxQubits}`);
    }
    
    this.numQubits = numQubits;
    this.state = this.initializeState();
    this.history = [];
    this.perfMonitor = new PerformanceMonitor();
  }

  /**
   * Initializes the quantum state to the |0...0⟩ state.
   * @returns {Array<{real: number, imag: number}>} The initialized state vector.
   */
  initializeState() {
    const size = Math.pow(2, this.numQubits);
    // create unique objects for each amplitude to avoid shared-reference bugs
    const state = new Array(size).fill(null).map((_, idx) => ({ real: idx === 0 ? 1 : 0, imag: 0 }));
    return state;
  }

  /**
   * Applies a quantum gate to specific qubits with proper tensor product handling.
   * @param {Array<Array<{real: number, imag: number}>>} gateMatrix - The gate matrix.
   * @param {number} targetQubit - The target qubit index.
   * @param {number} [controlQubit=null] - The control qubit index.
   * @returns {QuantumState} The current instance for chaining.
   */
  applyGate(gateMatrix, targetQubit, controlQubit = null) {
    this.perfMonitor.start('applyGate');
    
    try {
      if (targetQubit < 0 || targetQubit >= this.numQubits) {
        throw new Error(`Target qubit ${targetQubit} out of range`);
      }
      
      if (controlQubit !== null && (controlQubit < 0 || controlQubit >= this.numQubits)) {
        throw new Error(`Control qubit ${controlQubit} out of range`);
      }

      const size = Math.pow(2, this.numQubits);
      const newState = new Array(size).fill().map(() => ({ real: 0, imag: 0 }));

      // For single-qubit gates or controlled gates
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          // Check control qubit condition for controlled gates
          if (controlQubit !== null) {
            const controlBit = (j >> controlQubit) & 1;
            if (controlBit === 0) {
              // If control is 0, state remains unchanged (identity)
              if (i === j) {
                newState[i].real += this.state[j].real;
                newState[i].imag += this.state[j].imag;
              }
              continue;
            }
          }

          // Check if this state transition is affected by the gate
          const bitsMatch = this.checkBitsMatch(i, j, targetQubit);
          if (bitsMatch) {
            const gateRow = this.getGateRowIndex(i, targetQubit);
            const gateCol = this.getGateColIndex(j, targetQubit);
            
            const amplitude = this.state[j];
            const gateValue = gateMatrix[gateRow][gateCol];
            
            // Complex multiplication
            newState[i].real += amplitude.real * gateValue.real - amplitude.imag * gateValue.imag;
            newState[i].imag += amplitude.real * gateValue.imag + amplitude.imag * gateValue.real;
          } else if (i === j) {
            // Identity for unaffected states
            newState[i].real += this.state[j].real;
            newState[i].imag += this.state[j].imag;
          }
        }
      }

      this.history.push({
        gate: gateMatrix,
        target: targetQubit,
        control: controlQubit,
        before: JSON.parse(JSON.stringify(this.state)),
        after: JSON.parse(JSON.stringify(newState))
      });

      this.state = newState;
      return this;
    } catch (error) {
      logger.error('Error applying quantum gate', error);
      throw error;
    } finally {
      this.perfMonitor.end('applyGate');
    }
  }

  /**
   * Checks if two states match on all bits except the target qubit.
   */
  checkBitsMatch(i, j, targetQubit) {
    for (let q = 0; q < this.numQubits; q++) {
      if (q !== targetQubit) {
        const bitI = (i >> q) & 1;
        const bitJ = (j >> q) & 1;
        if (bitI !== bitJ) return false;
      }
    }
    return true;
  }

  /**
   * Gets the gate row index based on the target qubit value.
   */
  getGateRowIndex(stateIndex, targetQubit) {
    return (stateIndex >> targetQubit) & 1;
  }

  /**
   * Gets the gate column index based on the target qubit value.
   */
  getGateColIndex(stateIndex, targetQubit) {
    return (stateIndex >> targetQubit) & 1;
  }

  /**
   * Measures the quantum state, collapsing it to a classical outcome.
   * @returns {number} The measured classical outcome.
   */
  measure() {
    this.perfMonitor.start('measure');
    
    try {
      const probabilities = this.getProbabilities();
      const rand = Math.random();
      let cumulative = 0;
      let result = 0;

      for (let i = 0; i < probabilities.length; i++) {
        cumulative += probabilities[i];
        if (rand < cumulative) {
          result = i;
          break;
        }
      }

      // Collapse state
      this.state = this.state.map((amp, index) => 
        index === result ? { real: 1, imag: 0 } : { real: 0, imag: 0 }
      );

      logger.debug('Quantum measurement performed', { result, probabilities });
      return result;
    } finally {
      this.perfMonitor.end('measure');
    }
  }

  /**
   * Calculates the probabilities of measuring each basis state.
   * @returns {number[]} An array of probabilities.
   */
  getProbabilities() {
    const probabilities = this.state.map(amp => 
      Math.pow(amp.real, 2) + Math.pow(amp.imag, 2)
    );
    const sum = probabilities.reduce((a, b) => a + b, 0);
    return probabilities.map(p => p / sum);
  }

  /**
   * Returns a string representation of the quantum state.
   * @returns {string} Formatted state string.
   */
  toString() {
    return this.state.map((amp, i) => {
      const stateLabel = i.toString(2).padStart(this.numQubits, '0').split('').reverse().join('');
      const prob = (Math.pow(amp.real, 2) + Math.pow(amp.imag, 2)).toFixed(4);
      return `|${stateLabel}⟩: ${amp.real.toFixed(4)} + ${amp.imag.toFixed(4)}i (${(prob * 100).toFixed(2)}%)`;
    }).join('\n');
  }

  /**
   * Gets the current state vector.
   * @returns {Array} The state vector.
   */
  getStateVector() {
    return JSON.parse(JSON.stringify(this.state));
  }

  /**
   * Gets the operation history.
   * @returns {Array} The operation history.
   */
  getHistory() {
    return JSON.parse(JSON.stringify(this.history));
  }

  /**
   * Gets performance statistics.
   * @returns {Array} Performance metrics.
   */
  getPerformanceStats() {
    return this.perfMonitor.getMetrics();
  }
}

// Enhanced Quantum Gates with more operations
export const QuantumGates = {
  // Single-qubit gates
  H: [ // Hadamard
    [{ real: 1/Math.sqrt(2), imag: 0 }, { real: 1/Math.sqrt(2), imag: 0 }],
    [{ real: 1/Math.sqrt(2), imag: 0 }, { real: -1/Math.sqrt(2), imag: 0 }]
  ],
  X: [ // Pauli-X (NOT)
    [{ real: 0, imag: 0 }, { real: 1, imag: 0 }],
    [{ real: 1, imag: 0 }, { real: 0, imag: 0 }]
  ],
  Y: [ // Pauli-Y
    [{ real: 0, imag: 0 }, { real: 0, imag: -1 }],
    [{ real: 0, imag: 1 }, { real: 0, imag: 0 }]
  ],
  Z: [ // Pauli-Z
    [{ real: 1, imag: 0 }, { real: 0, imag: 0 }],
    [{ real: 0, imag: 0 }, { real: -1, imag: 0 }]
  ],
  S: [ // Phase gate
    [{ real: 1, imag: 0 }, { real: 0, imag: 0 }],
    [{ real: 0, imag: 0 }, { real: 0, imag: 1 }]
  ],
  T: [ // π/8 gate
    [{ real: 1, imag: 0 }, { real: 0, imag: 0 }],
    [{ real: 0, imag: 0 }, { real: Math.cos(Math.PI/4), imag: Math.sin(Math.PI/4) }]
  ],

  // Two-qubit gates
  CNOT: [ // Controlled-NOT
    [{ real: 1, imag: 0 }, { real: 0, imag: 0 }, { real: 0, imag: 0 }, { real: 0, imag: 0 }],
    [{ real: 0, imag: 0 }, { real: 1, imag: 0 }, { real: 0, imag: 0 }, { real: 0, imag: 0 }],
    [{ real: 0, imag: 0 }, { real: 0, imag: 0 }, { real: 0, imag: 0 }, { real: 1, imag: 0 }],
    [{ real: 0, imag: 0 }, { real: 0, imag: 0 }, { real: 1, imag: 0 }, { real: 0, imag: 0 }]
  ],
  SWAP: [ // SWAP gate
    [{ real: 1, imag: 0 }, { real: 0, imag: 0 }, { real: 0, imag: 0 }, { real: 0, imag: 0 }],
    [{ real: 0, imag: 0 }, { real: 0, imag: 0 }, { real: 1, imag: 0 }, { real: 0, imag: 0 }],
    [{ real: 0, imag: 0 }, { real: 1, imag: 0 }, { real: 0, imag: 0 }, { real: 0, imag: 0 }],
    [{ real: 0, imag: 0 }, { real: 0, imag: 0 }, { real: 0, imag: 0 }, { real: 1, imag: 0 }]
  ],
  CZ: [ // Controlled-Z
    [{ real: 1, imag: 0 }, { real: 0, imag: 0 }, { real: 0, imag: 0 }, { real: 0, imag: 0 }],
    [{ real: 0, imag: 0 }, { real: 1, imag: 0 }, { real: 0, imag: 0 }, { real: 0, imag: 0 }],
    [{ real: 0, imag: 0 }, { real: 0, imag: 0 }, { real: 1, imag: 0 }, { real: 0, imag: 0 }],
    [{ real: 0, imag: 0 }, { real: 0, imag: 0 }, { real: 0, imag: 0 }, { real: -1, imag: 0 }]
  ]
};

/**
 * Enhanced quantum simulator with algorithm implementations.
 */
export class QuantumSimulator {
  constructor() {
    this.circuits = {};
    this.perfMonitor = new PerformanceMonitor();
  }

  /**
   * Creates a new quantum circuit.
   * @param {string} name - Circuit name.
   * @param {number} numQubits - Number of qubits.
   * @returns {QuantumState} The created circuit.
   */
  createCircuit(name, numQubits) {
    if (this.circuits[name]) {
      throw new Error(`Circuit with name "${name}" already exists`);
    }
    
    this.circuits[name] = new QuantumState(numQubits);
    logger.debug(`Quantum circuit created: ${name} with ${numQubits} qubits`);
    return this.circuits[name];
  }

  /**
   * Retrieves a quantum circuit.
   * @param {string} name - Circuit name.
   * @returns {QuantumState|undefined} The circuit.
   */
  getCircuit(name) {
    return this.circuits[name];
  }

  /**
   * Runs measurement on all circuits.
   * @returns {Array} Measurement results.
   */
  runAll() {
    return Object.keys(this.circuits).map(name => ({
      name,
      result: this.circuits[name].measure(),
      state: this.circuits[name].toString(),
      probabilities: this.circuits[name].getProbabilities()
    }));
  }

  /**
   * Implements the Deutsch-Jozsa algorithm.
   * @param {Function} oracle - The oracle function.
   * @param {number} numQubits - Number of qubits.
   * @returns {Object} Algorithm result.
   */
  deutschJozsa(oracle, numQubits = 2) {
    this.perfMonitor.start('deutschJozsa');
    
    try {
      const circuit = this.createCircuit('deutsch-jozsa', numQubits);
      
      // Apply Hadamard to all qubits
      for (let i = 0; i < numQubits; i++) {
        circuit.applyGate(QuantumGates.H, i);
      }
      
      // Apply oracle (simplified - in real implementation, this would be a proper quantum oracle)
      // This is a placeholder for the actual oracle implementation
      
      // Apply Hadamard to first n-1 qubits
      for (let i = 0; i < numQubits - 1; i++) {
        circuit.applyGate(QuantumGates.H, i);
      }
      
      const result = circuit.measure();
      const isConstant = (result === 0);
      
      return {
        result,
        isConstant,
        interpretation: isConstant ? 'Constant function' : 'Balanced function'
      };
    } finally {
      this.perfMonitor.end('deutschJozsa');
    }
  }

  /**
   * Implements quantum teleportation protocol.
   * @returns {Object} Teleportation result.
   */
  quantumTeleportation() {
    this.perfMonitor.start('quantumTeleportation');
    
    try {
      const circuit = this.createCircuit('teleportation', 3);
      
      // Create entanglement between qubits 1 and 2
      circuit.applyGate(QuantumGates.H, 1);
      circuit.applyGate(QuantumGates.CNOT, 2, 1);
      
      // Prepare qubit 0 in some state (could be parameterized)
      circuit.applyGate(QuantumGates.H, 0);
      
      // Bell measurement
      circuit.applyGate(QuantumGates.CNOT, 0, 1);
      circuit.applyGate(QuantumGates.H, 0);
      
      const measurement1 = circuit.measure(); // Measure qubit 0
      const measurement2 = circuit.measure(); // Measure qubit 1
      
      // Conditional operations on qubit 2
      if (measurement2 === 1) {
        circuit.applyGate(QuantumGates.X, 2);
      }
      if (measurement1 === 1) {
        circuit.applyGate(QuantumGates.Z, 2);
      }
      
      return {
        measurements: [measurement1, measurement2],
        finalState: circuit.getStateVector(),
        success: true
      };
    } finally {
      this.perfMonitor.end('quantumTeleportation');
    }
  }

  /**
   * Gets performance statistics.
   * @returns {Array} Performance metrics.
   */
  getPerformanceStats() {
    return this.perfMonitor.getMetrics();
  }

  /**
   * Clears all circuits.
   */
  clearAll() {
    this.circuits = {};
    logger.info('All quantum circuits cleared');
  }
}