import {
  Manifestation,
  Sector,
  Professional,
  UserProfile,
  SystemSettings,
  NotificationItem,
  AuditLogItem,
  ResponseTemplate
} from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      },
      ...options
    });
    if (!res.ok) {
      console.warn(`API request ${endpoint} failed with status ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.warn(`API call ${endpoint} unreachable:`, error);
    return null;
  }
}

export const apiService = {
  // Health
  checkHealth: () => fetchJson<{ status: string }>('/health'),

  // Settings
  getSettings: () => fetchJson<SystemSettings>('/settings'),
  updateSettings: (settings: SystemSettings) =>
    fetchJson<SystemSettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    }),

  // Users
  getUsers: () => fetchJson<UserProfile[]>('/users'),
  createUser: (user: Omit<UserProfile, 'id'>) =>
    fetchJson<UserProfile>('/users', {
      method: 'POST',
      body: JSON.stringify(user)
    }),
  updateUser: (id: string, user: Partial<UserProfile>) =>
    fetchJson<UserProfile>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user)
    }),
  changePassword: (id: string, newPassword: string) =>
    fetchJson<UserProfile>(`/users/${id}/change-password`, {
      method: 'PUT',
      body: JSON.stringify({ newPassword })
    }),
  resetPassword: (id: string) =>
    fetchJson<UserProfile>(`/users/${id}/reset-password`, {
      method: 'PUT'
    }),

  // Sectors
  getSectors: () => fetchJson<Sector[]>('/sectors'),
  createSector: (sector: Omit<Sector, 'id'>) =>
    fetchJson<Sector>('/sectors', {
      method: 'POST',
      body: JSON.stringify(sector)
    }),
  updateSector: (id: string, sector: Partial<Sector>) =>
    fetchJson<Sector>(`/sectors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sector)
    }),

  // Professionals
  getProfessionals: () => fetchJson<Professional[]>('/professionals'),
  createProfessional: (prof: Omit<Professional, 'id'>) =>
    fetchJson<Professional>('/professionals', {
      method: 'POST',
      body: JSON.stringify(prof)
    }),
  updateProfessional: (id: string, prof: Partial<Professional>) =>
    fetchJson<Professional>(`/professionals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(prof)
    }),

  // Manifestations
  getManifestations: () => fetchJson<Manifestation[]>('/manifestations'),
  createManifestation: (manifestation: Partial<Manifestation>) =>
    fetchJson<Manifestation>('/manifestations', {
      method: 'POST',
      body: JSON.stringify(manifestation)
    }),
  updateManifestation: (id: string, updates: Partial<Manifestation>) =>
    fetchJson<Manifestation>(`/manifestations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),

  // Notifications
  getNotifications: () => fetchJson<NotificationItem[]>('/notifications'),
  createNotification: (n: NotificationItem) =>
    fetchJson<NotificationItem>('/notifications', {
      method: 'POST',
      body: JSON.stringify(n)
    }),
  markNotificationRead: (id: string) =>
    fetchJson<NotificationItem>(`/notifications/${id}/read`, {
      method: 'PUT'
    }),
  clearNotifications: () =>
    fetchJson<{ success: boolean }>('/notifications/clear', {
      method: 'DELETE'
    }),

  // Audit Logs
  getAuditLogs: () => fetchJson<AuditLogItem[]>('/audit-logs'),
  createAuditLog: (log: Omit<AuditLogItem, 'id'>) =>
    fetchJson<AuditLogItem>('/audit-logs', {
      method: 'POST',
      body: JSON.stringify(log)
    }),

  // Response Templates
  getTemplates: () => fetchJson<ResponseTemplate[]>('/templates'),
  createTemplate: (template: Omit<ResponseTemplate, 'id'>) =>
    fetchJson<ResponseTemplate>('/templates', {
      method: 'POST',
      body: JSON.stringify(template)
    }),
  deleteTemplate: (id: string) =>
    fetchJson<{ success: boolean }>(`/templates/${id}`, {
      method: 'DELETE'
    })
};
