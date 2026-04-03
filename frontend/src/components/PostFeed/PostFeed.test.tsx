import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { PostFeed } from './PostFeed';
import { usePosts } from '../../hooks/usePosts';
import type { Post } from '../../types/post.types';

vi.mock('../../hooks/usePosts', () => ({
  usePosts: vi.fn(),
  useDeletePost: () => ({
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

const mockedUsePosts = vi.mocked(usePosts);

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

const mockPost: Post = {
  id: '1',
  content: 'Первый тестовый пост',
  images: [],
  createdAt: '2024-06-15T14:30:00Z',
  updatedAt: '2024-06-15T14:30:00Z',
};

const defaultHookReturn = {
  posts: [] as Post[],
  total: 0,
  sort: 'desc' as const,
  setSort: vi.fn(),
  hasNextPage: false,
  fetchNextPage: vi.fn(),
  isFetchingNextPage: false,
  isPending: false,
  data: undefined,
  error: null,
  isError: false,
  isSuccess: true,
  status: 'success' as const,
  isFetching: false,
  isLoading: false,
  refetch: vi.fn(),
  dataUpdatedAt: 0,
  errorUpdatedAt: 0,
  failureCount: 0,
  failureReason: null,
  errorUpdateCount: 0,
  isLoadingError: false,
  isPaused: false,
  isPlaceholderData: false,
  isRefetchError: false,
  isRefetching: false,
  isStale: false,
  fetchStatus: 'idle' as const,
  isFetchNextPageError: false,
  hasPreviousPage: false,
  isFetchingPreviousPage: false,
  isFetchPreviousPageError: false,
  fetchPreviousPage: vi.fn(),
  promise: Promise.resolve({} as never),
};

describe('PostFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('показывает "Нет постов" когда список пуст', () => {
    mockedUsePosts.mockReturnValue(defaultHookReturn);
    renderWithProviders(<PostFeed />);
    expect(screen.getByText('Нет постов')).toBeInTheDocument();
  });

  it('отображает посты когда данные доступны', () => {
    mockedUsePosts.mockReturnValue({
      ...defaultHookReturn,
      posts: [mockPost],
      total: 1,
    });
    renderWithProviders(<PostFeed />);
    expect(screen.getByText('Первый тестовый пост')).toBeInTheDocument();
  });

  it('показывает кнопку "Загрузить ещё" когда есть следующая страница', () => {
    mockedUsePosts.mockReturnValue({
      ...defaultHookReturn,
      posts: [mockPost],
      total: 20,
      hasNextPage: true,
    });
    renderWithProviders(<PostFeed />);
    expect(screen.getByText('Загрузить ещё')).toBeInTheDocument();
  });

  it('показывает элемент сортировки', () => {
    mockedUsePosts.mockReturnValue(defaultHookReturn);
    renderWithProviders(<PostFeed />);
    expect(screen.getByText('Новые')).toBeInTheDocument();
    expect(screen.getByText('Старые')).toBeInTheDocument();
  });
});
