import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Dashboard } from '../Dashboard/Dashboard';
import React from 'react';

// Mock recharts ResponsiveContainer for test DOM environment
vi.mock('recharts', async () => {
  const original = await vi.importActual<any>('recharts');
  return {
    ...original,
    ResponsiveContainer: ({ children }: any) => <div style={{ width: '300px', height: '200px' }}>{children}</div>,
  };
});

describe('Dashboard', () => {
  const defaultProps = {
    userId: 101,
    onPaymentClick: vi.fn(),
    onTransactionClick: vi.fn(),
  };

  it('renders welcome message and balance hero section', () => {
    render(<Dashboard {...defaultProps} />);
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    expect(screen.getByText(/Primary Account Balance/i)).toBeInTheDocument();
  });

  it('triggers onPaymentClick when New AI Payment button clicked', () => {
    const handlePaymentClick = vi.fn();
    render(<Dashboard {...defaultProps} onPaymentClick={handlePaymentClick} />);
    const btn = screen.getByRole('button', { name: /New AI Payment/i });
    fireEvent.click(btn);
    expect(handlePaymentClick).toHaveBeenCalled();
  });
});
