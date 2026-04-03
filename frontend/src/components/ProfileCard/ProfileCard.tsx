import { useState } from 'react';
import { Card, Group, Stack, Title, Text, Button, Skeleton } from '@mantine/core';
import { IconEdit, IconMail, IconPhone, IconCalendar, IconUser } from '@tabler/icons-react';
import type { User } from '../../types/user.types';
import { AvatarUpload } from '../AvatarUpload/AvatarUpload';
import { ProfileEditForm } from '../ProfileEditForm/ProfileEditForm';
import classes from './ProfileCard.module.css';

interface ProfileCardProps {
  user: User;
  isLoading?: boolean;
}

export function ProfileCard({ user, isLoading }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  if (isLoading) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group align="flex-start">
          <Skeleton height={120} circle />
          <Stack gap="xs" style={{ flex: 1 }}>
            <Skeleton height={28} width="60%" />
            <Skeleton height={16} width="40%" />
            <Skeleton height={16} width="80%" />
          </Stack>
        </Group>
      </Card>
    );
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder className={classes.card}>
      <Group align="flex-start" gap="xl">
        <AvatarUpload src={user.avatarUrl} name={`${user.firstName} ${user.lastName}`} />
        <Stack gap="xs" style={{ flex: 1 }}>
          <Group justify="space-between">
            <Title order={2}>
              {user.firstName} {user.lastName}
            </Title>
            {!isEditing && (
              <Button
                variant="subtle"
                leftSection={<IconEdit size={16} />}
                onClick={() => setIsEditing(true)}
              >
                Редактировать
              </Button>
            )}
          </Group>

          {isEditing ? (
            <ProfileEditForm user={user} onCancel={() => setIsEditing(false)} />
          ) : (
            <>
              {user.birthDate && (
                <Group gap="xs">
                  <IconCalendar size={16} color="var(--mantine-color-dimmed)" />
                  <Text size="sm" c="dimmed">
                    {new Date(user.birthDate).toLocaleDateString('ru-RU')}
                  </Text>
                </Group>
              )}

              {user.about && (
                <Group gap="xs" align="flex-start">
                  <IconUser
                    size={16}
                    color="var(--mantine-color-dimmed)"
                    style={{ marginTop: 3 }}
                  />
                  <Text size="sm">{user.about}</Text>
                </Group>
              )}

              <Group gap="xs">
                <IconMail size={16} color="var(--mantine-color-dimmed)" />
                <Text size="sm">{user.email}</Text>
              </Group>

              {user.phone && (
                <Group gap="xs">
                  <IconPhone size={16} color="var(--mantine-color-dimmed)" />
                  <Text size="sm">{user.phone}</Text>
                </Group>
              )}
            </>
          )}
        </Stack>
      </Group>
    </Card>
  );
}
