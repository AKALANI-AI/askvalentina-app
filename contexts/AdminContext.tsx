// Powered by OnSpace.AI
// ASK VALENTINA — Admin Context

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { verifyAdminPin } from '@/services/adminService';

const ADMIN_KEY = 'ask_valentina_admin_session';

interface AdminContextType {
  isAdmin: boolean;
  adminLoading: boolean;
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  checkAdminSession: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  const checkAdminSession = useCallback(async () => {
    try {
      const session = await AsyncStorage.getItem(ADMIN_KEY);
      setIsAdmin(session === 'true');
    } catch {
      setIsAdmin(false);
    }
    setAdminLoading(false);
  }, []);

  const loginAdmin = useCallback((pin: string): boolean => {
    const valid = verifyAdminPin(pin);
    if (valid) {
      setIsAdmin(true);
      AsyncStorage.setItem(ADMIN_KEY, 'true');
    }
    return valid;
  }, []);

  const logoutAdmin = useCallback(() => {
    setIsAdmin(false);
    AsyncStorage.removeItem(ADMIN_KEY);
  }, []);

  // Check session on mount
  React.useEffect(() => {
    checkAdminSession();
  }, [checkAdminSession]);

  return (
    <AdminContext.Provider value={{ isAdmin, adminLoading, loginAdmin, logoutAdmin, checkAdminSession }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
}
