// math.js - Enhanced math engine with better error handling and capabilities
import * as math from 'mathjs';
import { logger } from './logger.js';
import { PerformanceMonitor } from './perf.js';

// ========== MATH ENGINE ==========
/**
 * Provides mathematical computation capabilities using math.js.
 * Includes solving expressions, geometry, symbolic simplification, differentiation, and basic integration.
 */
export class MathEngine {
  constructor() {
    // Initialize math.js with BigNumber for precision
    this.math = math.create(math.all, {
      number: 'BigNumber',
      precision: 64
    });
    
    this.perfMonitor = new PerformanceMonitor();
    this.supportedGeometryShapes = ['circle', 'rectangle', 'triangle', 'sphere', 'cylinder'];
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
        expression,
        simplified: simplified.toString(),
        solution: this.math.format(solution),
        steps: this.generateSteps(node, simplified),
        type: 'expression'
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
          shape: 'circle',
          properties: { radius }
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
          shape: 'circle',
          properties: { radius }
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
          shape: 'rectangle',
          properties: { length, width }
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
          shape: 'triangle',
          properties: { base, height }
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
        expression,
        simplified: simplified.toString(),
        steps: [
          `Original: ${expression}`,
          `Simplified: ${simplified.toString()}`
        ],
        type: 'simplification'
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
        expression,
        variable,
        derivative: simplified.toString(),
        steps: [
          `Function: f(${variable}) = ${expression}`,
          `Differentiate with respect to: ${variable}`,
          `Derivative: f'(${variable}) = ${simplified.toString()}`
        ],
        type: 'differentiation'
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
   * Solves equations using math.js capabilities.
   * @param {string} equation - The equation to solve.
   * @param {string} variable - The variable to solve for.
   * @returns {object} Solution object with steps.
   */
  solveEquation(equation, variable = 'x') {
    this.perfMonitor.start('solveEquation');
    
    try {
      // Remove spaces and ensure proper format
      const cleanEquation = equation.replace(/\s+/g, '');
      
      // Use math.js solve function
      const solutions = this.math.solve(equation, variable);
      
      const result = {
        equation,
        variable,
        solutions: Array.isArray(solutions) ? solutions : [solutions],
        steps: [
          `Equation: ${equation}`,
          `Solve for: ${variable}`,
          `Solution: ${variable} = ${Array.isArray(solutions) ? solutions.join(', ') : solutions}`
        ],
        type: 'equation'
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
}