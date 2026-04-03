import { AppShell, Group, Title, Button, Container } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import { Outlet } from 'react-router-dom';
import { useLogout } from '../../hooks/useAuth';

export function Layout() {
  const logoutMutation = useLogout();

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Container size="lg" h="100%">
          <Group h="100%" justify="space-between">
            <Title order={3}>Лента</Title>
            <Button
              variant="subtle"
              color="red"
              leftSection={<IconLogout size={18} />}
              onClick={() => logoutMutation.mutate()}
              loading={logoutMutation.isPending}
            >
              Выйти
            </Button>
          </Group>
        </Container>
      </AppShell.Header>
      <AppShell.Main>
        <Container size="lg">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
