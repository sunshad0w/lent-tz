import { Avatar, Modal, Text, Group, Stack } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconUpload, IconX, IconPhoto } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useUploadAvatar } from '../../hooks/useProfile';

interface AvatarUploadProps {
  src: string | null;
  name: string;
  size?: number;
}

export function AvatarUpload({ src, name, size = 120 }: AvatarUploadProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const uploadAvatar = useUploadAvatar();

  const handleDrop = (files: File[]) => {
    if (files[0]) {
      uploadAvatar.mutate(files[0], { onSuccess: close });
    }
  };

  return (
    <>
      <Avatar
        src={src}
        size={size}
        radius="xl"
        alt={name}
        onClick={open}
        style={{ cursor: 'pointer' }}
      />

      <Modal
        opened={opened}
        onClose={close}
        title="Загрузить аватар"
        centered
        size={{ base: 'sm', sm: 'md' }}
      >
        <Dropzone
          onDrop={handleDrop}
          maxSize={10 * 1024 ** 2}
          accept={IMAGE_MIME_TYPE}
          multiple={false}
          loading={uploadAvatar.isPending}
        >
          <Group justify="center" gap="xl" mih={150} style={{ pointerEvents: 'none' }}>
            <Dropzone.Accept>
              <IconUpload size={52} color="var(--mantine-color-blue-6)" stroke={1.5} />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5} />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <IconPhoto size={52} color="var(--mantine-color-dimmed)" stroke={1.5} />
            </Dropzone.Idle>
            <Stack gap={0}>
              <Text size="lg" inline>
                Перетащите изображение или нажмите
              </Text>
              <Text size="sm" c="dimmed" inline mt={7}>
                Макс. размер: 10 МБ (JPEG, PNG, WebP)
              </Text>
            </Stack>
          </Group>
        </Dropzone>
      </Modal>
    </>
  );
}
