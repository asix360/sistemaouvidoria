import React, { useState } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Search,
  CheckCircle2,
  Trash2,
  UserCheck,
  Building,
  Activity,
  LogOut,
  Settings
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { ActiveTab } from './Sidebar';
import { UpaLogo } from './UpaLogo';
import { UserProfileModal } from './UserProfileModal';

interface HeaderProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCitizenPortal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ setActiveTab, onOpenCitizenPortal }) => {
  const {
    theme,
    setTheme,
    currentUser,
    logout,
    settings,
    notifications,
    markNotificationRead,
    clearNotifications,
    searchTerm,
    setSearchTerm
  } = useSystem();

  const [showNotifications, setShowNotifications] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Filtrar notificações relevantes respeitando papéis, setores e permissões granulares de módulo
  const userNotifications = notifications.filter(n => {
    const perms = currentUser.permissions;

    // 1. Se o módulo específico estiver desativado nas permissões do usuário, ocultar notificação
    if (n.type === 'new' && perms?.modulo_manifestacoes === false && perms?.modulo_nova_manifestacao === false) return false;
    if (n.type === 'answered' && perms?.modulo_parecer_setor === false && perms?.modulo_resposta_oficial === false) return false;
    if (n.type === 'sla_warning' && perms?.modulo_controle_sla === false) return false;
    if (n.type === 'sla_overdue' && perms?.modulo_controle_sla === false) return false;
    if (n.type === 'closed' && perms?.modulo_resposta_oficial === false) return false;

    // 2. Administrador Geral ou Ouvidor recebem notificações globais dos módulos autorizados
    if (currentUser.role === 'Administrador' || currentUser.role === 'Ouvidor') return true;

    // 3. Coordenadores e Médicos/Enfermeiros: filtrar notificações dirigidas ao seu setor de responsabilidade
    if (currentUser.sector_name) {
      return n.title.toLowerCase().includes(currentUser.sector_name.toLowerCase()) ||
             n.message.toLowerCase().includes(currentUser.sector_name.toLowerCase());
    }

    return true;
  });

  const unreadCount = userNotifications.filter(n => !n.read).length;

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Search & Unit Title */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {/* UPA 24h Official Logo Badge */}
        <UpaLogo size="sm" showSubtitle={false} className="shrink-0" />

        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value.trim().length > 0) {
                setActiveTab('lista');
              }
            }}
            placeholder="Pesquisar por nº protocolo, CPF, nome, setor ou palavra-chave..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2.5">
        {/* Unit Status Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
          <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
          <span className="truncate max-w-[200px]">{settings.upa_name}</span>
        </div>

        {/* Current Logged In User Info Badge (Clickable to Edit Profile & Password) */}
        <button
          onClick={() => setIsProfileModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-500/80 hover:bg-slate-100 dark:hover:bg-slate-750 transition-all cursor-pointer group"
          title="Clique para editar seu perfil e alterar senha"
        >
          <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {currentUser.name}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
              {currentUser.role}
            </span>
          </div>
          <Settings className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
        </button>

        {/* Notifications Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Notificações Internas por Responsabilidade"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-sky-600" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Notificações ({userNotifications.length})
                  </span>
                </div>
                {userNotifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-[11px] text-slate-400 hover:text-rose-500 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Limpar
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
                {userNotifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Nenhuma notificação para seu perfil no momento.
                  </div>
                ) : (
                  userNotifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.protocol) {
                          setSearchTerm(n.protocol);
                          setActiveTab('lista');
                        }
                        setShowNotifications(false);
                      }}
                      className={`p-3 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors ${
                        !n.read ? 'bg-sky-50/50 dark:bg-sky-950/20' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold ${
                          n.type === 'sla_overdue' ? 'text-rose-600 dark:text-rose-400' :
                          n.type === 'sla_warning' ? 'text-amber-600 dark:text-amber-400' : 'text-sky-600 dark:text-sky-400'
                        }`}>
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Alternar Tema Claro / Escuro"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
        </button>

        {/* Logout / Sair Button */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/80 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors text-xs font-bold"
          title="Encerrar Sessão e Voltar à Tela de Login"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
};
