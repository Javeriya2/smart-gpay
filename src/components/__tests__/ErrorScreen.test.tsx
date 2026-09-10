import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ErrorScreen } from '../ErrorScreen/ErrorScreen';
import React from 'react';

describe('ErrorScreen', () => {
  const defaultProps = {
    errorCode: 'INSUFFICIENT_BALANCE',
    errorMessage: 'Available: ₹2,000, Required: ₹5,000',
    errorDetails: { available: 2000, required: 5000, shortBy: 3000 },
    suggestions: ['Request money from contacts', 'Review balance'],
    retryCount: 0,
    onRetry: vi.fn(),
    onDismiss: vi.fn(),
    onSuggest: vi.fn(),
  };

  it('renders error title, message, and details', () => {
    render(<ErrorScreen {...defaultProps} />);
    expect(screen.getByText('Insufficient Balance')).toBeInTheDocument();
    expect(screen.getByText('Available: ₹2,000, Required: ₹5,000')).toBeInTheDocument();
  });

  it('triggers onRetry when retry button clicked', () => {
    const handleRetry = vi.fn();
    render(<ErrorScreen {...defaultProps} onRetry={handleRetry} />);
    const retryBtn = screen.getByRole('button', { name: /Try Again/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalled();
  });

  it('disables retry button when max retries reached', () => {
    render(<ErrorScreen {...defaultProps} retryCount={3} />);
    const retryBtn = screen.getByRole('button', { name: /Max Retries Reached/i });
    expect(retryBtn).toBeDisabled();
  });
});
