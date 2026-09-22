import {
  EmergencyDecisionPackage, User, EmergencyAlert, Shelter,
  RiskAssessment, Route, UserRole, MobilityTier
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiClient {
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('act_token');
    }
    return null;
  }

  public setToken(token: string | null) {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('act_token', token);
      } else {
        localStorage.removeItem('act_token');
      }
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include', // for HttpOnly cookies
    });

    if (!res.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errJson = await res.json();
        errorMessage = errJson.detail || errorMessage;
      } catch {
        errorMessage = `HTTP error ${res.status}`;
      }
      throw new Error(errorMessage);
    }

    return res.json();
  }

  // --- Auth ---
  async login(email: string, password: string): Promise<{ access_token: string; user_role: UserRole; full_name: string }> {
    const data = await this.request<{ access_token: string; user_role: UserRole; full_name: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    this.setToken(data.access_token);
    return data;
  }

  async register(payload: {
    full_name: string;
    email: string;
    password: string;
    preferred_language: string;
    mobility: MobilityTier;
  }): Promise<{ access_token: string; user_role: UserRole; full_name: string }> {
    const data = await this.request<{ access_token: string; user_role: UserRole; full_name: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    this.setToken(data.access_token);
    return data;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // --- User Profile & Preferences ---
  async updateProfile(data: any): Promise<any> {
    return this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updatePreferences(data: any): Promise<any> {
    return this.request('/users/me/preferences', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // --- Emergency Decisions & Decision Package ---
  async getDecisionPackage(): Promise<EmergencyDecisionPackage> {
    return this.request<EmergencyDecisionPackage>('/decision/current');
  }

  async getActiveAlerts(): Promise<EmergencyAlert[]> {
    return this.request<EmergencyAlert[]>('/alerts/active');
  }

  async getShelters(): Promise<Shelter[]> {
    return this.request<Shelter[]>('/shelters');
  }

  // --- Dynamic Recalculation ---
  async recalculateRoute(routeId: number, blockageLocation: string, reason: string): Promise<Route> {
    return this.request<Route>('/routes/recalculate', {
      method: 'POST',
      body: JSON.stringify({
        route_id: routeId,
        blockage_location: blockageLocation,
        reason,
      }),
    });
  }

  async calculateRoute(alertId: number, mobility: MobilityTier): Promise<Route> {
    return this.request<Route>('/routes/calculate', {
      method: 'POST',
      body: JSON.stringify({
        alert_id: alertId,
        mobility,
      }),
    });
  }

  // --- Demo Simulation Triggers ---
  async triggerDemoRoadblock(): Promise<any> {
    return this.request('/demo/trigger-roadblock', { method: 'POST' });
  }

  async triggerDemoUrgency(minutes: number = 10): Promise<any> {
    return this.request(`/demo/trigger-urgency?minutes=${minutes}`, { method: 'POST' });
  }

  async resetDemo(): Promise<any> {
    return this.request('/demo/reset', { method: 'POST' });
  }

  // --- Admin API ---
  async getAdminStats(): Promise<any> {
    return this.request('/admin/stats');
  }

  async getAdminUsers(): Promise<User[]> {
    return this.request('/admin/users');
  }

  async getAdminAlerts(): Promise<EmergencyAlert[]> {
    return this.request('/admin/alerts');
  }

  async createAdminAlert(data: any): Promise<EmergencyAlert> {
    return this.request('/admin/alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminAlert(id: number, data: any): Promise<EmergencyAlert> {
    return this.request(`/admin/alerts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAdminShelters(): Promise<Shelter[]> {
    return this.request('/admin/shelters');
  }

  async createAdminShelter(data: any): Promise<Shelter> {
    return this.request('/admin/shelters', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAdminAudit(): Promise<any[]> {
    return this.request('/admin/audit');
  }
}

export const api = new ApiClient();
