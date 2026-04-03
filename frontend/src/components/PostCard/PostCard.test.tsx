import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { PostCard } from './PostCard';
import type { Post } from '../../types/post.types';

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
  content: 'Тестовый пост с интересным содержимым',
  images: [
    { id: 'img1', url: 'https://example.com/image1.jpg', order: 0 },
    { id: 'img2', url: 'https://example.com/image2.jpg', order: 1 },
  ],
  createdAt: '2024-06-15T14:30:00Z',
  updatedAt: '2024-06-15T14:30:00Z',
};



describe('PostCard', () => {
  it('отображает текст поста', () => {
    renderWithProviders(<PostCard post={mockPost} />);
    expect(screen.getByText('Тестовый пост с интересным содержимым')).toBeInTheDocument();
  });

  it('отображает дату поста', () => {
    renderWithProviders(<PostCard post={mockPost} />);
    const dateText = new Date(mockPost.createdAt).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    expect(screen.getByText(dateText)).toBeInTheDocument();
  });

  it('отображает изображения если они есть', () => {
    const { container } = renderWithProviders(<PostCard post={mockPost} />);
    const images = container.querySelectorAll('img');
    expect(images).toHaveLength(2);
  });

  it('показывает кнопки редактирования и удаления', () => {
    renderWithProviders(<PostCard post={mockPost} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });
});
