import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('Ultra Power Mode UI', () => {
  test('toggle button exists and toggles aria-pressed', async () => {
    render(<App />);

    // Find the button by title (we set title="Toggle Ultra Power Mode")
    const btn = await screen.findByTitle('Toggle Ultra Power Mode');
    expect(btn).toBeInTheDocument();

    // Initially should be not pressed (false)
    expect(btn.getAttribute('aria-pressed')).toBe('false');

    // Click to enable
    fireEvent.click(btn);
    expect(btn.getAttribute('aria-pressed')).toBe('true');

    // Click to disable
    fireEvent.click(btn);
    expect(btn.getAttribute('aria-pressed')).toBe('false');
  }, 20000);
});
