import { DEFAULT_SETTINGS } from './App';

test('uses black glass as the default AION theme', () => {
  expect(DEFAULT_SETTINGS.theme).toBe('dark');
  expect(DEFAULT_SETTINGS.palette).toBe('black');
});
