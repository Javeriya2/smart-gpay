import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TransactionConfirmation } from '../TransactionConfirmation/TransactionConfirmation';
import React from 'react';

describe('TransactionConfirmation', () => {
  const defaultProps = {
    transactionId: 'TXN-2026-908123',
    amount: 1000,
    recipientName: 'Mom (Sunita Sharma)',
    recipientVPA: 'sunita.sharma@okicici',
    newBalance: 13500,
    timestamp: '2026-09-07T12:00:00Z',
    status: 'SUCCESS' as const,
    onNewPayment: vi.fn(),
    onViewDetails: vi.fn(),
  };

  it('renders successful payment confirmation details', () => {
    render(<TransactionConfirmation {...defaultProps} />);
    expect(screen.getByText(/PAYMENT SUCCESSFUL/i)).toBeInTheDocument();
    expect(screen.getByText('Mom (Sunita Sharma)')).toBeInTheDocument();
    expect(screen.getByText('TXN-2026-908123')).toBeInTheDocument();
  });

  it('triggers onNewPayment callback when Make Another Payment clicked', () => {
    const handleNewPayment = vi.fn();
    render(<TransactionConfirmation {...defaultProps} onNewPayment={handleNewPayment} />);
    const btn = screen.getByRole('button', { name: /Make Another Payment/i });
    fireEvent.click(btn);
    expect(handleNewPayment).toHaveBeenCalled();
  });
});
