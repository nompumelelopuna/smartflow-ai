import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import StatCard from './StatCard';

describe('StatCard', () => {
  it('shows label and value', () => {
    render(<StatCard label="Over ETA" value={3} />);
    expect(screen.getByText('Over ETA')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
  it('is clickable when onClick is given', async () => {
    const onClick = vi.fn();
    render(<StatCard label="No POD" value={2} onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
