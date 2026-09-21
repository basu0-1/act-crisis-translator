'use client';

import { useState, useEffect } from 'react';
import { OfflineStorage } from '@/lib/offline';

export function useOffline() {
  const [isOffline, setIsOffline] = useState(false);
  const [cachedTimestamp, setCachedTimestamp] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => {
      setIsOffline(true);
      const { timestamp } = OfflineStorage.getCachedDecisionPackage();
      setCachedTimestamp(timestamp);
    };

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      const { timestamp } = OfflineStorage.getCachedDecisionPackage();
      setCachedTimestamp(timestamp);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOffline, cachedTimestamp, setIsOffline };
}
