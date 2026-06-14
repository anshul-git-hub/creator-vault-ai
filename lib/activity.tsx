'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ActivityAction = 'Uploaded' | 'Deleted' | 'Updated';

export interface ActivityLog {
  id: string;
  action: ActivityAction;
  fileName: string;
  category: string;
  timestamp: string;
}

interface ActivityContextType {
  activities: ActivityLog[];
  logActivity: (action: ActivityAction, fileName: string, category: string) => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  // Load initial from sessionStorage to persist across page reloads in the same tab
  useEffect(() => {
    const stored = sessionStorage.getItem('creatorvault_activities');
    if (stored) {
      try {
        setActivities(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const logActivity = (action: ActivityAction, fileName: string, category: string) => {
    setActivities((prev) => {
      const newLog: ActivityLog = {
        id: crypto.randomUUID(),
        action,
        fileName,
        category,
        timestamp: new Date().toISOString(),
      };
      // Keep most recent 50 activities
      const updated = [newLog, ...prev].slice(0, 50);
      sessionStorage.setItem('creatorvault_activities', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <ActivityContext.Provider value={{ activities, logActivity }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
}
