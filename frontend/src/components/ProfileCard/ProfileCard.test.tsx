import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ProfileCard } from './ProfileCard';
import type { User } from '../../types/user.types';

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

const mockUser: User = {
  id: '1',
  email: 'ivan@example.com',
  firstName: 'Иван',
  lastName: 'Петров',
  birthDate: '1990-05-15',
  about: 'Разработчик',
  phone: '+79001234567',
  avatarUrl: 'https://example.com/avatar.jpg',
  createdAt: '2024-01-01T00:00:00Z',
};

describe('ProfileCard', () => {
  it('отображает имя и фамилию пользователя', () => {
    renderWithProviders(<ProfileCard user={mockUser} />);
    expect(screen.getByText('Иван Петров')).toBeInTheDocument();
  });

  it('отображает email пользователя', () => {
    renderWithProviders(<ProfileCard user={mockUser} />);
    expect(screen.getByText('ivan@example.com')).toBeInTheDocument();
  });

  it('отображает аватар с URL когда avatarUrl задан', () => {
    renderWithProviders(<ProfileCard user={mockUser} />);
    expect(screen.getByText('Иван Петров')).toBeInTheDocument();
  });

  it('отображает плейсхолдер когда avatarUrl отсутствует', () => {
    const userWithoutAvatar: User = { ...mockUser, avatarUrl: null };
    renderWithProviders(<ProfileCard user={userWithoutAvatar} />);
    expect(screen.getByText('Иван Петров')).toBeInTheDocument();
  });

  it('показывает скелетон при isLoading', () => {
    const { container } = renderWithProviders(<ProfileCard user={mockUser} isLoading />);
    const skeletons = container.querySelectorAll('.mantine-Skeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
