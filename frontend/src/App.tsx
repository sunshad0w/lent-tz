import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth.store';
import { LoginPage } from './pages/LoginPage/LoginPage';
import { RegisterPage } from './pages/RegisterPage/RegisterPage';
import { Layout } from './components/Layout/Layout';
import { ProfilePage } from './pages/ProfilePage/ProfilePage';

export function App() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return (
    <Routes>
      <Route
        path="/login"
        element={accessToken ? <Navigate to="/profile" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={accessToken ? <Navigate to="/profile" replace /> : <RegisterPage />}
      />
      <Route element={accessToken ? <Layout /> : <Navigate to="/login" replace />}>
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/profile" replace />} />
    </Routes>
  );
}
