import { Stack, TextInput, Textarea, Button, Group } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import type { User, UpdateProfileData } from '../../types/user.types';
import { useUpdateProfile } from '../../hooks/useProfile';

interface ProfileEditFormProps {
  user: User;
  onCancel: () => void;
}

export function ProfileEditForm({ user, onCancel }: ProfileEditFormProps) {
  const updateProfile = useUpdateProfile();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      birthDate: user.birthDate ? new Date(user.birthDate) : null,
      about: user.about || '',
      phone: user.phone || '',
    },
    validate: {
      firstName: (value) => (value.length >= 2 ? null : 'Минимум 2 символа'),
      lastName: (value) => (value.length >= 2 ? null : 'Минимум 2 символа'),
      phone: (value) =>
        !value || /^\+?[0-9\s\-()]{7,20}$/.test(value) ? null : 'Некорректный формат телефона',
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    const birthDateStr = values.birthDate
      ? values.birthDate.toISOString().split('T')[0]
      : null;

    const data: UpdateProfileData = {
      firstName: values.firstName,
      lastName: values.lastName,
      birthDate: birthDateStr,
      about: values.about || null,
      phone: values.phone || null,
    };
    updateProfile.mutate(data, { onSuccess: onCancel });
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="sm">
        <Group grow>
          <TextInput
            label="Имя"
            disabled={updateProfile.isPending}
            key={form.key('firstName')}
            {...form.getInputProps('firstName')}
          />
          <TextInput
            label="Фамилия"
            disabled={updateProfile.isPending}
            key={form.key('lastName')}
            {...form.getInputProps('lastName')}
          />
        </Group>
        <DateInput
          label="Дата рождения"
          placeholder="Выберите дату"
          clearable
          valueFormat="DD.MM.YYYY"
          disabled={updateProfile.isPending}
          key={form.key('birthDate')}
          {...form.getInputProps('birthDate')}
        />
        <Textarea
          label="О себе"
          placeholder="Расскажите о себе"
          minRows={3}
          maxRows={6}
          disabled={updateProfile.isPending}
          key={form.key('about')}
          {...form.getInputProps('about')}
        />
        <TextInput
          label="Телефон"
          placeholder="+7 999 123-45-67"
          disabled={updateProfile.isPending}
          key={form.key('phone')}
          {...form.getInputProps('phone')}
        />
        <Group justify="flex-end">
          <Button variant="subtle" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit" loading={updateProfile.isPending}>
            Сохранить
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
