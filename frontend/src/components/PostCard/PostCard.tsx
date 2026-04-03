import { useState } from 'react';
import { Card, Text, Group, Image, SimpleGrid, ActionIcon, Modal, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import type { Post } from '../../types/post.types';
import { useDeletePost } from '../../hooks/usePosts';
import { PostEditForm } from './PostEditForm';
import classes from './PostCard.module.css';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const deletePost = useDeletePost();

  const handleDelete = () => {
    deletePost.mutate(post.id, { onSuccess: closeDelete });
  };

  if (isEditing) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder className={classes.card}>
        <PostEditForm
          post={post}
          onCancel={() => setIsEditing(false)}
          onSuccess={() => setIsEditing(false)}
        />
      </Card>
    );
  }

  return (
    <>
      <Card shadow="sm" padding="lg" radius="md" withBorder className={classes.card}>
        <Text mb="sm">{post.content}</Text>

        {post.images.length > 0 && (
          <SimpleGrid cols={{ base: 1, sm: post.images.length === 1 ? 1 : 2 }} mb="sm">
            {post.images.map((image) => (
              <Image
                key={image.id}
                src={image.url}
                radius="md"
                fit="cover"
                h={200}
                alt={`Изображение ${image.order + 1}`}
              />
            ))}
          </SimpleGrid>
        )}

        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            {new Date(post.createdAt).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          <Group gap="xs">
            <ActionIcon variant="subtle" color="blue" onClick={() => setIsEditing(true)}>
              <IconEdit size={16} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="red" onClick={openDelete}>
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </Card>

      <Modal opened={deleteOpened} onClose={closeDelete} title="Удаление поста" centered size="sm">
        <Text mb="lg">Вы уверены, что хотите удалить этот пост?</Text>
        <Group justify="flex-end">
          <Button variant="subtle" onClick={closeDelete}>
            Отмена
          </Button>
          <Button color="red" onClick={handleDelete} loading={deletePost.isPending}>
            Удалить
          </Button>
        </Group>
      </Modal>
    </>
  );
}
