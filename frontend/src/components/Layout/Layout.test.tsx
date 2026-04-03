import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { Layout } from './Layout';

vi.mock('../../hooks/useAuth', () => ({
  useLogout: () => ({
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

describe('Layout', () => {
  it('отображает заголовок приложения "Лента"', () => {
    renderWithProviders(<Layout />);
    expect(screen.getByText('Лента')).toBeInTheDocument();
  });

  it('отображает кнопку выхода "Выйти"', () => {
    renderWithProviders(<Layout />);
    expect(screen.getByText('Выйти')).toBeInTheDocument();
  });
});
