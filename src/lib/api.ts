/**
 * Centralized API Client for Real-Time Fraud Intelligence & Investigation Platform
 * Configured with baseURL fallback, JWT bearer token headers, and typed response handlers.
 */

const BASE_URL = (import.meta as any).env?.VITE_API_URL || '';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = typeof window !== 'undefined' ? localStorage.getItem('fraud_intel_token') : null;
  }

  public setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('fraud_intel_token', token);
      } else {
        localStorage.removeItem('fraud_intel_token');
      }
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data as T;
    } catch (err: any) {
      // Friendly network failure message
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Backend server is unavailable or network connection failed.');
      }
      throw err;
    }
  }

  // Health
  public async getHealth() {
    return this.request<{ success: boolean; message: string; database: string; mode?: string }>('/api/health');
  }

  // Auth
  public async login(identity: string, password: string) {
    const res = await this.request<{ success: boolean; token: string; user: any; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identity, password }),
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  public async register(payload: { name: string; accountNumber: string; aadhaarNumber: string; password: string; confirmPassword: string }) {
    const res = await this.request<{ success: boolean; token: string; user: any; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  public async logout() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  public async getMe() {
    return this.request<{ success: boolean; user: any }>('/api/auth/me');
  }

  public async forgotPassword(identity: string) {
    return this.request<{ success: boolean; message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identity }),
    });
  }

  // Dashboard Stats
  public async getDashboardStats() {
    return this.request<{ success: boolean; data: any }>('/api/dashboard/stats');
  }

  // Cases & Citizen Complaints
  public async getCases(filters?: { status?: string; riskLevel?: string; category?: string; query?: string; account?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.riskLevel) params.append('riskLevel', filters.riskLevel);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.query) params.append('query', filters.query);
    if (filters?.account) params.append('account', filters.account);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ success: boolean; count: number; data: any[] }>(`/api/cases${queryStr}`);
  }

  public async getCitizenComplaints() {
    return this.request<{ success: boolean; count: number; data: any[] }>('/api/citizen/complaints');
  }

  public async submitComplaint(complaintData: {
    title?: string;
    description: string;
    category?: string;
    disputedTxnRef?: string;
    disputedAmount?: number;
    suspectAccount?: string;
    incidentDate?: string;
    desiredOutcome?: string;
    citizenName?: string;
    citizenAccount?: string;
    citizenAadhaar?: string;
    citizenPhone?: string;
  }) {
    return this.request<{ success: boolean; message: string; data: any }>('/api/complaints', {
      method: 'POST',
      body: JSON.stringify(complaintData),
    });
  }

  public async getCaseById(id: string) {
    return this.request<{ success: boolean; data: any }>(`/api/cases/${id}`);
  }

  public async updateCaseStatus(id: string, status: string) {
    return this.request<{ success: boolean; data: any }>(`/api/cases/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  public async assignCase(id: string, investigatorId: string) {
    return this.request<{ success: boolean; data: any }>(`/api/cases/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ investigatorId }),
    });
  }

  public async addCaseNote(caseId: string, note: string) {
    return this.request<{ success: boolean; data: any }>(`/api/cases/${caseId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  }

  public async addEvidence(caseId: string, data: { type: string; description: string; fileHash?: string }) {
    return this.request<{ success: boolean; data: any }>(`/api/cases/${caseId}/evidence`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Transactions
  public async getTransactions(account?: string, limit = 100) {
    const params = new URLSearchParams();
    if (account) params.append('account', account);
    if (limit) params.append('limit', limit.toString());

    return this.request<{ success: boolean; count: number; data: any[] }>(`/api/transactions?${params.toString()}`);
  }

  public async simulateTransaction(txnData: any) {
    return this.request<{ success: boolean; data: any; message: string }>('/api/transactions/simulate', {
      method: 'POST',
      body: JSON.stringify(txnData),
    });
  }

  // Alerts
  public async getAlerts() {
    return this.request<{ success: boolean; data: any[] }>('/api/alerts');
  }

  public async updateAlertStatus(alertId: string, status: string) {
    return this.request<{ success: boolean; data: any }>(`/api/alerts/${alertId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Evidence
  public async getEvidence(caseId?: string) {
    const q = caseId ? `?caseId=${caseId}` : '';
    return this.request<{ success: boolean; data: any[] }>(`/api/evidence${q}`);
  }

  // Repeated Account Intelligence & Actions
  public async getRepeatedAccount(accountNumber: string) {
    return this.request<{ success: boolean; data: any }>(`/api/accounts/repeated/${accountNumber}`);
  }

  public async recommendAccountFreeze(accountNumber: string, reason: string) {
    return this.request<{ success: boolean; data: any }>('/api/accounts/freeze-recommendation', {
      method: 'POST',
      body: JSON.stringify({ accountNumber, reason }),
    });
  }

  // Risk Simulator
  public async simulateRisk(inputs: any) {
    return this.request<{ success: boolean; data: any }>('/api/risk/simulate', {
      method: 'POST',
      body: JSON.stringify(inputs),
    });
  }

  // Network Graph
  public async getNetworkGraph() {
    return this.request<{ success: boolean; data: { nodes: any[]; edges: any[] } }>('/api/network');
  }

  // Analytics & Intelligence
  public async getAnalytics() {
    return this.request<{ success: boolean; data: any }>('/api/analytics');
  }

  public async getRiskIntelligence() {
    return this.request<{ success: boolean; data: any }>('/api/analytics');
  }

  // Audit Logs
  public async getAuditLogs() {
    return this.request<{ success: boolean; data: any[] }>('/api/audit');
  }

  // Users
  public async getUsers() {
    return this.request<{ success: boolean; data: any[] }>('/api/users');
  }
}

export const api = new ApiClient();
