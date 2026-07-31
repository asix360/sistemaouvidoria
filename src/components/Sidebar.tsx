import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Clock,
  Send,
  Building2,
  Users,
  BarChart3,
  ShieldCheck,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  HeartHandshake,
  LogOut,
  MessageSquare,
  MessageSquareReply,
  BookmarkCheck
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { UpaLogo } from './UpaLogo';
import { UserProfile } from '../types';

export type ActiveTab = 
  | 'dashboard'
  | 'nova'
  | 'lista'
  | 'respostas'
  | 'resposta_setor'
  | 'sla'
  | 'tramitacao'
  | 'modelos'
  | 'setores'
  | 'profissionais'
  | 'relatorios'
  | 'usuarios'
  | 'auditoria'
  | 'configuracoes';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}

export const isTabAllowed = (tab: ActiveTab, user: UserProfile): boolean => {
  if (!user || !user.permissions) return true;
  const p = user.permissions;

  switch (tab) {
    case 'dashboard':
      return p.modulo_dashboard !== false && p.visualizar !== false;
    case 'nova':
      return p.modulo_nova_manifestacao !== false && p.cadastrar !== false;
    case 'manifestacoes':
    case 'lista':
      return p.modulo_manifestacoes !== false && p.visualizar !== false;
    case 'respostas':
      return p.modulo_resposta_oficial !== false && (p.responder !== false || p.visualizar !== false);
    case 'resposta_setor':
      return p.modulo_parecer_setor !== false;
    case 'sla':
      return p.modulo_controle_sla !== false;
    case 'tramitacao':
      return p.modulo_tramitacao_setores !== false;
    case 'modelos':
      return p.modulo_modelos_resposta !== false;
    case 'setores':
      return p.modulo_gestao_setores !== false;
    case 'profissionais':
      return p.modulo_gestao_equipe !== false;
    case 'relatorios':
      return p.modulo_relatorios !== false && p.emitir_relatorios !== false;
    case 'usuarios':
      return p.modulo_usuarios_niveis !== false && p.gerenciar_usuarios !== false;
    case 'auditoria':
      return p.modulo_logs_auditoria !== false;
    case 'configuracoes':
      return p.modulo_configuracoes !== false && p.configuracoes !== false;
    default:
      return true;
  }
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed
}) => {
  const { currentUser, settings, logout } = useSystem();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      show: isTabAllowed('dashboard', currentUser)
    },
    {
      id: 'nova',
      label: 'Nova Manifestação',
      icon: PlusCircle,
      badge: 'Atendimento',
      show: isTabAllowed('nova', currentUser)
    },
    {
      id: 'lista',
      label: 'Manifestações',
      icon: FileText,
      show: isTabAllowed('lista', currentUser)
    },
    {
      id: 'respostas',
      label: 'Direito de Resposta',
      icon: MessageSquare,
      badge: 'Ouvidoria',
      show: isTabAllowed('respostas', currentUser)
    },
    {
      id: 'resposta_setor',
      label: 'Resposta do Setor',
      icon: MessageSquareReply,
      badge: 'Coordenador',
      show: isTabAllowed('resposta_setor', currentUser)
    },
    {
      id: 'sla',
      label: 'Controle de SLA',
      icon: Clock,
      show: isTabAllowed('sla', currentUser)
    },
    {
      id: 'tramitacao',
      label: 'Tramitação & Setores',
      icon: Send,
      show: isTabAllowed('tramitacao', currentUser)
    },
    {
      id: 'modelos',
      label: 'Modelos de Resposta',
      icon: BookmarkCheck,
      badge: 'UPA',
      show: isTabAllowed('modelos', currentUser)
    },
    {
      id: 'setores',
      label: 'Setores UPA',
      icon: Building2,
      show: isTabAllowed('setores', currentUser)
    },
    {
      id: 'profissionais',
      label: 'Equipe & Profissionais',
      icon: Users,
      show: isTabAllowed('profissionais', currentUser)
    },
    {
      id: 'relatorios',
      label: 'Relatórios & Rankings',
      icon: BarChart3,
      show: isTabAllowed('relatorios', currentUser)
    },
    {
      id: 'usuarios',
      label: 'Usuários & Níveis',
      icon: ShieldCheck,
      show: isTabAllowed('usuarios', currentUser)
    },
    {
      id: 'auditoria',
      label: 'Logs de Auditoria',
      icon: History,
      show: isTabAllowed('auditoria', currentUser)
    },
    {
      id: 'configuracoes',
      label: 'Configurações UPA',
      icon: Settings,
      show: isTabAllowed('configuracoes', currentUser)
    }
  ];

  return (
    <aside
      className={`relative flex flex-col border-r transition-all duration-300 z-20 select-none ${
        collapsed ? 'w-20' : 'w-64'
      } bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <UpaLogo size="sm" showSubtitle={false} className="shrink-0" />
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-slate-900 dark:text-white text-xs leading-tight truncate">
                Ouvidoria UPA
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                {settings.unit_code || 'Unidade 24h'}
              </span>
            </div>
          )}
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {menuItems
          .filter(item => item.show)
          .map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all group ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20 dark:bg-sky-500 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform ${
                    isActive ? 'scale-110' : 'group-hover:scale-105'
                  }`}
                />
                {!collapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
      </nav>

      {/* User Footer Profile Summary */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative shrink-0">
            <img
              src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-sky-500/30"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
          </div>

          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {currentUser.name}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {currentUser.role}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={logout}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
          title="Sair do Sistema"
        >
          <LogOut className="w-4.5 h-4.5" />
        </button>
      </div>
    </aside>
  );
};
