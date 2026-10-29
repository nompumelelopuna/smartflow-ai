import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { order } from '../test/fixtures';
import OrdersTable from './OrdersTable';

describe('OrdersTable', () => {
  it('renders order rows with ZAR value and POD flag', () => {
    render(<OrdersTable orders={[order()]} />);
    expect(screen.getByText('PO-1001')).toBeInTheDocument();
    expect(screen.getByText(/^R\s?2\s?469,00$/)).toBeInTheDocument(); // 2 x 1234.50
    expect(screen.getByText('No')).toBeInTheDocument();
  });
  it('shows an empty state', () => {
    render(<OrdersTable orders={[]} />);
    expect(screen.getByText('No orders found.')).toBeInTheDocument();
  });
  it('calls edit and delete handlers', async () => {
    const onEdit = vi.fn(), onDelete = vi.fn();
    render(<OrdersTable orders={[order()]} onEdit={onEdit} onDelete={onDelete} />);
    await userEvent.click(screen.getByText('Edit'));
    await userEvent.click(screen.getByText('Delete'));
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
    expect(onDelete).toHaveBeenCalled();
  });
});
