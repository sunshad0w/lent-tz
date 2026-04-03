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
import { useLogin } from '../../hooks/useAuth';

export function LoginPage() {
  const loginMutation = useLogin();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'Некорректный email'),
      password: (value) => (value.length > 0 ? null : 'Пароль обязателен'),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    loginMutation.mutate(values);
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center">Вход в систему</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Нет аккаунта?{' '}
        <Anchor component={Link} to="/register" size="sm">
          Зарегистрироваться
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Email"
              placeholder="your@email.com"
              key={form.key('email')}
              {...form.getInputProps('email')}
            />
            <PasswordInput
              label="Пароль"
              placeholder="Ваш пароль"
              key={form.key('password')}
              {...form.getInputProps('password')}
            />
            <Button type="submit" fullWidth loading={loginMutation.isPending}>
              Войти
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
