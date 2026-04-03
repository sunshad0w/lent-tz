import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { Container, Title, Text, Button, Stack } from '@mantine/core';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container size="sm" py="xl">
          <Stack align="center" gap="md">
            <Title order={2}>Что-то пошло не так</Title>
            <Text c="dimmed">Произошла непредвиденная ошибка</Text>
            <Button onClick={() => window.location.reload()}>Перезагрузить страницу</Button>
          </Stack>
        </Container>
      );
    }
    return this.props.children;
  }
}
