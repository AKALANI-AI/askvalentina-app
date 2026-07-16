// Powered by OnSpace.AI
// ASK VALENTINA — App Context & State Management

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { fetchReadings } from '@/services/paymentService';

export interface Reading {
  id: string;
  client_name: string;
  client_phone: string;
  topic: string;
  questions: string[];
  answers: string[];
  status: 'pending' | 'inProgress' | 'completed';
  submitted_at: string;
  answered_at?: string;
  amount: number;
  payment_status: string;
  stripe_session_id?: string;
  client_photo?: string;
  subject_photos?: string[];
  push_token?: string;
}

interface AppContextType {
  readings: Reading[];
  loading: boolean;
  refreshReadings: () => Promise<void>;
  getReading: (id: string) => Reading | undefined;
  pendingCount: number;
  completedCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReadings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await fetchReadings();
    if (data && !error) {
      setReadings(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadReadings();
  }, [loadReadings]);

  const refreshReadings = useCallback(async () => {
    await loadReadings();
  }, [loadReadings]);

  const getReading = useCallback(
    (id: string) => readings.find((r) => r.id === id),
    [readings]
  );

  const pendingCount = readings.filter((r) => r.status === 'pending' || r.status === 'inProgress').length;
  const completedCount = readings.filter((r) => r.status === 'completed').length;

  return (
    <AppContext.Provider value={{ readings, loading, refreshReadings, getReading, pendingCount, completedCount }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
