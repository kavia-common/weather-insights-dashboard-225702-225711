import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LocationPermissionModal from '../components/LocationPermissionModal';

describe('LocationPermissionModal accessibility and focus behavior', () => {
  it('focuses the primary button on open and traps focus with Tab', () => {
    const onAllow = jest.fn();
    const onSkip = jest.fn();
    const onClose = jest.fn();

    render(<LocationPermissionModal open={true} onAllow={onAllow} onSkip={onSkip} onClose={onClose} blocked={false} />);

    const allowBtn = screen.getByRole('button', { name: /Allow location/i });
    expect(allowBtn).toHaveFocus();

    // Tab should cycle to next button "Not now"
    fireEvent.keyDown(document, { key: 'Tab', code: 'Tab' });
    const notNow = screen.getByRole('button', { name: /Not now/i });
    expect(notNow).toHaveFocus();

    // Shift+Tab should wrap back to allow button
    fireEvent.keyDown(document, { key: 'Tab', code: 'Tab', shiftKey: true });
    expect(allowBtn).toHaveFocus();
  });

  it('closes on ESC and returns focus to invoker', () => {
    const onAllow = jest.fn();
    const onSkip = jest.fn();
    const onClose = jest.fn();

    // Create invoker button in DOM and focus it before opening modal
    const { rerender } = render(<button data-testid="invoker">Open</button>);
    const invoker = screen.getByTestId('invoker');
    invoker.focus();
    expect(invoker).toHaveFocus();

    // Open modal
    rerender(
      <>
        <button data-testid="invoker">Open</button>
        <LocationPermissionModal open={true} onAllow={onAllow} onSkip={onSkip} onClose={onClose} blocked={true} />
      </>
    );

    // ESC should call onClose
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(onClose).toHaveBeenCalled();

    // Close modal and ensure focus returns to invoker
    rerender(
      <>
        <button data-testid="invoker">Open</button>
        <LocationPermissionModal open={false} onAllow={onAllow} onSkip={onSkip} onClose={onClose} blocked={true} />
      </>
    );
    expect(screen.getByTestId('invoker')).toHaveFocus();
  });

  it('shows blocked guidance when blocked=true', () => {
    render(<LocationPermissionModal open={true} onAllow={() => {}} onSkip={() => {}} onClose={() => {}} blocked={true} />);
    expect(screen.getByText(/may be blocked in your browser settings/i)).toBeInTheDocument();
  });
});
