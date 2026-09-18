import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, Role } from '../types';
import { api } from '../lib/api';

interface BackendHealthState {
  connected: boolean;
  message: string;
  database: string;
  mode?: string;
  checking: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  health: BackendHealthState;
  login: (identity: string, password: string) => Promise<{ success: boolean; message?: string; role?: Role }>;
  register: (payload: { name: string; accountNumber: string; aadhaarNumber: string; password: string; confirmPassword: string }) => Promise<{ success: boolean; message?: string }>;
  quickSwitchRole: (targetRole: Role) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkHealth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [health, setHealth] = useState<BackendHealthState>({
    connected: false,
    message: 'Initializing backend connection check...',
    database: 'checking',
    checking: true,
  });

  const checkHealth = async () => {
    try {
      setHealth(prev => ({ ...prev, checking: true }));
      const res = await api.getHealth();
      setHealth({
        connected: res.success,
        message: res.message,
        database: res.database,
        mode: res.mode,
        checking: false,
      });
    } catch (err: any) {
      setHealth({
        connected: false,
        message: err.message || 'Unable to connect to backend server',
        database: 'disconnected',
        checking: false,
      });
    }
  };

  useEffect(() => {
    checkHealth();

    // Check existing stored session
    const existingToken = api.getToken();
    if (existingToken) {
      setToken(existingToken);
      api.getMe()
        .then(res => {
          if (res.success && res.user) {
            setUser(res.user);
            if (res.user.role === 'CITIZEN') {
              localStorage.setItem('last_citizen_account', res.user.accountNumber);
              localStorage.setItem('last_citizen_name', res.user.name);
            }
          } else {
            api.setToken(null);
            setToken(null);
          }
        })
        .catch(() => {
          api.setToken(null);
          setToken(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (identity: string, password: string) => {
    try {
      const res = await api.login(identity, password);
      if (res.success && res.user) {
        setUser(res.user);
        setToken(res.token);
        if (res.user.role === 'CITIZEN') {
          localStorage.setItem('last_citizen_account', res.user.accountNumber);
          localStorage.setItem('last_citizen_name', res.user.name);
          localStorage.setItem('last_citizen_pwd', password);
        }
        return { success: true, role: res.user.role };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Authentication error' };
    }
  };

  const register = async (payload: { name: string; accountNumber: string; aadhaarNumber: string; password: string; confirmPassword: string }) => {
    try {
      const res = await api.register(payload);
      if (res.success && res.user) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('last_citizen_account', res.user.accountNumber);
        localStorage.setItem('last_citizen_name', res.user.name);
        localStorage.setItem('last_citizen_pwd', payload.password);
        return { success: true };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Registration error' };
    }
  };

  const quickSwitchRole = async (targetRole: Role): Promise<{ success: boolean; message?: string }> => {
    try {
      let identity = 'DEMO100001';
      let password = 'Password@123';

      if (targetRole === 'INVESTIGATOR') {
        identity = 'DEMO200001';
        password = 'Password@123';
      } else if (targetRole === 'SENIOR_INVESTIGATOR') {
        identity = 'DEMO300001';
        password = 'Password@123';
      } else if (targetRole === 'ADMIN') {
        identity = 'DEMO900001';
        password = 'Password@123';
      } else if (targetRole === 'CITIZEN') {
        const savedAcc = localStorage.getItem('last_citizen_account');
        const savedPwd = localStorage.getItem('last_citizen_pwd');
        identity = savedAcc || 'DEMO100001';
        password = savedPwd || 'Password@123';
      }

      const res = await api.login(identity, password);
      if (res.success && res.user) {
        setUser(res.user);
        setToken(res.token);
        return { success: true };
      }
      return { success: false, message: res.message || 'Could not switch persona' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Role switch failed' };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore network errors during logout
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, health, login, register, quickSwitchRole, logout, checkHealth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
