import { useState } from 'react';
import { Stack, Textarea, Button, Group, Text, Image, ActionIcon, SimpleGrid } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconUpload, IconX, IconPhoto, IconTrash } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { useUpdatePost } from '../../hooks/usePosts';
import type { Post } from '../../types/post.types';

interface ImagePreviewProps {
  src: string;
  onRemove: () => void;
  revokeOnLoad?: boolean;
}

function ImagePreview({ src, onRemove, revokeOnLoad }: ImagePreviewProps) {
  return (
    <div style={{ position: 'relative' }}>
      <Image
        src={src}
        radius="md"
        h={100}
        fit="cover"
        onLoad={revokeOnLoad ? () => URL.revokeObjectURL(src) : undefined}
        onError={revokeOnLoad ? () => URL.revokeObjectURL(src) : undefined}
      />
      <ActionIcon
        color="red"
        variant="filled"
        size="sm"
        radius="xl"
        style={{ position: 'absolute', top: 4, right: 4 }}
        onClick={onRemove}
      >
        <IconTrash size={12} />
      </ActionIcon>
    </div>
  );
}

interface PostEditFormProps {
  post: Post;
  onCancel: () => void;
  onSuccess: () => void;
}

export function PostEditForm({ post, onCancel, onSuccess }: PostEditFormProps) {
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [removeImageIds, setRemoveImageIds] = useState<string[]>([]);
  const updatePost = useUpdatePost();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { content: post.content },
    validate: {
      content: (value) => (value.trim().length > 0 ? null : 'Текст обязателен'),
    },
  });

  const existingImages = post.images.filter((img) => !removeImageIds.includes(img.id));

  const removeNewFile = (fileToRemove: File) => {
    setNewFiles((prev) => prev.filter((item) => item !== fileToRemove));
  };

  const handleSubmit = (values: typeof form.values) => {
    const formData = new FormData();
    formData.append('content', values.content);
    removeImageIds.forEach((id) => formData.append('removeImageIds', id));
    newFiles.forEach((file) => formData.append('images', file));
    updatePost.mutate({ id: post.id, data: formData }, { onSuccess });
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="sm">
        <Textarea
          minRows={3}
          maxRows={8}
          key={form.key('content')}
          {...form.getInputProps('content')}
        />

        {existingImages.length > 0 && (
          <SimpleGrid cols={{ base: 2, sm: 3 }}>
            {existingImages.map((img) => (
              <ImagePreview
                key={img.id}
                src={img.url}
                onRemove={() => setRemoveImageIds((prev) => [...prev, img.id])}
              />
            ))}
          </SimpleGrid>
        )}

        {newFiles.length > 0 && (
          <SimpleGrid cols={{ base: 2, sm: 3 }}>
            {newFiles.map((file) => (
              <ImagePreview
                key={file.name + file.size}
                src={URL.createObjectURL(file)}
                revokeOnLoad
                onRemove={() => removeNewFile(file)}
              />
            ))}
          </SimpleGrid>
        )}

        {existingImages.length + newFiles.length < 10 && (
          <Dropzone
            onDrop={(files) =>
              setNewFiles((prev) => [...prev, ...files].slice(0, 10 - existingImages.length))
            }
            maxSize={10 * 1024 ** 2}
            accept={IMAGE_MIME_TYPE}
          >
            <Group justify="center" gap="xl" mih={60} style={{ pointerEvents: 'none' }}>
              <Dropzone.Accept>
                <IconUpload size={24} color="var(--mantine-color-blue-6)" stroke={1.5} />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <IconX size={24} color="var(--mantine-color-red-6)" stroke={1.5} />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <IconPhoto size={24} color="var(--mantine-color-dimmed)" stroke={1.5} />
              </Dropzone.Idle>
              <Text size="sm" c="dimmed">
                Добавить фото
              </Text>
            </Group>
          </Dropzone>
        )}

        <Group justify="flex-end">
          <Button variant="subtle" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit" loading={updatePost.isPending}>
            Сохранить
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
