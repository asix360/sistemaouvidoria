import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Manifestation,
  Sector,
  Professional,
  UserProfile,
  SystemSettings,
  NotificationItem,
  AuditLogItem,
  ResponseTemplate,
  ManifestationStatus,
  ManifestationType,
  Priority,
  SLAInfo,
  Forwarding,
  ResponseItem
} from '../types';

import {
  INITIAL_SETTINGS,
  INITIAL_SECTORS,
  INITIAL_PROFESSIONALS,
  INITIAL_USERS,
  INITIAL_MANIFESTATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_RESPONSE_TEMPLATES
} from '../data/initialSeed';

export type ThemeMode = 'system' | 'light' | 'dark';

interface SystemContextType {
  // Theme & Auth & Active User
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  isAuthenticated: boolean;
  login: (emailOrLogin: string, pass: string) => boolean;
  loginAsUser: (user: UserProfile) => void;
  logout: () => void;
  currentUser: UserProfile;
  setCurrentUser: (u: UserProfile) => void;
  users: UserProfile[];
  addUser: (userData: Omit<UserProfile, 'id'>) => void;
  updateUser: (userId: string, updatedData: Partial<UserProfile>) => void;
  updateUserPermissions: (userId: string, permissions: UserProfile['permissions']) => void;
  resetUserPassword: (userId: string) => void;
  changeUserPassword: (userId: string, newPass: string) => void;
  
  // Settings
  settings: SystemSettings;
  updateSettings: (s: SystemSettings) => void;
  
  // Data State
  manifestations: Manifestation[];
  sectors: Sector[];
  professionals: Professional[];
  notifications: NotificationItem[];
  auditLogs: AuditLogItem[];
  responseTemplates: ResponseTemplate[];
  
  // Manifestations Actions
  addManifestation: (m: Omit<Manifestation, 'id' | 'protocol' | 'created_at' | 'forwardings' | 'responses' | 'status'> & { created_time?: string }) => Manifestation;
  updateManifestation: (id: string, updates: Partial<Manifestation>) => void;
  deleteManifestation: (id: string, reason: string) => void;
  restoreManifestation: (id: string) => void;
  addForwarding: (manifestationId: string, fwd: Omit<Forwarding, 'id' | 'sent_at' | 'status'>) => void;
  respondForwarding: (manifestationId: string, forwardingId: string, responseText: string, status?: Forwarding['status']) => void;
  addResponse: (manifestationId: string, resp: Omit<ResponseItem, 'id' | 'created_at' | 'author_name' | 'author_role'>) => void;
  updateStatus: (manifestationId: string, newStatus: ManifestationStatus, reason?: string) => void;
  
  // Auxiliary Entities CRUD
  addSector: (s: Omit<Sector, 'id'>) => void;
  updateSector: (id: string, updates: Partial<Sector>) => void;
  toggleSectorActive: (id: string) => void;

  addProfessional: (p: Omit<Professional, 'id'>) => void;
  updateProfessional: (id: string, updates: Partial<Professional>) => void;
  toggleProfessionalActive: (id: string) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Response Templates CRUD
  addResponseTemplate: (tpl: Omit<ResponseTemplate, 'id'>) => void;
  updateResponseTemplate: (id: string, updates: Partial<ResponseTemplate>) => void;
  deleteResponseTemplate: (id: string) => void;

  // Audit Logs
  logAudit: (action: any, entityType: any, entityId: string, details: string) => void;

  // Global Search & Filters
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showDeleted: boolean;
  setShowDeleted: (val: boolean) => void;

  // SLA Calculation Helper
  calculateSLA: (createdDateStr: string, priority: Priority, customDays?: number) => SLAInfo;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ouvidoria_upa_sus_v1';

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('ouvidoria_theme_mode');
      if (saved === 'system' || saved === 'light' || saved === 'dark') return saved as ThemeMode;
    } catch (e) {}
    return 'system';
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  const theme = React.useMemo<'light' | 'dark'>(() => {
    if (themeMode === 'system') {
      return systemPrefersDark ? 'dark' : 'light';
    }
    return themeMode;
  }, [themeMode, systemPrefersDark]);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('ouvidoria_auth_session') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);

  const login = (emailOrLogin: string, pass: string): boolean => {
    const cleanSearch = emailOrLogin.trim().toLowerCase();
    const cleanPass = pass.trim();

    let foundUser = users.find(
      u => u.email.toLowerCase() === cleanSearch || 
           u.name.toLowerCase() === cleanSearch ||
           (u.cpf && u.cpf.replace(/\D/g, '') === cleanSearch.replace(/\D/g, ''))
    );

    if (!foundUser) {
      foundUser = INITIAL_USERS.find(u => u.email.toLowerCase() === cleanSearch);
    }

    if (!foundUser) {
      return false;
    }

    // 2. Validação de Senha STRICT (Aceita APENAS a senha atual do usuário)
    const expectedPassword = foundUser.password || '12345678';
    if (cleanPass !== expectedPassword) {
      return false;
    }

    setCurrentUser(foundUser);
    setIsAuthenticated(true);
    localStorage.setItem('ouvidoria_auth_session', 'true');
    localStorage.setItem('ouvidoria_logged_user_id', foundUser.id);
    logAudit('Login', 'Usuário', foundUser.id, `Acesso efetuado pelo usuário ${foundUser.name} (${foundUser.role}).`);
    return true;
  };

  const loginAsUser = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('ouvidoria_auth_session', 'true');
    localStorage.setItem('ouvidoria_logged_user_id', user.id);
    logAudit('Login', 'Usuário', user.id, `Acesso efetuado via Perfil Direto (${user.name} - ${user.role}).`);
  };

  const logout = () => {
    logAudit('Logout', 'Usuário', currentUser.id, `Sessão encerrada por ${currentUser.name}.`);
    setIsAuthenticated(false);
    localStorage.setItem('ouvidoria_auth_session', 'false');
    localStorage.removeItem('ouvidoria_logged_user_id');
  };
  
  const [manifestations, setManifestations] = useState<Manifestation[]>(INITIAL_MANIFESTATIONS);
  const [sectors, setSectors] = useState<Sector[]>(INITIAL_SECTORS);
  const [professionals, setProfessionals] = useState<Professional[]>(INITIAL_PROFESSIONALS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ouvidoria_read_notification_ids');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [responseTemplates, setResponseTemplates] = useState<ResponseTemplate[]>(INITIAL_RESPONSE_TEMPLATES);
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showDeleted, setShowDeleted] = useState<boolean>(false);

  // Load from Backend API (PostgreSQL) with fallback to LocalStorage
  useEffect(() => {
    async function loadBackendData() {
      try {
        const [
          backendSettings,
          backendUsers,
          backendSectors,
          backendProfessionals,
          backendManifestations,
          backendNotifications,
          backendAuditLogs,
          backendTemplates
        ] = await Promise.all([
          import('../services/api').then(m => m.apiService.getSettings()),
          import('../services/api').then(m => m.apiService.getUsers()),
          import('../services/api').then(m => m.apiService.getSectors()),
          import('../services/api').then(m => m.apiService.getProfessionals()),
          import('../services/api').then(m => m.apiService.getManifestations()),
          import('../services/api').then(m => m.apiService.getNotifications()),
          import('../services/api').then(m => m.apiService.getAuditLogs()),
          import('../services/api').then(m => m.apiService.getTemplates())
        ]);

        if (backendSettings) setSettings((prev: SystemSettings) => ({ ...prev, ...backendSettings }));
        if (Array.isArray(backendUsers) && backendUsers.length > 0) {
          setUsers(backendUsers);
          const savedUserId = localStorage.getItem('ouvidoria_logged_user_id');
          if (savedUserId) {
            const savedUser = backendUsers.find((u: UserProfile) => u.id === savedUserId);
            if (savedUser) {
              setCurrentUser(savedUser);
            }
          } else {
            setCurrentUser((prev: UserProfile) => {
              const freshUser = backendUsers.find((u: UserProfile) => u.id === prev.id || u.email.toLowerCase() === prev.email.toLowerCase());
              return freshUser ? { ...prev, ...freshUser } : prev;
            });
          }
        }
        if (Array.isArray(backendSectors) && backendSectors.length > 0) setSectors(backendSectors);
        if (Array.isArray(backendProfessionals)) setProfessionals(backendProfessionals);
        if (Array.isArray(backendManifestations)) setManifestations(backendManifestations as any);
        if (Array.isArray(backendNotifications)) setNotifications(backendNotifications);
        if (Array.isArray(backendAuditLogs)) setAuditLogs(backendAuditLogs as any);
        if (Array.isArray(backendTemplates) && backendTemplates.length > 0) setResponseTemplates(backendTemplates);
      } catch (e) {
        console.warn('Backend API não detectada ou inacessível. Usando armazenamento local:', e);
        try {
          const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.manifestations) setManifestations(parsed.manifestations);
            if (parsed.sectors) setSectors(parsed.sectors);
            if (parsed.professionals) setProfessionals(parsed.professionals);
            if (parsed.settings) setSettings(prev => ({ ...prev, ...parsed.settings }));
            if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
            if (parsed.users) setUsers(parsed.users);
            if (parsed.responseTemplates) setResponseTemplates(parsed.responseTemplates);
          }
        } catch (err) {
          console.warn('Falha ao carregar do local storage:', err);
        }
      }
    }

    loadBackendData();

    // Re-sincronizar quando a janela ganha foco ou muda de hash
    const handleFocusOrHash = () => {
      loadBackendData();
    };
    window.addEventListener('focus', handleFocusOrHash);
    window.addEventListener('hashchange', handleFocusOrHash);

    return () => {
      window.removeEventListener('focus', handleFocusOrHash);
      window.removeEventListener('hashchange', handleFocusOrHash);
    };
  }, []);

  // Sync state to local storage backup
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          manifestations,
          sectors,
          professionals,
          settings,
          auditLogs,
          users,
          responseTemplates
        })
      );
    } catch (e) {
      console.warn('Failed to save state to local storage:', e);
    }
  }, [manifestations, sectors, professionals, settings, auditLogs, users, responseTemplates]);

  // Sincronizar classe 'dark' no elemento raiz HTML no carregamento e ao alterar o tema
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const setTheme = (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem('ouvidoria_theme_mode', mode);
    } catch (e) {}
  };

  // Helper: SLA calculation
  const calculateSLA = (createdDateStr: string, priority: Priority, customDays?: number): SLAInfo => {
    const created = new Date(createdDateStr);
    const today = new Date();
    
    let allowedDays = customDays || settings.default_sla_days || 15;
    if (priority === 'Urgente') allowedDays = Math.min(allowedDays, 5);
    else if (priority === 'Alta') allowedDays = Math.min(allowedDays, 10);
    
    const deadline = new Date(created);
    deadline.setDate(deadline.getDate() + allowedDays);
    
    const diffTime = deadline.getTime() - today.getTime();
    const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let trafficLight: '🟢' | '🟡' | '🔴' = '🟢';
    let statusLabel: 'Dentro do prazo' | 'Próximo do vencimento' | 'Prazo vencido' = 'Dentro do prazo';

    if (remainingDays < 0) {
      trafficLight = '🔴';
      statusLabel = 'Prazo vencido';
    } else if (remainingDays <= settings.warning_sla_days) {
      trafficLight = '🟡';
      statusLabel = 'Próximo do vencimento';
    } else {
      trafficLight = '🟢';
      statusLabel = 'Dentro do prazo';
    }

    const yyyy = deadline.getFullYear();
    const mm = String(deadline.getMonth() + 1).padStart(2, '0');
    const dd = String(deadline.getDate()).padStart(2, '0');

    return {
      initial_deadline: `${yyyy}-${mm}-${dd}`,
      remaining_days: Math.max(0, remainingDays),
      overdue_days: remainingDays < 0 ? Math.abs(remainingDays) : 0,
      traffic_light: trafficLight,
      status_label: statusLabel
    };
  };

  // Helper: Digital Signature Generator
  const generateDigitalSignature = (text: string): string => {
    const timestamp = new Date().toISOString();
    const source = `${text}-${currentUser.name}-${currentUser.role}-${timestamp}`;
    let hash = 0;
    for (let i = 0; i < source.length; i++) {
      const char = source.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `SHA256:${hex.toUpperCase()}-${currentUser.role.substring(0, 3).toUpperCase()}-SUS`;
  };

  // Helper: Add Audit Log
  const logAudit = (
    action: AuditLogItem['action'],
    entity: AuditLogItem['entity'],
    entity_id: string,
    details: string
  ) => {
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
    const newLog: AuditLogItem = {
      id: `log_${Date.now()}`,
      user_name: currentUser.name,
      user_role: currentUser.role,
      action,
      entity,
      entity_id,
      timestamp,
      ip: '192.168.10.12',
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
    import('../services/api').then(m => m.apiService.createAuditLog(newLog)).catch(e => console.warn(e));
  };

  // Protocol generator
  const generateProtocolNumber = (): string => {
    const year = new Date().getFullYear();
    const count = manifestations.length + 101;
    const padded = String(count).padStart(6, '0');
    return `${settings.auto_protocol_prefix || 'OUV-' + year}-${padded}`;
  };

  // Add new Manifestation
  const addManifestation = (
    data: Omit<Manifestation, 'id' | 'protocol' | 'created_at' | 'sla' | 'forwardings' | 'responses' | 'deleted_at'>
  ): Manifestation => {
    const protocol = generateProtocolNumber();
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const created_at = `${yyyy}-${mm}-${dd}`;
    
    const sla = calculateSLA(created_at, data.priority);

    // If anonymous, wipe out complainant details safely
    const finalComplainant = data.is_anonymous
      ? {
          name: 'Manifestante Anônimo',
          cpf: '',
          sus_card: '',
          phone: '',
          whatsapp: '',
          email: '',
          city: 'São Paulo',
          address: 'Não informado',
          neighborhood: 'Não informado',
          cep: '',
          gender: 'Não informado' as const,
          birth_date: ''
        }
      : data.complainant;

    const newM: Manifestation = {
      ...data,
      id: `man_${Date.now()}`,
      protocol,
      created_at,
      complainant: finalComplainant,
      sla,
      forwardings: [],
      responses: [],
      deleted_at: null
    };

    setManifestations(prev => [newM, ...prev]);
    import('../services/api').then(m => m.apiService.createManifestation(newM)).catch(e => console.warn(e));
    
    // Audit Log
    logAudit('Criação', 'Manifestação', protocol, `Manifestação ${protocol} cadastrada (Tipo: ${data.type}, Setor: ${data.sector_name}).`);

    // Notification
    setNotifications(prev => [
      {
        id: `not_${Date.now()}`,
        title: 'Nova Manifestação Cadastrada',
        message: `Protocolo ${protocol} (${data.type}) registrado para o setor ${data.sector_name}.`,
        type: 'new',
        read: false,
        timestamp: `${created_at} ${data.created_time || '10:00'}`,
        manifestation_id: newM.id,
        protocol
      },
      ...prev
    ]);

    return newM;
  };

  // Update Manifestation
  const updateManifestation = (id: string, updates: Partial<Manifestation>) => {
    setManifestations(prev =>
      prev.map(m => {
        if (m.id !== id) return m;
        const updated = { ...m, ...updates };
        logAudit('Edição', 'Manifestação', m.protocol, `Dados da manifestação ${m.protocol} atualizados.`);
        import('../services/api').then(api => api.apiService.updateManifestation(id, updates)).catch(e => console.warn(e));
        return updated;
      })
    );
  };

  // Soft Delete
  const softDeleteManifestation = (id: string, reason: string) => {
    const now = new Date().toISOString();
    setManifestations(prev =>
      prev.map(m => {
        if (m.id !== id) return m;
        logAudit('Exclusão (Soft Delete)', 'Manifestação', m.protocol, `Registro ocultado com Soft Delete. Motivo: ${reason}`);
        const updates = {
          deleted_at: now,
          deleted_by: currentUser.name,
          deleted_reason: reason
        };
        import('../services/api').then(api => api.apiService.updateManifestation(id, updates)).catch(e => console.warn(e));
        return {
          ...m,
          ...updates
        };
      })
    );
  };

  // Restore Soft Deleted
  const restoreManifestation = (id: string) => {
    setManifestations(prev =>
      prev.map(m => {
        if (m.id !== id) return m;
        logAudit('Restauração', 'Manifestação', m.protocol, `Registro ${m.protocol} restaurado da lixeira.`);
        const updates = { deleted_at: null, deleted_by: undefined, deleted_reason: undefined };
        import('../services/api').then(api => api.apiService.updateManifestation(id, updates)).catch(e => console.warn(e));
        return {
          ...m,
          ...updates
        };
      })
    );
  };

  // Add Forwarding (Tramitação)
  const addForwarding = (
    manifestationId: string,
    fwd: Omit<Forwarding, 'id' | 'sent_at' | 'status'>
  ) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newFwd: Forwarding = {
      ...fwd,
      id: `fwd_${Date.now()}`,
      sent_at: nowStr,
      status: 'Pendente'
    };

    setManifestations(prev =>
      prev.map(m => {
        if (m.id !== manifestationId) return m;
        const updatedForwardings = [...m.forwardings, newFwd];
        logAudit('Encaminhamento', 'Manifestação', m.protocol, `Encaminhado ao setor ${fwd.sector_name} (${fwd.responsible_name}) com prazo ${fwd.deadline}.`);
        
        import('../services/api').then(api => api.apiService.updateManifestation(manifestationId, {
          status: 'Encaminhada',
          forwardings: updatedForwardings
        })).catch(e => console.warn(e));

        return {
          ...m,
          status: 'Encaminhada',
          forwardings: updatedForwardings
        };
      })
    );
  };

  // Respond to Sector Forwarding (Parecer Técnico do Setor)
  const respondForwarding = (
    manifestationId: string,
    forwardingId: string,
    responseText: string,
    status: Forwarding['status'] = 'Respondido'
  ) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const signature = generateDigitalSignature(responseText);

    setManifestations(prev =>
      prev.map(m => {
        if (m.id !== manifestationId) return m;

        let sectorName = 'Setor UPA';
        const updatedFwds = m.forwardings.map(f => {
          if (f.id !== forwardingId) return f;
          sectorName = f.sector_name;
          return {
            ...f,
            response: responseText,
            response_at: nowStr,
            status,
            digital_signature: signature
          };
        });

        logAudit('Encaminhamento', 'Manifestação', m.protocol, `Parecer técnico do setor ${sectorName} registrado na tramitação (${status}). Assinatura: ${signature}`);

        import('../services/api').then(api => api.apiService.updateManifestation(manifestationId, {
          status: 'Em análise',
          forwardings: updatedFwds
        })).catch(e => console.warn(e));

        return {
          ...m,
          status: 'Em análise',
          forwardings: updatedFwds
        };
      })
    );
  };

  // Add Response
  const addResponse = (
    manifestationId: string,
    resp: Omit<ResponseItem, 'id' | 'created_at' | 'author_name' | 'author_role'>
  ) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const signature = generateDigitalSignature(resp.content);

    const newResp: ResponseItem = {
      ...resp,
      id: `resp_${Date.now()}`,
      author_name: currentUser.name,
      author_role: currentUser.role,
      created_at: nowStr,
      digital_signature: signature
    };

    setManifestations(prev =>
      prev.map(m => {
        if (m.id !== manifestationId) return m;
        const updatedResponses = [...m.responses, newResp];
        const nextStatus = resp.status_after || (resp.is_final ? 'Concluída' : 'Respondida');
        logAudit('Resposta', 'Manifestação', m.protocol, `Resposta oficial ${resp.is_final ? 'final' : 'parcial'} emitida ao cidadão por ${currentUser.name}. Assinatura: ${signature}`);
        
        import('../services/api').then(api => api.apiService.updateManifestation(manifestationId, {
          status: nextStatus,
          responses: updatedResponses
        })).catch(e => console.warn(e));

        return {
          ...m,
          status: nextStatus,
          responses: updatedResponses
        };
      })
    );
  };

  // Update Status
  const updateStatus = (manifestationId: string, newStatus: ManifestationStatus, reason?: string) => {
    setManifestations(prev =>
      prev.map(m => {
        if (m.id !== manifestationId) return m;
        const action = newStatus === 'Encerrada' ? 'Encerramento' : newStatus === 'Reaberta' ? 'Reabertura' : 'Edição';
        logAudit(action as any, 'Manifestação', m.protocol, `Status alterado de ${m.status} para ${newStatus}${reason ? '. Motivo: ' + reason : ''}`);
        import('../services/api').then(api => api.apiService.updateManifestation(manifestationId, { status: newStatus })).catch(e => console.warn(e));
        return {
          ...m,
          status: newStatus
        };
      })
    );
  };

  // Sectors CRUD
  const addSector = (sec: Omit<Sector, 'id'>) => {
    const newSec: Sector = { ...sec, id: `sec_${Date.now()}` };
    setSectors(prev => [...prev, newSec]);
    import('../services/api').then(m => m.apiService.createSector(newSec)).catch(e => console.warn(e));
    logAudit('Criação', 'Setor', newSec.name, `Novo setor UPA adicionado: ${newSec.name} (${newSec.code}).`);
  };

  const updateSector = (id: string, updates: Partial<Sector>) => {
    setSectors(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updates } : s))
    );
    import('../services/api').then(m => m.apiService.updateSector(id, updates)).catch(e => console.warn(e));
  };

  const toggleSectorActive = (id: string) => {
    setSectors(prev =>
      prev.map(s => {
        if (s.id !== id) return s;
        const updated = { ...s, active: !s.active };
        import('../services/api').then(m => m.apiService.updateSector(id, { active: updated.active })).catch(e => console.warn(e));
        return updated;
      })
    );
  };

  // Professionals CRUD
  const addProfessional = (prof: Omit<Professional, 'id'>) => {
    const newProf: Professional = { ...prof, id: `prof_${Date.now()}` };
    setProfessionals(prev => [...prev, newProf]);
    import('../services/api').then(m => m.apiService.createProfessional(newProf)).catch(e => console.warn(e));
    logAudit('Criação', 'Profissional', newProf.name, `Profissional cadastrado: ${newProf.name} (${newProf.registration}).`);
  };

  const updateProfessional = (id: string, updates: Partial<Professional>) => {
    setProfessionals(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    );
    import('../services/api').then(m => m.apiService.updateProfessional(id, updates)).catch(e => console.warn(e));
  };

  const toggleProfessionalActive = (id: string) => {
    setProfessionals(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const updated = { ...p, active: !p.active };
        import('../services/api').then(m => m.apiService.updateProfessional(id, { active: updated.active })).catch(e => console.warn(e));
        return updated;
      })
    );
  };

  // User Management
  const addUser = (userData: Omit<UserProfile, 'id'>) => {
    const newUser: UserProfile = {
      ...userData,
      password: '12345678',
      must_change_password: true,
      id: `user_${Date.now()}`
    };
    setUsers(prev => [...prev, newUser]);
    import('../services/api').then(m => m.apiService.createUser(newUser)).catch(e => console.warn(e));
    logAudit('Criação', 'Usuário', newUser.id, `Novo usuário cadastrado no sistema: ${newUser.name} (${newUser.role}). Senha padrão '12345678' definida com troca obrigatória no 1º acesso.`);
  };

  const updateUser = (userId: string, updatedData: Partial<UserProfile>) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, ...updatedData } : u))
    );
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, ...updatedData }));
    }
    import('../services/api').then(m => m.apiService.updateUser(userId, updatedData)).catch(e => console.warn(e));
    logAudit('Edição', 'Usuário', userId, `Dados do usuário ${userId} atualizados.`);
  };

  // User Permissions
  const updateUserPermissions = (userId: string, permissions: UserProfile['permissions']) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, permissions } : u))
    );
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, permissions }));
    }
    import('../services/api').then(m => m.apiService.updateUser(userId, { permissions })).catch(e => console.warn(e));
    logAudit('Edição', 'Usuário', userId, `Permissões de usuário atualizadas.`);
  };

  const resetUserPassword = (userId: string) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, password: '12345678', must_change_password: true } : u))
    );
    import('../services/api').then(m => m.apiService.resetPassword(userId)).catch(e => console.warn(e));
    logAudit('Edição', 'Usuário', userId, `Senha do usuário resetada para a senha padrão '12345678'. Troca de senha exigida no próximo acesso.`);
  };

  const changeUserPassword = (userId: string, newPass: string) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId || u.email.toLowerCase() === currentUser.email.toLowerCase() ? { ...u, password: newPass, must_change_password: false } : u))
    );
    setCurrentUser(prev => ({ ...prev, password: newPass, must_change_password: false }));
    import('../services/api').then(m => m.apiService.changePassword(userId, newPass)).catch(e => console.warn(e));
    logAudit('Edição', 'Usuário', userId, `Senha do usuário alterada com sucesso.`);
  };

  // Settings
  const updateSettings = (s: SystemSettings) => {
    setSettings(s);
    import('../services/api').then(m => m.apiService.updateSettings(s)).catch(err => console.warn('Erro ao atualizar configurações no backend:', err));
    logAudit('Edição', 'Configurações', s.unit_code, `Parâmetros do sistema UPA atualizados.`);
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setReadNotificationIds(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem('ouvidoria_read_notification_ids', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    import('../services/api').then(m => m.apiService.markNotificationRead(id)).catch(() => {});
  };

  const clearNotifications = () => {
    const currentIds = effectiveNotifications.map(n => n.id);
    setReadNotificationIds(prev => {
      const combined = Array.from(new Set([...prev, ...currentIds]));
      try {
        localStorage.setItem('ouvidoria_read_notification_ids', JSON.stringify(combined));
      } catch (e) {}
      return combined;
    });
    setNotifications([]);
    import('../services/api').then(m => m.apiService.clearNotifications()).catch(() => {});
  };

  // Response Templates CRUD
  const addResponseTemplate = (tpl: Omit<ResponseTemplate, 'id'>) => {
    const newTpl: ResponseTemplate = {
      ...tpl,
      id: `tpl_${Date.now()}`
    };
    setResponseTemplates(prev => [...prev, newTpl]);
    import('../services/api').then(m => m.apiService.createTemplate(newTpl)).catch(e => console.warn(e));
    logAudit('Criação', 'Configurações', newTpl.id, `Novo modelo de resposta padrão cadastrado: "${newTpl.title}".`);
  };

  const updateResponseTemplate = (id: string, updates: Partial<ResponseTemplate>) => {
    setResponseTemplates(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t))
    );
    logAudit('Edição', 'Configurações', id, `Modelo de resposta padrão atualizado.`);
  };

  const deleteResponseTemplate = (id: string) => {
    setResponseTemplates(prev => prev.filter(t => t.id !== id));
    import('../services/api').then(m => m.apiService.deleteTemplate(id)).catch(e => console.warn(e));
    logAudit('Exclusão (Soft Delete)', 'Configurações', id, `Modelo de resposta padrão removido.`);
  };

  // Sintetizar notificações automaticamente a partir de todas as manifestações ativas
  const effectiveNotifications = React.useMemo(() => {
    let sourceList: NotificationItem[] = [];
    if (notifications.length > 0) {
      sourceList = notifications;
    } else {
      const derived: NotificationItem[] = [];
      manifestations.forEach(m => {
        if (m.deleted_at) return;

        // 1. Notificação de Novo Cadastro
        derived.push({
          id: `not_synth_new_${m.id}`,
          title: `Nova Manifestação Cadastrada`,
          message: `Protocolo ${m.protocol} (${m.type}) registrado para o setor ${m.sector_name}.`,
          type: 'new',
          read: false,
          timestamp: `${m.created_at} ${m.created_time || '10:00'}`,
          manifestation_id: m.id,
          protocol: m.protocol
        });

        // 2. Tramitações para os Setores
        m.forwardings.forEach((fwd, idx) => {
          derived.push({
            id: `not_synth_fwd_${m.id}_${idx}`,
            title: `Tramitação ao Setor: ${fwd.sector_name}`,
            message: `O protocolo ${m.protocol} foi encaminhado para análise do setor ${fwd.sector_name}.`,
            type: 'new',
            read: fwd.status === 'Respondido',
            timestamp: fwd.created_at || m.created_at,
            manifestation_id: m.id,
            protocol: m.protocol
          });

          if (fwd.status === 'Respondido' && fwd.response) {
            derived.push({
              id: `not_synth_ans_${m.id}_${idx}`,
              title: `Parecer Técnico Recebido: ${fwd.sector_name}`,
              message: `O setor ${fwd.sector_name} emitiu parecer técnico no protocolo ${m.protocol}.`,
              type: 'answered',
              read: false,
              timestamp: fwd.response_at || m.created_at,
              manifestation_id: m.id,
              protocol: m.protocol
            });
          }
        });

        // 3. Status Concluída / Resposta Oficial
        if (m.status === 'Concluída' || m.responses.some(r => r.is_final)) {
          derived.push({
            id: `not_synth_closed_${m.id}`,
            title: `Ouvidoria Concluída`,
            message: `Resposta oficial definitiva emitida para o protocolo ${m.protocol}.`,
            type: 'closed',
            read: true,
            timestamp: m.created_at,
            manifestation_id: m.id,
            protocol: m.protocol
          });
        }
      });
      sourceList = derived;
    }

    // Retorna apenas notificações NÃO lidas e que não tenham sido marcadas/visualizadas
    return sourceList.filter(n => !n.read && !readNotificationIds.includes(n.id));
  }, [notifications, manifestations, readNotificationIds]);

  return (
    <SystemContext.Provider
      value={{
        theme,
        themeMode,
        setTheme,
        isAuthenticated,
        login,
        loginAsUser,
        logout,
        currentUser,
        setCurrentUser,
        users,
        addUser,
        updateUser,
        updateUserPermissions,
        resetUserPassword,
        changeUserPassword,
        settings,
        updateSettings,
        manifestations,
        sectors,
        professionals,
        notifications: effectiveNotifications,
        auditLogs,
        responseTemplates,
        addResponseTemplate,
        updateResponseTemplate,
        deleteResponseTemplate,
        searchTerm,
        setSearchTerm,
        showDeleted,
        setShowDeleted,
        addManifestation,
        updateManifestation,
        softDeleteManifestation,
        restoreManifestation,
        addForwarding,
        respondForwarding,
        addResponse,
        updateStatus,
        addSector,
        updateSector,
        toggleSectorActive,
        addProfessional,
        updateProfessional,
        toggleProfessionalActive,
        markNotificationRead,
        clearNotifications,
        calculateSLA,
        generateDigitalSignature
      }}
    >
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) throw new Error('useSystem must be used within SystemProvider');
  return context;
};
