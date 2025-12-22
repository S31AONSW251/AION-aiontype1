import { render, screen } from '@testing-library/react';
import AppLoader from './App.loader';

test('loads app loader and shows fallback', async () => {
  render(<AppLoader />);
  const loading = await screen.findByText(/Loading AION/i);
  expect(loading).toBeInTheDocument();
});
