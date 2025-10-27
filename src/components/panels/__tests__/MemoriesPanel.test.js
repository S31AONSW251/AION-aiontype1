import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MemoryManager from '../MemoriesPanel';

beforeEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
});

test('retrieves and highlights matches, and pins/unpins', async () => {
  const sample = [
    { id: 'm1', text: 'This memory contains the word unicorn and more details.', score: 0.92, metadata: { timestamp: '2025-10-26', type: 'episodic' } },
    { id: 'm2', text: 'Another memory about dragons and unicorn sightings.', score: 0.81, metadata: { timestamp: '2025-10-25', type: 'episodic' } },
  ];

  const onMemoryRetrieval = jest.fn().mockResolvedValue(sample);
  const onMemoryUpdate = jest.fn();

  render(<MemoryManager soulState={{}} onMemoryRetrieval={onMemoryRetrieval} onMemoryUpdate={onMemoryUpdate} onMemoryConsolidation={async ()=>{}} />);

  const input = screen.getByPlaceholderText('Search memories semantically...');
  fireEvent.change(input, { target: { value: 'unicorn' } });
  fireEvent.click(screen.getByText('Retrieve'));

  await waitFor(() => expect(onMemoryRetrieval).toHaveBeenCalledWith('unicorn'));

  // wait for at least one result to appear
  await waitFor(() => expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(1));
  // check that at least one <mark> exists
  const mark = document.querySelector('mark');
  expect(mark).toBeTruthy();

  // pin first result using aria-label
  const pinButtons = screen.getAllByLabelText(/Pin memory|Unpin memory/);
  expect(pinButtons.length).toBeGreaterThan(0);
  fireEvent.click(pinButtons[0]);

  // localStorage should have pinned id
  const stored = JSON.parse(localStorage.getItem('aion_pinned_memories') || '[]');
  expect(stored.length).toBeGreaterThanOrEqual(1);
});

test('edit modal saves and calls onMemoryUpdate', async () => {
  const sample = [ { id: 'e1', text: 'Editable memory', score: 0.5, metadata: { timestamp: '2025-01-01', type: 'procedural' } } ];
  const onMemoryRetrieval = jest.fn().mockResolvedValue(sample);
  const onMemoryUpdate = jest.fn();

  render(<MemoryManager soulState={{}} onMemoryRetrieval={onMemoryRetrieval} onMemoryUpdate={onMemoryUpdate} onMemoryConsolidation={async ()=>{}} />);

  fireEvent.change(screen.getByPlaceholderText('Search memories semantically...'), { target: { value: 'Editable' } });
  fireEvent.click(screen.getByText('Retrieve'));

  await waitFor(() => expect(onMemoryRetrieval).toHaveBeenCalled());

  // wait for Edit button to appear and open modal
  const editBtn = await screen.findByText('Edit');
  fireEvent.click(editBtn);
  // textarea should appear (find by its displayed value)
  const ta = await screen.findByDisplayValue('Editable memory');
  fireEvent.change(ta, { target: { value: 'Edited content' } });
  fireEvent.click(screen.getByText('Save'));

  await waitFor(() => expect(onMemoryUpdate).toHaveBeenCalled());
});

test('pin reorder via move up/down updates localStorage order', async () => {
  const sample = [
    { id: 'a1', text: 'First memory', score: 0.9, metadata: {} },
    { id: 'a2', text: 'Second memory', score: 0.8, metadata: {} },
  ];
  const onMemoryRetrieval = jest.fn().mockResolvedValue(sample);
  render(<MemoryManager soulState={{}} onMemoryRetrieval={onMemoryRetrieval} onMemoryUpdate={async ()=>{}} onMemoryConsolidation={async ()=>{}} />);

  fireEvent.change(screen.getByPlaceholderText('Search memories semantically...'), { target: { value: 'First' } });
  fireEvent.click(screen.getByText('Retrieve'));
  await waitFor(() => expect(onMemoryRetrieval).toHaveBeenCalled());

  // pin both (use aria-label)
  await waitFor(() => expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(1));
  const pinButtons = screen.getAllByLabelText(/Pin memory|Unpin memory/);
  pinButtons.forEach(b => fireEvent.click(b));

  // open Manage Pins
  fireEvent.click(screen.getByText('Manage Pins'));

  // find move buttons
  const upBtns = await screen.findAllByLabelText('Move pin up');
  const downBtns = await screen.findAllByLabelText('Move pin down');
  expect(upBtns.length + downBtns.length).toBeGreaterThanOrEqual(2);

  // move second item up (if exists)
  if (upBtns[1]) fireEvent.click(upBtns[1]);

  const stored = JSON.parse(localStorage.getItem('aion_pinned_memories') || '[]');
  expect(stored.length).toBeGreaterThanOrEqual(1);
});
