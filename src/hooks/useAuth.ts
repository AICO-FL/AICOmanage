import { adminApi } from '../utils/api';
import { useAuthStore } from '../stores/authStore';

interface LoginCredentials {
  username: string;
  password: string;
}

export function useAuth() {
  const { login: setAuth, logout: clearAuth } = useAuthStore();

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await adminApi.post('/auth/login', credentials);
      const { token, user } = response.data;
      setAuth(token, user);
      return true;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'ログインに失敗しました');
    }
  };

  const logout = () => {
    clearAuth();
  };

  return { login, logout };
}