import { Stack, Alert, Card } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useProfile } from '../../hooks/useProfile';
import { ProfileCard } from '../../components/ProfileCard/ProfileCard';
import { PostFeed } from '../../components/PostFeed/PostFeed';
import { PostForm } from '../../components/PostForm/PostForm';
import type { User } from '../../types/user.types';

export function ProfilePage() {
  const { data: user, isPending, error } = useProfile();

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Ошибка" color="red">
        Не удалось загрузить профиль
      </Alert>
    );
  }

  return (
    <Stack gap="lg" mt="md">
      {isPending && <ProfileCard user={{} as User} isLoading />}
      {!isPending && user && <ProfileCard user={user} />}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <PostForm />
      </Card>
      <PostFeed />
    </Stack>
  );
}
