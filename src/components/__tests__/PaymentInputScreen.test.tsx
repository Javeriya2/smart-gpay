import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PaymentInputScreen } from '../PaymentInputScreen/PaymentInputScreen';
import React from 'react';

describe('PaymentInputScreen', () => {
  const defaultProps = {
    userId: 101,
    onPaymentSubmit: vi.fn(),
    isLoading: false,
    userBalance: 14500,
    recentPayees: [
      { id: 1, name: 'Sunita Sharma', vpa: 'sunita@upi', alias: 'Mom' },
    ],
  };

  it('renders payment prompt textarea and placeholder', () => {
    render(<PaymentInputScreen {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(/Send ₹1000 to Mom/i);
    expect(textarea).toBeInTheDocument();
  });

  it('updates state when typing in textarea', () => {
    render(<PaymentInputScreen {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(/Send ₹1000 to Mom/i) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Send ₹500 to Rahul' } });
    expect(textarea.value).toBe('Send ₹500 to Rahul');
  });

  it('calls onPaymentSubmit on form submission', () => {
    const handleSubmit = vi.fn();
    render(<PaymentInputScreen {...defaultProps} onPaymentSubmit={handleSubmit} />);
    const textarea = screen.getByPlaceholderText(/Send ₹1000 to Mom/i);
    fireEvent.change(textarea, { target: { value: 'Send ₹1000 to Mom' } });
    const submitBtn = screen.getByRole('button', { name: /Process Payment/i });
    fireEvent.click(submitBtn);
    expect(handleSubmit).toHaveBeenCalledWith('Send ₹1000 to Mom');
  });

  it('populates input when clicking suggestion chip', () => {
    render(<PaymentInputScreen {...defaultProps} />);
    const chip = screen.getByText(/Send ₹1000 to Mom/i);
    fireEvent.click(chip);
    const textarea = screen.getByPlaceholderText(/Send ₹1000 to Mom/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe('Send ₹1000 to Mom');
  });
});
