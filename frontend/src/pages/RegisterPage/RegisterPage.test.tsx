import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { RegisterPage } from './RegisterPage';

vi.mock('../../hooks/useAuth', () => ({
  useRegister: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    isSuccess: false,
    data: undefined,
    variables: undefined,
    reset: vi.fn(),
    mutateAsync: vi.fn(),
    status: 'idle' as const,
    isIdle: true,
    context: undefined,
    failureCount: 0,
    failureReason: null,
    submittedAt: 0,
  }),
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <MemoryRouter>{ui}</MemoryRouter>
      </MantineProvider>
    </QueryClientProvider>,
  );
}

describe('RegisterPage', () => {
  it('отображает 4 поля ввода (имя, фамилия, email, пароль)', () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getByLabelText('Имя')).toBeInTheDocument();
    expect(screen.getByLabelText('Фамилия')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Пароль')).toBeInTheDocument();
  });

  it('отображает кнопку "Зарегистрироваться"', () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getByRole('button', { name: 'Зарегистрироваться' })).toBeInTheDocument();
  });

  it('отображает ссылку на страницу входа', () => {
    renderWithProviders(<RegisterPage />);
    const loginLink = screen.getByText('Войти');
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });
});
