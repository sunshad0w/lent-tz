import { Stack, Button, Group, SegmentedControl, Text, Skeleton, Center, Box } from '@mantine/core';
import { IconSortAscending, IconSortDescending } from '@tabler/icons-react';
import { PostCard } from '../PostCard/PostCard';
import { usePosts } from '../../hooks/usePosts';
import classes from './PostFeed.module.css';

export function PostFeed() {
  const { posts, sort, setSort, hasNextPage, fetchNextPage, isFetchingNextPage, isPending } =
    usePosts();

  return (
    <Stack gap="md" className={classes.feed}>
      <Group justify="space-between">
        <Text fw={600} size="lg">
          Лента постов
        </Text>
        <SegmentedControl
          size="xs"
          value={sort}
          onChange={(value) => setSort(value as 'asc' | 'desc')}
          data={[
            {
              label: (
                <Center style={{ minWidth: 80 }}>
                  <IconSortDescending size={14} />
                  <Box ml={4}>Новые</Box>
                </Center>
              ),
              value: 'desc',
            },
            {
              label: (
                <Center style={{ minWidth: 80 }}>
                  <IconSortAscending size={14} />
                  <Box ml={4}>Старые</Box>
                </Center>
              ),
              value: 'asc',
            },
          ]}
        />
      </Group>

      {isPending && (
        <Stack gap="md">
          <Skeleton height={150} radius="md" />
          <Skeleton height={150} radius="md" />
        </Stack>
      )}

      {!isPending && posts.length === 0 && (
        <Text ta="center" c="dimmed" py="xl">
          Нет постов
        </Text>
      )}

      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {hasNextPage && (
        <Button
          variant="subtle"
          fullWidth
          onClick={() => fetchNextPage()}
          loading={isFetchingNextPage}
        >
          Загрузить ещё
        </Button>
      )}
    </Stack>
  );
}
