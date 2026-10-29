import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Login from './Login';

vi.mock('../api', () => ({ api: { login: vi.fn(), register: vi.fn() } }));
import { api } from '../api';

beforeEach(() => vi.clearAllMocks());

describe('Login', () => {
  it('signs in and reports the user', async () => {
    const user = { id: 1, email: 'a@b.co', name: 'A', role: 'admin' as const };
    vi.mocked(api.login).mockResolvedValue(user);
    const onAuth = vi.fn();
    render(<Login onAuth={onAuth} />);
    await userEvent.type(screen.getByPlaceholderText('Email'), 'a@b.co');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'secret-pass-1');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(api.login).toHaveBeenCalledWith('a@b.co', 'secret-pass-1');
    expect(onAuth).toHaveBeenCalledWith(user);
  });
  it('shows the server error on failure', async () => {
    vi.mocked(api.login).mockRejectedValue(new Error('Invalid email or password'));
    render(<Login onAuth={vi.fn()} />);
    await userEvent.type(screen.getByPlaceholderText('Email'), 'a@b.co');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'x');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
  });
  it('switches to registration mode', async () => {
    render(<Login onAuth={vi.fn()} />);
    await userEvent.click(screen.getByText('Need an account? Register'));
    expect(screen.getByPlaceholderText('Full name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
  });
});
