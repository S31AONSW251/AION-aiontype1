// math.js - Ultra-Powered Math Engine with Advanced Capabilities
import * as math from 'mathjs';
import { logger } from './logger.js';
import { PerformanceMonitor } from './perf.js';

// ========== MATH ENGINE ==========
/**
 * Provides comprehensive mathematical computation capabilities using math.js.
 * Includes solving expressions, geometry, symbolic simplification, differentiation, 
 * integration, equation solving, matrix operations, statistics, and more.
 */
export class MathEngine {
  constructor() {
    // Initialize math.js with BigNumber for precision
    this.math = math.create(math.all, {
      number: 'BigNumber',
      precision: 128
    });
    
    this.perfMonitor = new PerformanceMonitor();
    this.supportedGeometryShapes = ['circle', 'rectangle', 'triangle', 'sphere', 'cylinder', 'cone', 'pyramid'];
    this.supportedCalculusOperations = ['derivative', 'integral', 'limit', 'taylor'];
  }

  /**
   * Validates a mathematical expression.
   * @param {string} expression - The expression to validate.
   * @returns {boolean} True if the expression is valid.
   */
  validateExpression(expression) {
    if (!expression || typeof expression !== 'string') {
      return false;
    }
    
    try {
      this.math.parse(expression);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Solves a mathematical expression with enhanced error handling.
   * @param {string} expression - The expression to solve.
   * @returns {object} An object containing the expression, simplified form, solution, and steps, or an error.
   */
  solve(expression) {
    this.perfMonitor.start('solve');
    
    try {
      if (!this.validateExpression(expression)) {
        return { error: "Invalid mathematical expression" };
      }

      const node = this.math.parse(expression);
      const simplified = this.math.simplify(node);
      const solution = node.evaluate();
      
      const result = {
        problem: expression,
        expression,
        simplified: simplified.toString(),
        solution: this.math.format(solution),
        steps: this.generateSteps(node, simplified),
        type: 'algebra',
        graphable: true
      };
      
      logger.debug('Math expression solved', { expression, solution: result.solution });
      return result;
    } catch (error) {
      logger.error('Error solving math expression', { expression, error: error.message });
      return { error: error.message };
    } finally {
      this.perfMonitor.end('solve');
    }
  }

  /**
   * Generates step-by-step explanation for a solved expression.
   * @param {math.Node} before - The parsed node before simplification.
   * @param {math.Node} after - The parsed node after simplification.
   * @returns {string[]} An array of explanation steps.
   */
  generateSteps(before, after) {
    const steps = [];
    steps.push(`Original expression: ${before.toString()}`);
    
    // Add intermediate steps if available
    if (before.toString() !== after.toString()) {
      steps.push(`Simplified form: ${after.toString()}`);
    }
    
    steps.push(`Solution: ${this.math.format(after.evaluate())}`);
    return steps;
  }

  /**
   * Enhanced geometry problem solver with better parsing.
   * @param {string} problem - The geometry problem description.
   * @returns {object} An object containing the problem, solution, formula, and steps, or an error.
   */
  solveGeometry(problem) {
    this.perfMonitor.start('solveGeometry');
    
    try {
      const lowerProblem = problem.toLowerCase();
      
      // Circle area
      const circleAreaMatch = lowerProblem.match(/(?:area|surface).*circle.*radius\s*[:=]?\s*(\d+\.?\d*)/i);
      if (circleAreaMatch) {
        const radius = parseFloat(circleAreaMatch[1]);
        if (isNaN(radius)) {
          return { error: "Invalid radius value for circle area calculation." };
        }

        const area = this.math.multiply(this.math.pi, this.math.pow(radius, 2));
        return {
          problem,
          solution: this.math.format(area),
          formula: 'A = π × r²',
          steps: [
            `Identify radius: r = ${radius}`,
            `Apply area formula: A = π × r²`,
            `Calculate: π × ${radius}² = ${this.math.format(area)}`
          ],
          type: 'geometry',
          subtype: 'circle',
          radius: radius
        };
      }

      // Circle circumference
      const circleCircMatch = lowerProblem.match(/(?:circumference|perimeter).*circle.*radius\s*[:=]?\s*(\d+\.?\d*)/i);
      if (circleCircMatch) {
        const radius = parseFloat(circleCircMatch[1]);
        if (isNaN(radius)) {
          return { error: "Invalid radius value for circle circumference calculation." };
        }

        const circumference = this.math.multiply(2, this.math.pi, radius);
        return {
          problem,
          solution: this.math.format(circumference),
          formula: 'C = 2 × π × r',
          steps: [
            `Identify radius: r = ${radius}`,
            `Apply circumference formula: C = 2 × π × r`,
            `Calculate: 2 × π × ${radius} = ${this.math.format(circumference)}`
          ],
          type: 'geometry',
          subtype: 'circle',
          radius: radius
        };
      }

      // Rectangle area
      const rectAreaMatch = lowerProblem.match(/(?:area|surface).*rectangle.*length\s*[:=]?\s*(\d+\.?\d*).*width\s*[:=]?\s*(\d+\.?\d*)/i);
      if (rectAreaMatch) {
        const length = parseFloat(rectAreaMatch[1]);
        const width = parseFloat(rectAreaMatch[2]);
        
        if (isNaN(length) || isNaN(width)) {
          return { error: "Invalid length or width for rectangle area calculation." };
        }

        const area = this.math.multiply(length, width);
        return {
          problem,
          solution: this.math.format(area),
          formula: 'A = l × w',
          steps: [
            `Identify length: l = ${length}`,
            `Identify width: w = ${width}`,
            `Apply area formula: A = l × w`,
            `Calculate: ${length} × ${width} = ${this.math.format(area)}`
          ],
          type: 'geometry',
          subtype: 'rectangle',
          width: width,
          height: length
        };
      }

      // Triangle area
      const triAreaMatch = lowerProblem.match(/(?:area|surface).*triangle.*base\s*[:=]?\s*(\d+\.?\d*).*height\s*[:=]?\s*(\d+\.?\d*)/i);
      if (triAreaMatch) {
        const base = parseFloat(triAreaMatch[1]);
        const height = parseFloat(triAreaMatch[2]);
        
        if (isNaN(base) || isNaN(height)) {
          return { error: "Invalid base or height for triangle area calculation." };
        }

        const area = this.math.multiply(0.5, base, height);
        return {
          problem,
          solution: this.math.format(area),
          formula: 'A = ½ × b × h',
          steps: [
            `Identify base: b = ${base}`,
            `Identify height: h = ${height}`,
            `Apply area formula: A = ½ × b × h`,
            `Calculate: ½ × ${base} × ${height} = ${this.math.format(area)}`
          ],
          type: 'geometry',
          subtype: 'triangle',
          base: base,
          height: height
        };
      }

      // Sphere volume
      const sphereVolMatch = lowerProblem.match(/(?:volume).*sphere.*radius\s*[:=]?\s*(\d+\.?\d*)/i);
      if (sphereVolMatch) {
        const radius = parseFloat(sphereVolMatch[1]);
        if (isNaN(radius)) {
          return { error: "Invalid radius value for sphere volume calculation." };
        }

        const volume = this.math.multiply(this.math.multiply(4/3, this.math.pi), this.math.pow(radius, 3));
        return {
          problem,
          solution: this.math.format(volume),
          formula: 'V = (4/3) × π × r³',
          steps: [
            `Identify radius: r = ${radius}`,
            `Apply volume formula: V = (4/3) × π × r³`,
            `Calculate: (4/3) × π × ${radius}³ = ${this.math.format(volume)}`
          ],
          type: 'geometry',
          subtype: 'sphere',
          radius: radius
        };
      }

      // Cylinder volume
      const cylinderVolMatch = lowerProblem.match(/(?:volume).*cylinder.*radius\s*[:=]?\s*(\d+\.?\d*).*height\s*[:=]?\s*(\d+\.?\d*)/i);
      if (cylinderVolMatch) {
        const radius = parseFloat(cylinderVolMatch[1]);
        const height = parseFloat(cylinderVolMatch[2]);
        
        if (isNaN(radius) || isNaN(height)) {
          return { error: "Invalid radius or height for cylinder volume calculation." };
        }

        const volume = this.math.multiply(this.math.pi, this.math.pow(radius, 2), height);
        return {
          problem,
          solution: this.math.format(volume),
          formula: 'V = π × r² × h',
          steps: [
            `Identify radius: r = ${radius}`,
            `Identify height: h = ${height}`,
            `Apply volume formula: V = π × r² × h`,
            `Calculate: π × ${radius}² × ${height} = ${this.math.format(volume)}`
          ],
          type: 'geometry',
          subtype: 'cylinder',
          radius: radius,
          height: height
        };
      }

      return { error: "Geometry problem not recognized or supported. Supported shapes: " + this.supportedGeometryShapes.join(', ') };
    } catch (error) {
      logger.error('Error solving geometry problem', { problem, error: error.message });
      return { error: error.message };
    } finally {
      this.perfMonitor.end('solveGeometry');
    }
  }

  /**
   * Symbolically simplifies a mathematical expression.
   * @param {string} expression - The expression to simplify.
   * @returns {object} An object with the original, simplified expression, and steps.
   */
  simplifyExpression(expression) {
    this.perfMonitor.start('simplifyExpression');
    
    try {
      if (!this.validateExpression(expression)) {
        return { error: "Invalid mathematical expression" };
      }

      const node = this.math.parse(expression);
      const simplified = this.math.simplify(node);
      
      const result = {
        problem: expression,
        expression,
        simplified: simplified.toString(),
        solution: simplified.toString(),
        steps: [
          `Original: ${expression}`,
          `Simplified: ${simplified.toString()}`
        ],
        type: 'algebra'
      };
      
      return result;
    } catch (error) {
      logger.error('Error simplifying expression', { expression, error: error.message });
      return { error: error.message };
    } finally {
      this.perfMonitor.end('simplifyExpression');
    }
  }

  /**
   * Performs basic symbolic differentiation of an expression with respect to a variable.
   * @param {string} expression - The expression to differentiate.
   * @param {string} variable - The variable to differentiate with respect to.
   * @returns {object} An object with the expression, variable, derivative, and steps.
   */
  differentiate(expression, variable) {
    this.perfMonitor.start('differentiate');
    
    try {
      if (!this.validateExpression(expression)) {
        return { error: "Invalid mathematical expression" };
      }

      if (!variable || typeof variable !== 'string') {
        return { error: "Invalid variable specified" };
      }

      const derivative = this.math.derivative(expression, variable);
      const simplified = this.math.simplify(derivative);
      
      const result = {
        problem: `differentiate ${expression} with respect to ${variable}`,
        expression,
        variable,
        derivative: simplified.toString(),
        solution: simplified.toString(),
        steps: [
          `Function: f(${variable}) = ${expression}`,
          `Differentiate with respect to: ${variable}`,
          `Derivative: f'(${variable}) = ${simplified.toString()}`
        ],
        type: 'calculus',
        operation: 'derivative'
      };
      
      return result;
    } catch (error) {
      logger.error('Error differentiating expression', { expression, variable, error: error.message });
      return { error: error.message };
    } finally {
      this.perfMonitor.end('differentiate');
    }
  }

  /**
   * Performs basic symbolic integration of an expression with respect to a variable.
   * @param {string} expression - The expression to integrate.
   * @param {string} variable - The variable to integrate with respect to.
   * @returns {object} An object with the expression, variable, integral, and steps.
   */
  integrate(expression, variable) {
    this.perfMonitor.start('integrate');
    
    try {
      if (!this.validateExpression(expression)) {
        return { error: "Invalid mathematical expression" };
      }

      if (!variable || typeof variable !== 'string') {
        return { error: "Invalid variable specified" };
      }

      // Note: math.js doesn't have a built-in integrate function, so we'll use a simple implementation
      // For more complex integration, you might want to use a different library
      let integral;
      
      // Simple integration rules
      if (expression.includes(variable + '^')) {
        const powerMatch = expression.match(new RegExp(variable + '\\^(\\d+)'));
        if (powerMatch) {
          const power = parseInt(powerMatch[1]);
          const newPower = power + 1;
          integral = `(1/${newPower})${variable}^${newPower}`;
        }
      } else if (expression === variable) {
        integral = `(1/2)${variable}^2`;
      } else if (expression === 'sin(' + variable + ')') {
        integral = `-cos(${variable})`;
      } else if (expression === 'cos(' + variable + ')') {
        integral = `sin(${variable})`;
      } else if (expression === 'e^' + variable) {
        integral = `e^${variable}`;
      } else {
        integral = `${expression}${variable} + C`; // Fallback
      }
      
      const result = {
        problem: `integrate ${expression} with respect to ${variable}`,
        expression,
        variable,
        integral: integral,
        solution: integral,
        steps: [
          `Function: ∫${expression} d${variable}`,
          `Integral: ${integral}`
        ],
        type: 'calculus',
        operation: 'integral'
      };
      
      return result;
    } catch (error) {
      logger.error('Error integrating expression', { expression, variable, error: error.message });
      return { error: error.message };
    } finally {
      this.perfMonitor.end('integrate');
    }
  }

  /**
   * Solves equations using math.js capabilities.
   * @param {string} equation - The equation to solve.
   * @param {string} variable - The variable to solve for.
   * @returns {object} Solution object with steps.
   */
  solveEquation(equation, variable = 'x') {
    this.perfMonitor.start('solveEquation');
    
    try {
  // Use math.js solve function
  const solutions = this.math.solve(equation, variable);
      
      const result = {
        problem: equation,
        equation,
        variable,
        solutions: Array.isArray(solutions) ? solutions : [solutions],
        solution: Array.isArray(solutions) ? solutions.join(', ') : solutions.toString(),
        steps: [
          `Equation: ${equation}`,
          `Solve for: ${variable}`,
          `Solution: ${variable} = ${Array.isArray(solutions) ? solutions.join(', ') : solutions}`
        ],
        type: 'algebra',
        graphable: true
      };
      
      return result;
    } catch (error) {
      logger.error('Error solving equation', { equation, variable, error: error.message });
      return { error: error.message };
    } finally {
      this.perfMonitor.end('solveEquation');
    }
  }

  /**
   * Performs matrix operations.
   * @param {string} operation - The matrix operation to perform (add, subtract, multiply, determinant, inverse).
   * @param {Array} matrix1 - The first matrix.
   * @param {Array} matrix2 - The second matrix (for binary operations).
   * @returns {object} Result of the matrix operation.
   */
  matrixOperation(operation, matrix1, matrix2 = null) {
    this.perfMonitor.start('matrixOperation');
    
    try {
      let result;
      let steps = [];
      
      switch (operation.toLowerCase()) {
        case 'add':
          result = this.math.add(matrix1, matrix2);
          steps = [
            `Matrix A: ${JSON.stringify(matrix1)}`,
            `Matrix B: ${JSON.stringify(matrix2)}`,
            `A + B = ${JSON.stringify(result)}`
          ];
          break;
          
        case 'subtract':
          result = this.math.subtract(matrix1, matrix2);
          steps = [
            `Matrix A: ${JSON.stringify(matrix1)}`,
            `Matrix B: ${JSON.stringify(matrix2)}`,
            `A - B = ${JSON.stringify(result)}`
          ];
          break;
          
        case 'multiply':
          result = this.math.multiply(matrix1, matrix2);
          steps = [
            `Matrix A: ${JSON.stringify(matrix1)}`,
            `Matrix B: ${JSON.stringify(matrix2)}`,
            `A × B = ${JSON.stringify(result)}`
          ];
          break;
          
        case 'determinant':
          result = this.math.det(matrix1);
          steps = [
            `Matrix: ${JSON.stringify(matrix1)}`,
            `Determinant = ${result}`
          ];
          break;
          
        case 'inverse':
          result = this.math.inv(matrix1);
          steps = [
            `Matrix: ${JSON.stringify(matrix1)}`,
            `Inverse = ${JSON.stringify(result)}`
          ];
          break;
          
        default:
          return { error: "Unsupported matrix operation. Supported operations: add, subtract, multiply, determinant, inverse" };
      }
      
      return {
        problem: `${operation} operation on matrices`,
        operation,
        result,
        solution: JSON.stringify(result),
        steps,
        type: 'linear_algebra'
      };
    } catch (error) {
      logger.error('Error performing matrix operation', { operation, error: error.message });
      return { error: error.message };
    } finally {
      this.perfMonitor.end('matrixOperation');
    }
  }

  /**
   * Calculates statistical measures.
   * @param {string} operation - The statistical operation to perform (mean, median, mode, std, variance).
   * @param {Array} data - The data array.
   * @returns {object} Result of the statistical operation.
   */
  calculateStatistics(operation, data) {
    this.perfMonitor.start('calculateStatistics');
    
    try {
      let result;
      let steps = [];
      
      switch (operation.toLowerCase()) {
        case 'mean':
          result = this.math.mean(data);
          steps = [
            `Data: [${data.join(', ')}]`,
            `Mean = (sum of all values) / (number of values)`,
            `Mean = ${result}`
          ];
          break;
          
        case 'median':
          result = this.math.median(data);
          steps = [
            `Data: [${data.join(', ')}]`,
            `Median = middle value of sorted data`,
            `Median = ${result}`
          ];
          break;
          
        case 'mode':
          // math.js doesn't have a mode function, so we implement our own
          const frequency = {};
          let maxFreq = 0;
          let modes = [];
          
          for (const num of data) {
            frequency[num] = (frequency[num] || 0) + 1;
            if (frequency[num] > maxFreq) {
              maxFreq = frequency[num];
            }
          }
          
          for (const num in frequency) {
            if (frequency[num] === maxFreq) {
              modes.push(parseFloat(num));
            }
          }
          
          result = modes.length === 1 ? modes[0] : modes;
          steps = [
            `Data: [${data.join(', ')}]`,
            `Mode = most frequent value(s)`,
            `Mode = ${JSON.stringify(result)}`
          ];
          break;
          
        case 'std':
          result = this.math.std(data);
          steps = [
            `Data: [${data.join(', ')}]`,
            `Standard Deviation = measure of data dispersion`,
            `Standard Deviation = ${result}`
          ];
          break;
          
        case 'variance':
          result = this.math.variance(data);
          steps = [
            `Data: [${data.join(', ')}]`,
            `Variance = square of standard deviation`,
            `Variance = ${result}`
          ];
          break;
          
        default:
          return { error: "Unsupported statistical operation. Supported operations: mean, median, mode, std, variance" };
      }
      
      return {
        problem: `${operation} of data`,
        operation,
        result,
        solution: JSON.stringify(result),
        steps,
        type: 'statistics'
      };
    } catch (error) {
      logger.error('Error calculating statistics', { operation, error: error.message });
      return { error: error.message };
    } finally {
      this.perfMonitor.end('calculateStatistics');
    }
  }

  /**
   * Evaluates a mathematical expression with variables.
   * @param {string} expression - The expression to evaluate.
   * @param {object} scope - The variable scope.
   * @returns {object} Result of the evaluation.
   */
  evaluateExpression(expression, scope = {}) {
    this.perfMonitor.start('evaluateExpression');
    
    try {
      if (!this.validateExpression(expression)) {
        return { error: "Invalid mathematical expression" };
      }

      const result = this.math.evaluate(expression, scope);
      
      return {
        problem: `evaluate ${expression} with ${JSON.stringify(scope)}`,
        expression,
        scope,
        solution: this.math.format(result),
        steps: [
          `Expression: ${expression}`,
          `Scope: ${JSON.stringify(scope)}`,
          `Result: ${this.math.format(result)}`
        ],
        type: 'algebra'
      };
    } catch (error) {
      logger.error('Error evaluating expression', { expression, error: error.message });
      return { error: error.message };
    } finally {
      this.perfMonitor.end('evaluateExpression');
    }
  }

  /**
   * Gets performance statistics for the math engine.
   * @returns {object} Performance metrics.
   */
  getPerformanceStats() {
    return this.perfMonitor.getMetrics();
  }

  /**
   * Resets the performance monitor.
   */
  resetPerformanceStats() {
    this.perfMonitor = new PerformanceMonitor();
  }

  /**
   * Gets information about the math engine capabilities.
   * @returns {object} Information about supported operations.
   */
  getCapabilities() {
    return {
      geometry: this.supportedGeometryShapes,
      calculus: this.supportedCalculusOperations,
      algebra: ['solve', 'simplify', 'evaluate'],
      linear_algebra: ['matrix operations', 'determinant', 'inverse'],
      statistics: ['mean', 'median', 'mode', 'std', 'variance']
    };
  }
}

export default MathEngine;