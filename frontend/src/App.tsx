import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Center, Loader } from '@mantine/core';
import axios from 'axios';
import { useAuthStore } from './stores/auth.store';
import { LoginPage } from './pages/LoginPage/LoginPage';
import { RegisterPage } from './pages/RegisterPage/RegisterPage';
import { Layout } from './components/Layout/Layout';
import { ProfilePage } from './pages/ProfilePage/ProfilePage';

export function App() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    axios
      .post<{ accessToken: string }>('/api/auth/refresh', null, {
        withCredentials: true,
      })
      .then((response) => setAccessToken(response.data.accessToken))
      .catch(() => {})
      .finally(() => setIsRestoring(false));
  }, [setAccessToken]);

  if (isRestoring) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={accessToken ? <Navigate to="/feed" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={accessToken ? <Navigate to="/feed" replace /> : <RegisterPage />}
      />
      <Route element={accessToken ? <Layout /> : <Navigate to="/login" replace />}>
        <Route path="/feed" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/feed" replace />} />
    </Routes>
  );
}
