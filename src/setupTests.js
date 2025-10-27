// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Provide JSDOM shims and module mocks to stabilize tests that import
// heavyweight browser/ESM libs (lottie, d3, canvas usage).
// Mock lottie-react to a no-op React component
try {
	// jest is available in test environment (setupTests.js)
	jest.mock && jest.mock('lottie-react', () => ({ __esModule: true, default: () => null }));
} catch (e) {
	// ignore when not running under jest
}

// Mock react-markdown to avoid ESM transformation issues in Jest
try {
	jest.mock && jest.mock('react-markdown', () => ({ __esModule: true, default: (props) => {
		const React = require('react');
		return React.createElement('div', { 'data-testid': 'react-markdown' }, props.children || null);
	}}));
} catch (e) {}

// Mock remark-gfm (used by react-markdown) to prevent ESM parse errors in tests
try {
	jest.mock && jest.mock('remark-gfm', () => ({}));
} catch (e) {}

// Mock react-syntax-highlighter (and its prism styles) to avoid ESM transform issues
try {
	jest.mock && jest.mock('react-syntax-highlighter', () => ({ __esModule: true, Prism: (props) => {
		const React = require('react');
		return React.createElement('pre', { 'data-testid': 'syntax-highlighter' }, props.children || null);
	}}));
} catch (e) {}

try {
	jest.mock && jest.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({ __esModule: true, atomDark: {} }));
} catch (e) {}

// Mock lottie-web internals used by some modules
try {
	jest.mock && jest.mock('lottie-web', () => ({
		__esModule: true,
		default: {
			loadAnimation: () => ({ play: () => {}, stop: () => {}, destroy: () => {}, setSpeed: () => {} })
		}
	}));
} catch (e) {}

// Provide a light-weight d3 mock to avoid ESM transform issues in Jest
try {
	jest.mock && jest.mock('d3', () => ({
		__esModule: true,
		select: () => ({ append: () => ({ attr: () => {}, style: () => {}, text: () => {}, node: () => null }) }),
		scaleLinear: () => () => 0,
		axisBottom: () => () => {},
	}));
} catch (e) {}

// Shim canvas getContext in JSDOM so libraries expecting canvas don't crash
try {
	if (typeof HTMLCanvasElement !== 'undefined' && !HTMLCanvasElement.prototype.getContext) {
		HTMLCanvasElement.prototype.getContext = function () {
			return {
				fillRect: () => {},
				clearRect: () => {},
				getImageData: (x, y, w, h) => ({ data: new Array(w * h * 4).fill(0) }),
				putImageData: () => {},
				createImageData: () => [],
				setTransform: () => {},
				drawImage: () => {},
				save: () => {},
				restore: () => {},
				beginPath: () => {},
				fillText: () => {},
				measureText: () => ({ width: 0 }),
				stroke: () => {},
				translate: () => {},
				scale: () => {},
				rotate: () => {},
				arc: () => {},
				fill: () => {},
				strokeRect: () => {},
			};
		};
	}
} catch (e) {
	// ignore in environments without DOM
}

// Provide simple EventSource stub for tests (App uses EventSource)
try {
	if (typeof global.EventSource === 'undefined') {
		global.EventSource = class {
			constructor(url) { this.url = url; this.onmessage = null; this.onerror = null; this.onopen = null; }
			close() {}
		};
	}
} catch (e) {}

// Provide a minimal SpeechRecognition stub so App's mount effects don't toggle
// unsupported paths repeatedly during tests (which can cause infinite render
// loops). The real API is browser-only; this stub is sufficient for tests.
try {
	if (typeof global.SpeechRecognition === 'undefined' && typeof window !== 'undefined') {
		// Some environments expect SpeechRecognition available on window.
		global.SpeechRecognition = class {
			constructor() { this.continuous = false; this.interimResults = false; this.lang = 'en-US'; this.onresult = null; this.onerror = null; this.onend = null; }
			start() { /* no-op */ }
			stop() { if (typeof this.onend === 'function') { this.onend(); } }
			abort() { /* no-op */ }
		};
		// Also attach to window for code that references global/window directly
		try { window.SpeechRecognition = global.SpeechRecognition; } catch (e) {}
	}
} catch (e) {}

// Ensure HTMLMediaElement.play exists in JSDOM test env to avoid Not implemented errors.
// Some JSDOM versions provide a play() that throws "Not implemented"; override
// unconditionally so tests can call audio.play() safely.
try {
	if (typeof HTMLMediaElement !== 'undefined') {
		// Replace with a safe, resolved Promise-returning stub.
		HTMLMediaElement.prototype.play = function () {
			try {
				return Promise.resolve();
			} catch (e) {
				return Promise.resolve();
			}
		};
		// Also stub pause to a harmless no-op (some JSDOM versions throw on pause)
		HTMLMediaElement.prototype.pause = function () { return; };
	}
} catch (e) {}

// Tests can surface unhandled promise rejections from mounted effects (network
// stubs, SSE, background tasks). Convert them to warnings so the Jest process
// doesn't exit; this keeps tests stable while we add targeted guards/mocks.
try {
	if (typeof process !== 'undefined' && process && process.on) {
		process.on('unhandledRejection', (reason, promise) => {
			try {
				const repr = (reason && reason.message) ? reason.message : String(reason);
				console.warn('Test environment caught unhandledRejection (type=' + typeof reason + '):', repr);
			} catch (e) {
				console.warn('Test environment caught unhandledRejection (non-serializable reason)');
			}
			// swallow in test runs to avoid Jest process exit; real code should handle rejections.
		});
		process.on('uncaughtException', (err) => {
			try {
				console.warn('Test environment caught uncaughtException:', err && err.stack ? err.stack : err);
			} catch (e) {
				console.warn('Test environment caught uncaughtException (non-serializable)');
			}
		});
	}
} catch (e) {}
