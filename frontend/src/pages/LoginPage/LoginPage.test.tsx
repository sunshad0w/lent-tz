import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';

vi.mock('../../hooks/useAuth', () => ({
  useLogin: () => ({
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

describe('LoginPage', () => {
  it('отображает поля email и пароль', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Пароль')).toBeInTheDocument();
  });

  it('отображает кнопку "Войти"', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument();
  });

  it('отображает ссылку на страницу регистрации', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByText('Зарегистрироваться')).toBeInTheDocument();
    expect(screen.getByText('Зарегистрироваться').closest('a')).toHaveAttribute(
      'href',
      '/register',
    );
  });
});
