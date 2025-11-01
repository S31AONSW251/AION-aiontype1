import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AssetsLibrary from './AssetsLibrary';

// Mock fetch
global.fetch = jest.fn();
// Mock window.confirm
window.confirm = jest.fn();

describe('AssetsLibrary', () => {
  beforeEach(() => {
    fetch.mockClear();
    window.confirm.mockClear();
  });

  const mockAssets = [
    { filename: 'image.jpg', size: 12345, url: '/files/assets/image.jpg' },
    { filename: 'document.pdf', size: 67890, url: '/files/assets/document.pdf' },
  ];

  test('renders nothing when not open', () => {
    render(<AssetsLibrary open={false} />);
    expect(screen.queryByText('Assets Library')).not.toBeInTheDocument();
  });

  test('fetches and displays assets when opened', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ assets: mockAssets }),
    });

    render(<AssetsLibrary open={true} />);

    expect(screen.getByText('Loading assets...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('image.jpg')).toBeInTheDocument();
      expect(screen.getByText('document.pdf')).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith('/api/assets');
    expect(screen.getByText('12.1 KB')).toBeInTheDocument(); // 12345 bytes
    expect(screen.getByText('66.3 KB')).toBeInTheDocument(); // 67890 bytes
  });

  test('handles delete button click', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ assets: mockAssets }),
    });
    render(<AssetsLibrary open={true} />);

    await waitFor(() => expect(screen.getByText('image.jpg')).toBeInTheDocument());

    // Mock confirm and delete fetch
    window.confirm.mockReturnValueOnce(true);
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith('Delete image.jpg?');
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/assets/image.jpg', { method: 'DELETE' });
      expect(screen.queryByText('image.jpg')).not.toBeInTheDocument();
    });
  });

  test('shows an error message if fetching assets fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));
    render(<AssetsLibrary open={true} />);

    await waitFor(() => {
      expect(screen.getByText(/Error: Network error/)).toBeInTheDocument();
    });
  });

  test('shows empty message when no assets are returned', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ assets: [] }),
    });
    render(<AssetsLibrary open={true} />);

    await waitFor(() => {
      expect(screen.getByText('No assets saved yet.')).toBeInTheDocument();
    });
  });
});
