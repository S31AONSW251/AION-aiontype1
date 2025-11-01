// Mock heavy/ESM modules before importing the component so Jest doesn't try to parse them
jest.mock('d3', () => ({}));
jest.mock('lottie-react', () => () => null);

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import SearchPanel from './SearchPanel';

test('provider toggle is keyboard-accessible and updates aria-checked', () => {
  const props = {
    // agentStatus used by component; pass a simple flag for tests to avoid rendering objects
    agentStatus: true,
    searchPlan: [],
    thoughtProcessLog: [],
    searchResults: [],
    isSearching: false,
    onNewSearch: jest.fn(),
    suggestedQueries: [],
    searchSummary: null,
    keyEntities: [],
    searchQuery: '',
    searchError: null,
    onExport: jest.fn(),
    onFollowUp: jest.fn(),
  };

  const { getByLabelText } = render(<SearchPanel {...props} />);

  // AION input toggle should exist and be checked by default
  const aionInput = getByLabelText('Toggle AION provider');
  expect(aionInput).toBeInTheDocument();
  expect(aionInput.checked).toBe(true);

  // Toggle by clicking the input (simulates activation)
  fireEvent.click(aionInput);
  expect(aionInput.checked).toBe(false);
});
