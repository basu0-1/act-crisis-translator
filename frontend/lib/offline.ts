import { EmergencyDecisionPackage } from '@/types';

const CACHE_KEY = 'act_cached_decision_plan';
const CACHE_TIMESTAMP_KEY = 'act_cached_timestamp';

export const OfflineStorage = {
  saveDecisionPackage(data: EmergencyDecisionPackage): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, new Date().toISOString());
      }
    } catch (e) {
      console.warn('Failed to cache emergency package offline', e);
    }
  },

  getCachedDecisionPackage(): { data: EmergencyDecisionPackage | null; timestamp: string | null } {
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(CACHE_KEY);
        const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
        if (raw) {
          return { data: JSON.parse(raw), timestamp };
        }
      }
    } catch (e) {
      console.warn('Failed to retrieve offline emergency package', e);
    }
    return { data: null, timestamp: null };
  },

  formatCachedTime(timestamp: string | null): string {
    if (!timestamp) return 'CACHED';
    try {
      const d = new Date(timestamp);
      return `CACHED — LAST VERIFIED: ${d.toLocaleTimeString()} (${d.toLocaleDateString()})`;
    } catch {
      return 'CACHED';
    }
  }
};
