import { useState, useEffect } from 'react';
import { User, AuthState } from '../types';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setAuthState({
        user,
        isAuthenticated: true,
      });
    }
  }, []);

  const login = (email: string, password: string) => {
    // Simple authentication logic (in real app, this would call an API)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: User) => u.email === email);
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      setAuthState({
        user,
        isAuthenticated: true,
      });
      return { success: true };
    }
    
    return { success: false, error: 'Invalid credentials' };
  };

  const register = (email: string, password: string, name: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.find((u: User) => u.email === email)) {
      return { success: false, error: 'User already exists' };
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role: 'user',
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    setAuthState({
      user: newUser,
      isAuthenticated: true,
    });

    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setAuthState({
      user: null,
      isAuthenticated: false,
    });
  };

  return {
    ...authState,
    login,
    register,
    logout,
  };
};