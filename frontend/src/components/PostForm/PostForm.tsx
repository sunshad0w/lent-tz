import { useState } from 'react';
import { Stack, Textarea, Button, Group, Text, Image, ActionIcon, SimpleGrid } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconUpload, IconX, IconPhoto, IconTrash } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { useCreatePost } from '../../hooks/usePosts';

interface PostFormProps {
  onSuccess?: () => void;
}

export function PostForm({ onSuccess }: PostFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const createPost = useCreatePost();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { content: '' },
    validate: {
      content: (value) => (value.trim().length > 0 ? null : 'Текст обязателен'),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    const formData = new FormData();
    formData.append('content', values.content);
    files.forEach((file) => formData.append('images', file));
    createPost.mutate(formData, {
      onSuccess: () => {
        form.reset();
        setFiles([]);
        onSuccess?.();
      },
    });
  };

  const removeFile = (file: File) => {
    setFiles((prev) => prev.filter((item) => item !== file));
  };

  const previews = files.map((file) => {
    const url = URL.createObjectURL(file);
    return (
      <div key={file.name + file.size} style={{ position: 'relative' }}>
        <Image
          src={url}
          radius="md"
          h={120}
          fit="cover"
          onLoad={() => URL.revokeObjectURL(url)}
          onError={() => URL.revokeObjectURL(url)}
        />
        <ActionIcon
          color="red"
          variant="filled"
          size="sm"
          radius="xl"
          style={{ position: 'absolute', top: 4, right: 4 }}
          onClick={() => removeFile(file)}
        >
          <IconTrash size={12} />
        </ActionIcon>
      </div>
    );
  });

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="sm">
        <Textarea
          placeholder="Что нового?"
          minRows={3}
          maxRows={8}
          key={form.key('content')}
          {...form.getInputProps('content')}
        />

        {previews.length > 0 && (
          <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }}>{previews}</SimpleGrid>
        )}

        {files.length < 10 && (
          <Dropzone
            onDrop={(newFiles) => setFiles((prev) => [...prev, ...newFiles].slice(0, 10))}
            maxSize={10 * 1024 ** 2}
            accept={IMAGE_MIME_TYPE}
          >
            <Group justify="center" gap="xl" mih={80} style={{ pointerEvents: 'none' }}>
              <Dropzone.Accept>
                <IconUpload size={30} color="var(--mantine-color-blue-6)" stroke={1.5} />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <IconX size={30} color="var(--mantine-color-red-6)" stroke={1.5} />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <IconPhoto size={30} color="var(--mantine-color-dimmed)" stroke={1.5} />
              </Dropzone.Idle>
              <Text size="sm" c="dimmed">
                Перетащите фото или нажмите (макс. {10 - files.length})
              </Text>
            </Group>
          </Dropzone>
        )}

        <Group justify="flex-end">
          <Button type="submit" loading={createPost.isPending}>
            Опубликовать
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
