import React from 'react';

// Simple Error Boundary that shows a readable message instead of a blank screen.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console for now; could be forwarded to telemetry
    console.error('Captured error in ErrorBoundary:', error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      const message = (this.state.error && (this.state.error.message || this.state.error.toString())) || 'Unknown error';
      return (
        React.createElement('div', { style: { padding: 24, fontFamily: 'sans-serif', color: '#fff', background: '#111', height: '100vh', boxSizing: 'border-box' } },
          React.createElement('h1', { style: { color: '#ff6b6b' } }, 'AION encountered an error'),
          React.createElement('p', null, message),
          React.createElement('pre', { style: { whiteSpace: 'pre-wrap', color:'#ddd' } }, (this.state.info && this.state.info.componentStack) || '')
        )
      );
    }
    return this.props.children;
  }
}
