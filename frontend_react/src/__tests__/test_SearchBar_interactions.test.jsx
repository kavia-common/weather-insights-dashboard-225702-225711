import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import SearchBar from '../components/SearchBar';

// Mock geocodeCity from openMeteo
jest.mock('../lib/openMeteo.js', () => ({
  geocodeCity: jest.fn()
}));
import { geocodeCity } from '../lib/openMeteo.js';

describe('SearchBar', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const mockResults = [
    { name: 'Paris', latitude: 48.85, longitude: 2.35, country: 'France', admin1: 'Ile-de-France' },
    { name: 'Parish', latitude: 37.77, longitude: -122.42, country: 'USA', admin1: 'CA' }
  ];

  it('debounces input calls to geocodeCity by ~300ms and shows results', async () => {
    geocodeCity.mockResolvedValueOnce(mockResults);

    const onSelect = jest.fn();
    render(<SearchBar onSelect={onSelect} />);

    const input = screen.getByLabelText(/search city/i);
    fireEvent.change(input, { target: { value: 'par' } });

    // Immediately should not call API
    expect(geocodeCity).not.toHaveBeenCalled();

    // Advance time: still not yet
    act(() => {
      jest.advanceTimersByTime(250);
    });
    expect(geocodeCity).not.toHaveBeenCalled();

    // Advance past debounce
    await act(async () => {
      jest.advanceTimersByTime(100);
    });
    expect(geocodeCity).toHaveBeenCalledTimes(1);
    expect(geocodeCity).toHaveBeenCalledWith('par', 5);

    // Results render
    const listbox = await screen.findByRole('listbox', { name: /search results/i });
    expect(listbox).toBeInTheDocument();
    expect(screen.getByText(/Paris, Ile-de-France, France/i)).toBeInTheDocument();
  });

  it('supports keyboard Enter on a result item to select', async () => {
    geocodeCity.mockResolvedValueOnce(mockResults);
    const onSelect = jest.fn();
    render(<SearchBar onSelect={onSelect} />);

    const input = screen.getByLabelText(/search city/i);
    fireEvent.change(input, { target: { value: 'par' } });

    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    const option = await screen.findByRole('option', { name: /Paris, Ile-de-France, France/i });
    option.focus();
    expect(option).toHaveFocus();

    fireEvent.keyDown(option, { key: 'Enter', code: 'Enter' });
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ name: 'Paris' }));
  });

  it('pressing Enter in input triggers immediate search without debounce error', async () => {
    geocodeCity.mockResolvedValueOnce(mockResults);
    render(<SearchBar onSelect={() => {}} />);

    const input = screen.getByLabelText(/search city/i);
    fireEvent.change(input, { target: { value: 'paris' } });

    // Press Enter to trigger immediate fetch branch
    await act(async () => {
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    });

    expect(geocodeCity).toHaveBeenCalledWith('paris', 5);

    // Results visible
    const listbox = await screen.findByRole('listbox', { name: /search results/i });
    expect(listbox).toBeInTheDocument();
  });
});
