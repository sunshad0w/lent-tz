import {
  Container,
  Paper,
  Title,
  Text,
  Anchor,
  Stack,
  TextInput,
  PasswordInput,
  Button,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { Link } from 'react-router-dom';
import { useRegister } from '../../hooks/useAuth';

export function RegisterPage() {
  const registerMutation = useRegister();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
    },
    validate: {
      email: (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'Некорректный email'),
      password: (value) => (value.length >= 8 ? null : 'Минимум 8 символов'),
      firstName: (value) => (value.length >= 2 ? null : 'Минимум 2 символа'),
      lastName: (value) => (value.length >= 2 ? null : 'Минимум 2 символа'),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    registerMutation.mutate(values);
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center">Регистрация</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Уже есть аккаунт?{' '}
        <Anchor component={Link} to="/login" size="sm">
          Войти
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Имя"
              placeholder="Иван"
              key={form.key('firstName')}
              {...form.getInputProps('firstName')}
            />
            <TextInput
              label="Фамилия"
              placeholder="Иванов"
              key={form.key('lastName')}
              {...form.getInputProps('lastName')}
            />
            <TextInput
              label="Email"
              placeholder="your@email.com"
              key={form.key('email')}
              {...form.getInputProps('email')}
            />
            <PasswordInput
              label="Пароль"
              placeholder="Минимум 8 символов"
              key={form.key('password')}
              {...form.getInputProps('password')}
            />
            <Button type="submit" fullWidth loading={registerMutation.isPending}>
              Зарегистрироваться
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
