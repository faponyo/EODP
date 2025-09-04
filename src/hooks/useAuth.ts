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

  const login = async (email: string, password: string) => {
    // Simple authentication logic (in real app, this would call an API)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: User) => u.email === email && u.status === 'active');
    
    // Demo credentials for testing
    const demoCredentials = [
      { email: 'admin@company.com', password: 'admin123' },
      { email: 'internal@company.com', password: 'internal123' },
      { email: 'external@company.com', password: 'external123' }
    ];
    
    const validDemo = demoCredentials.find(cred => cred.email === email && cred.password === password);
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      setAuthState({
        user,
        isAuthenticated: true,
      });
      return { success: true };
    } else if (validDemo) {
      // Create user if demo credentials are used
      const demoUser: User = {
        id: email === 'admin@company.com' ? '1' : email === 'internal@company.com' ? '2' : '3',
        email,
        name: email === 'admin@company.com' ? 'Admin User' : email === 'internal@company.com' ? 'Internal User' : 'External User',
        role: email === 'admin@company.com' ? 'admin' : email === 'internal@company.com' ? 'internal' : 'external',
        status: 'active',
        assignedEventIds: email === 'external@company.com' ? ['1'] : undefined,
        createdAt: new Date().toISOString(),
      };
      
      localStorage.setItem('currentUser', JSON.stringify(demoUser));
      setAuthState({
        user: demoUser,
        isAuthenticated: true,
      });
      return { success: true };
    }
    
    return { success: false, error: 'Invalid credentials' };
  };

  const register = async (email: string, password: string, name: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.find((u: User) => u.email === email)) {
      return { success: false, error: 'User already exists' };
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role: 'internal',
      status: 'active',
      createdAt: new Date().toISOString(),
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