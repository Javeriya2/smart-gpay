import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DisambiguationModal } from '../DisambiguationModal/DisambiguationModal';
import React from 'react';

describe('DisambiguationModal', () => {
  const contacts = [
    { id: 2, name: 'Rahul Sharma', vpa: 'rahul.s@okaxis', alias: 'Flatmate' },
    { id: 3, name: 'Rahul Verma', vpa: 'rahul.v@okhdfc', alias: 'Colleague' },
  ];

  const defaultProps = {
    isOpen: true,
    ambiguousContacts: contacts,
    originalMessage: 'Send ₹500 to Rahul',
    onSelect: vi.fn(),
    onCancel: vi.fn(),
  };

  it('renders modal with contacts list', () => {
    render(<DisambiguationModal {...defaultProps} />);
    expect(screen.getByText('Multiple Contacts Found')).toBeInTheDocument();
    expect(screen.getByText('Rahul Sharma')).toBeInTheDocument();
    expect(screen.getByText('Rahul Verma')).toBeInTheDocument();
  });

  it('calls onSelect with selected contact ID on continue click', () => {
    const handleSelect = vi.fn();
    render(<DisambiguationModal {...defaultProps} onSelect={handleSelect} />);
    const continueBtn = screen.getByRole('button', { name: /Continue with Rahul/i });
    fireEvent.click(continueBtn);
    expect(handleSelect).toHaveBeenCalledWith(2);
  });

  it('calls onCancel when cancel button clicked', () => {
    const handleCancel = vi.fn();
    render(<DisambiguationModal {...defaultProps} onCancel={handleCancel} />);
    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);
    expect(handleCancel).toHaveBeenCalled();
  });
});
