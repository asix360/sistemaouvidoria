import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Check, X, Plus, UserPlus, Building2, Edit2, Search, CheckSquare, KeyRound, RotateCcw, Lock } from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { useToast } from '../context/ToastContext';
import { UserProfile, UserPermissions, Role } from '../types';
import { INITIAL_USERS } from '../data/initialSeed';

export const UsersPermissionsView: React.FC = () => {
  const { users, addUser, updateUser, updateUserPermissions, resetUserPassword, sectors, currentUser } = useSystem();
  const { notifyError } = useToast();
  const [selectedUser, setSelectedUser] = useState<UserProfile>(() => {
    return users.find(u => u.id === currentUser?.id) || users[0] || INITIAL_USERS[0];
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Auto sync selectedUser when users or currentUser changes
  React.useEffect(() => {
    if (users && users.length > 0) {
      const match = users.find(u => u.id === selectedUser?.id) || users.find(u => u.id === currentUser?.id) || users[0];
      if (match) setSelectedUser(match);
    }
  }, [users, currentUser?.id]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    cpf: string;
    role: Role;
    selectedSectorIds: string[];
    active: boolean;
  }>({
    name: '',
    email: '',
    cpf: '',
    role: 'Coordenador',
    selectedSectorIds: [],
    active: true
  });

  const [toastMsg, setToastMsg] = useState('');

  const operationalPermissionsList: { key: keyof UserPermissions; label: string }[] = [
    { key: 'visualizar', label: 'Visualizar Manifestações' },
    { key: 'cadastrar', label: 'Cadastrar Nova Manifestação' },
    { key: 'editar', label: 'Editar Manifestação' },
    { key: 'excluir', label: 'Ocultar / Soft Delete' },
    { key: 'responder', label: 'Emitir Respostas / Parecer' },
    { key: 'encaminhar', label: 'Encaminhar para Setores' },
    { key: 'encerrar', label: 'Encerrar Processo' },
    { key: 'reabrir', label: 'Reabrir Manifestação' },
    { key: 'emitir_relatorios', label: 'Emitir Relatórios e Rankings' },
    { key: 'gerenciar_usuarios', label: 'Gerenciar Usuários e Níveis' },
    { key: 'configuracoes', label: 'Alterar Configurações da UPA' }
  ];

  const modulePermissionsList: { key: keyof UserPermissions; label: string; description: string }[] = [
    { key: 'modulo_dashboard', label: 'Módulo Dashboard / Visão Geral', description: 'Painel geral com indicadores e estatísticas' },
    { key: 'modulo_nova_manifestacao', label: 'Módulo Nova Manifestação', description: 'Abertura rápida de ouvidoria presencial' },
    { key: 'modulo_manifestacoes', label: 'Módulo Consulta de Manifestações', description: 'Listagem geral de atendimentos e filtros' },
    { key: 'modulo_resposta_oficial', label: 'Módulo Direito de Resposta (Ouvidoria)', description: 'Emissão da resposta oficial ao cidadão' },
    { key: 'modulo_parecer_setor', label: 'Módulo Parecer Técnico do Setor', description: 'Parecer do setor e notificações do coordenador' },
    { key: 'modulo_controle_sla', label: 'Módulo Controle de Prazos SLA', description: 'Monitoramento do semáforo de vencimento' },
    { key: 'modulo_tramitacao_setores', label: 'Módulo Tramitação & Setores', description: 'Encaminhamentos e prazos entre departamentos' },
    { key: 'modulo_modelos_resposta', label: 'Módulo Modelos de Resposta', description: 'Templates institucionais padronizados' },
    { key: 'modulo_gestao_setores', label: 'Módulo Setores UPA', description: 'Cadastro e ativação de setores hospitalares' },
    { key: 'modulo_gestao_equipe', label: 'Módulo Equipe & Profissionais', description: 'Cadastro de médicos, enfermeiros e equipe' },
    { key: 'modulo_relatorios', label: 'Módulo Relatórios & Rankings', description: 'Exportação de relatórios gerenciais e relatórios PDF' },
    { key: 'modulo_usuarios_niveis', label: 'Módulo Usuários & Níveis', description: 'Gestão de permissões e perfis de acesso' },
    { key: 'modulo_logs_auditoria', label: 'Módulo Logs de Auditoria', description: 'Trilha de auditoria e rastreabilidade' },
    { key: 'modulo_configuracoes', label: 'Módulo Configurações UPA', description: 'Parâmetros institucionais e rotina de backup' }
  ];

  const getDefaultPermissionsForRole = (role: Role): UserPermissions => {
    const baseAllModules = {
      modulo_dashboard: true,
      modulo_nova_manifestacao: true,
      modulo_manifestacoes: true,
      modulo_resposta_oficial: true,
      modulo_parecer_setor: true,
      modulo_controle_sla: true,
      modulo_tramitacao_setores: true,
      modulo_modelos_resposta: true,
      modulo_gestao_setores: true,
      modulo_gestao_equipe: true,
      modulo_relatorios: true,
      modulo_usuarios_niveis: true,
      modulo_logs_auditoria: true,
      modulo_configuracoes: true
    };

    switch (role) {
      case 'Administrador':
        return {
          ...baseAllModules,
          visualizar: true, cadastrar: true, editar: true, excluir: true,
          responder: true, encaminhar: true, encerrar: true, reabrir: true,
          emitir_relatorios: true, gerenciar_usuarios: true, configuracoes: true
        };
      case 'Ouvidor':
        return {
          ...baseAllModules,
          visualizar: true, cadastrar: true, editar: true, excluir: false,
          responder: true, encaminhar: true, encerrar: true, reabrir: true,
          emitir_relatorios: true, gerenciar_usuarios: false, configuracoes: false
        };
      case 'Diretor':
      case 'Coordenador':
      case 'Supervisor':
        return {
          ...baseAllModules,
          visualizar: true, cadastrar: true, editar: true, excluir: false,
          responder: true, encaminhar: true, encerrar: false, reabrir: false,
          emitir_relatorios: true, gerenciar_usuarios: false, configuracoes: false
        };
      case 'Consulta':
      default:
        return {
          ...baseAllModules,
          visualizar: true, cadastrar: false, editar: false, excluir: false,
          responder: false, encaminhar: false, encerrar: false, reabrir: false,
          emitir_relatorios: true, gerenciar_usuarios: false, configuracoes: false
        };
    }
  };

  const handleOpenNewUserModal = () => {
    setEditingUserId(null);
    setFormData({
      name: '',
      email: '',
      cpf: '',
      role: 'Coordenador',
      selectedSectorIds: [],
      active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditUserModal = (userToEdit: UserProfile) => {
    setEditingUserId(userToEdit.id);

    // Get current sector IDs array
    const sectorIds = userToEdit.sector_ids && userToEdit.sector_ids.length > 0
      ? userToEdit.sector_ids
      : userToEdit.sector_id
      ? [userToEdit.sector_id]
      : [];

    setFormData({
      name: userToEdit.name,
      email: userToEdit.email,
      cpf: userToEdit.cpf,
      role: userToEdit.role,
      selectedSectorIds: sectorIds,
      active: userToEdit.active
    });
    setIsModalOpen(true);
  };

  const handleResetPassword = (userToReset: UserProfile) => {
    if (window.confirm(`Deseja realmente resetar a senha de "${userToReset.name}" para a senha inicial '12345678'?\n\nNo próximo login, o usuário será obrigado a criar uma nova senha.`)) {
      resetUserPassword(userToReset.id);
      setToastMsg(`Senha de "${userToReset.name}" resetada para '12345678' com sucesso! (Primeiro Acesso Solicitado)`);
      setTimeout(() => setToastMsg(''), 4000);
    }
  };

  const toggleSectorSelection = (secId: string) => {
    setFormData(prev => {
      const exists = prev.selectedSectorIds.includes(secId);
      const updated = exists
        ? prev.selectedSectorIds.filter(id => id !== secId)
        : [...prev.selectedSectorIds, secId];
      return { ...prev, selectedSectorIds: updated };
    });
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    // Map sector names
    const assignedSectorObjs = sectors.filter(s => formData.selectedSectorIds.includes(s.id));
    const sectorNames = assignedSectorObjs.map(s => s.name);
    const primarySectorId = formData.selectedSectorIds[0] || undefined;
    const primarySectorName = sectorNames[0] || undefined;

    if (editingUserId) {
      // Update existing
      updateUser(editingUserId, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        cpf: formData.cpf.trim(),
        role: formData.role,
        sector_id: primarySectorId,
        sector_name: primarySectorName,
        sector_ids: formData.selectedSectorIds,
        sector_names: sectorNames,
        active: formData.active
      });

      // Update local state if selected
      if (selectedUser.id === editingUserId) {
        setSelectedUser(prev => ({
          ...prev,
          name: formData.name.trim(),
          email: formData.email.trim(),
          cpf: formData.cpf.trim(),
          role: formData.role,
          sector_id: primarySectorId,
          sector_name: primarySectorName,
          sector_ids: formData.selectedSectorIds,
          sector_names: sectorNames,
          active: formData.active
        }));
      }

      setToastMsg(`Usuário ${formData.name} atualizado com sucesso!`);
    } else {
      // Create new
      const defaultPerms = getDefaultPermissionsForRole(formData.role);
      const newUserObj: Omit<UserProfile, 'id'> = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        cpf: formData.cpf.trim(),
        role: formData.role,
        sector_id: primarySectorId,
        sector_name: primarySectorName,
        sector_ids: formData.selectedSectorIds,
        sector_names: sectorNames,
        active: formData.active,
        avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        permissions: defaultPerms
      };

      addUser(newUserObj);
      setToastMsg(`Novo usuário ${formData.name} cadastrado com sucesso!`);
    }

    setIsModalOpen(false);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const computeCoherentPermissions = (
    currentPerms: UserPermissions,
    toggledKey: keyof UserPermissions
  ): UserPermissions => {
    const newValue = !currentPerms[toggledKey];
    const updated: UserPermissions = {
      ...currentPerms,
      [toggledKey]: newValue
    };

    if (!newValue) {
      // --- DESATIVANDO (TURNING OFF) ---
      if (toggledKey === 'visualizar' || toggledKey === 'modulo_manifestacoes') {
        updated.visualizar = false;
        updated.modulo_manifestacoes = false;
        updated.editar = false;
        updated.excluir = false;
        updated.responder = false;
        updated.encaminhar = false;
        updated.encerrar = false;
        updated.reabrir = false;
        updated.modulo_resposta_oficial = false;
        updated.modulo_parecer_setor = false;
        updated.modulo_tramitacao_setores = false;
        updated.modulo_controle_sla = false;
      }

      if (toggledKey === 'cadastrar') {
        updated.modulo_nova_manifestacao = false;
      }
      if (toggledKey === 'modulo_nova_manifestacao') {
        updated.cadastrar = false;
      }

      if (toggledKey === 'responder') {
        updated.modulo_resposta_oficial = false;
        updated.modulo_parecer_setor = false;
      }
      if (toggledKey === 'modulo_resposta_oficial') {
        if (!updated.modulo_parecer_setor) {
          updated.responder = false;
        }
      }
      if (toggledKey === 'modulo_parecer_setor') {
        if (!updated.modulo_resposta_oficial) {
          updated.responder = false;
        }
      }

      if (toggledKey === 'encaminhar') {
        updated.modulo_tramitacao_setores = false;
      }
      if (toggledKey === 'modulo_tramitacao_setores') {
        updated.encaminhar = false;
      }

      if (toggledKey === 'emitir_relatorios') {
        updated.modulo_relatorios = false;
      }
      if (toggledKey === 'modulo_relatorios') {
        updated.emitir_relatorios = false;
      }

      if (toggledKey === 'gerenciar_usuarios') {
        updated.modulo_usuarios_niveis = false;
      }
      if (toggledKey === 'modulo_usuarios_niveis') {
        updated.gerenciar_usuarios = false;
      }

      if (toggledKey === 'configuracoes') {
        updated.modulo_configuracoes = false;
      }
      if (toggledKey === 'modulo_configuracoes') {
        updated.configuracoes = false;
      }
    } else {
      // --- ATIVANDO (TURNING ON) ---
      const viewDependents: (keyof UserPermissions)[] = [
        'editar',
        'excluir',
        'responder',
        'encaminhar',
        'encerrar',
        'reabrir',
        'modulo_manifestacoes',
        'modulo_resposta_oficial',
        'modulo_parecer_setor',
        'modulo_tramitacao_setores',
        'modulo_controle_sla'
      ];
      if (viewDependents.includes(toggledKey)) {
        updated.visualizar = true;
        updated.modulo_manifestacoes = true;
      }

      if (toggledKey === 'cadastrar') {
        updated.modulo_nova_manifestacao = true;
      }
      if (toggledKey === 'modulo_nova_manifestacao') {
        updated.cadastrar = true;
      }

      if (toggledKey === 'responder') {
        updated.modulo_resposta_oficial = true;
        updated.visualizar = true;
        updated.modulo_manifestacoes = true;
      }
      if (toggledKey === 'modulo_resposta_oficial') {
        updated.responder = true;
        updated.visualizar = true;
        updated.modulo_manifestacoes = true;
      }
      if (toggledKey === 'modulo_parecer_setor') {
        updated.responder = true;
        updated.visualizar = true;
        updated.modulo_manifestacoes = true;
      }

      if (toggledKey === 'encaminhar') {
        updated.modulo_tramitacao_setores = true;
        updated.visualizar = true;
        updated.modulo_manifestacoes = true;
      }
      if (toggledKey === 'modulo_tramitacao_setores') {
        updated.encaminhar = true;
        updated.visualizar = true;
        updated.modulo_manifestacoes = true;
      }

      if (toggledKey === 'emitir_relatorios') {
        updated.modulo_relatorios = true;
      }
      if (toggledKey === 'modulo_relatorios') {
        updated.emitir_relatorios = true;
      }

      if (toggledKey === 'gerenciar_usuarios') {
        updated.modulo_usuarios_niveis = true;
      }
      if (toggledKey === 'modulo_usuarios_niveis') {
        updated.gerenciar_usuarios = true;
      }

      if (toggledKey === 'configuracoes') {
        updated.modulo_configuracoes = true;
      }
      if (toggledKey === 'modulo_configuracoes') {
        updated.configuracoes = true;
      }
    }

    return updated;
  };

  const handleTogglePerm = (key: keyof UserPermissions) => {
    if (selectedUser.id === currentUser.id) {
      notifyError('Ação Bloqueada por Segurança', ['Você não pode alterar as próprias permissões de acesso da conta autenticada no momento.']);
      return;
    }
    const updated = computeCoherentPermissions(selectedUser.permissions, key);
    updateUserPermissions(selectedUser.id, updated);
    setSelectedUser(prev => ({ ...prev, permissions: updated }));
  };

  const handleResetRoleDefaults = () => {
    if (selectedUser.id === currentUser.id) {
      notifyError('Ação Bloqueada por Segurança', ['Você não pode alterar as próprias permissões de acesso da conta autenticada no momento.']);
      return;
    }
    const defaultPerms = getDefaultPermissionsForRole(selectedUser.role);
    updateUserPermissions(selectedUser.id, defaultPerms);
    setSelectedUser(prev => ({ ...prev, permissions: defaultPerms }));
    setToastMsg(`Permissões restauradas para o padrão do perfil "${selectedUser.role}".`);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleEnableAll = () => {
    if (selectedUser.id === currentUser.id) {
      notifyError('Ação Bloqueada por Segurança', ['Você não pode alterar as próprias permissões de acesso da conta autenticada no momento.']);
      return;
    }
    const allPerms: UserPermissions = {
      visualizar: true, cadastrar: true, editar: true, excluir: true,
      responder: true, encaminhar: true, encerrar: true, reabrir: true,
      emitir_relatorios: true, gerenciar_usuarios: true, configuracoes: true,
      modulo_dashboard: true, modulo_nova_manifestacao: true, modulo_manifestacoes: true,
      modulo_resposta_oficial: true, modulo_parecer_setor: true, modulo_controle_sla: true,
      modulo_tramitacao_setores: true, modulo_modelos_resposta: true, modulo_gestao_setores: true,
      modulo_gestao_equipe: true, modulo_relatorios: true, modulo_usuarios_niveis: true,
      modulo_logs_auditoria: true, modulo_configuracoes: true
    };
    updateUserPermissions(selectedUser.id, allPerms);
    setSelectedUser(prev => ({ ...prev, permissions: allPerms }));
    setToastMsg('Todas as permissões foram ativadas com sucesso.');
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleDisableAll = () => {
    if (selectedUser.id === currentUser.id) {
      notifyError('Ação Bloqueada por Segurança', ['Você não pode alterar as próprias permissões de acesso da conta autenticada no momento.']);
      return;
    }
    const nonePerms: UserPermissions = {
      visualizar: false, cadastrar: false, editar: false, excluir: false,
      responder: false, encaminhar: false, encerrar: false, reabrir: false,
      emitir_relatorios: false, gerenciar_usuarios: false, configuracoes: false,
      modulo_dashboard: false, modulo_nova_manifestacao: false, modulo_manifestacoes: false,
      modulo_resposta_oficial: false, modulo_parecer_setor: false, modulo_controle_sla: false,
      modulo_tramitacao_setores: false, modulo_modelos_resposta: false, modulo_gestao_setores: false,
      modulo_gestao_equipe: false, modulo_relatorios: false, modulo_usuarios_niveis: false,
      modulo_logs_auditoria: false, modulo_configuracoes: false
    };
    updateUserPermissions(selectedUser.id, nonePerms);
    setSelectedUser(prev => ({ ...prev, permissions: nonePerms }));
    setToastMsg('Todas as permissões foram desativadas.');
    setTimeout(() => setToastMsg(''), 4000);
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.sector_names && u.sector_names.some(sn => sn.toLowerCase().includes(searchTerm.toLowerCase()))) ||
    (u.sector_name && u.sector_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-sky-600" /> Cadastro de Usuários & Matriz de Permissões
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gestão completa de usuários, atribuição de setores (coordenadores e supervisores) e controle de permissões
          </p>
        </div>

        <button
          onClick={handleOpenNewUserModal}
          className="px-4 py-2.5 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Novo Usuário</span>
        </button>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500 text-white text-xs font-bold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg('')}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User List Column */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Usuários Cadastrados ({users.length})
            </h2>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, e-mail ou setor..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto custom-scrollbar pr-1">
            {filteredUsers.map(u => {
              const isSelected = u.id === selectedUser.id;
              const sectorList = u.sector_names && u.sector_names.length > 0
                ? u.sector_names
                : u.sector_name
                ? [u.sector_name]
                : [];

              return (
                <div
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-100 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{u.name}</span>
                        {!u.active && (
                          <span className="px-1.5 py-0.2 bg-red-100 text-red-700 text-[9px] font-bold rounded">Inativo</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{u.email}</div>
                      
                      <div className="flex items-center gap-1 flex-wrap pt-0.5">
                        <span className="px-2 py-0.5 bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 rounded-md text-[10px] font-bold">
                          {u.role}
                        </span>

                        {sectorList.map((sn, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-[10px] font-semibold flex items-center gap-1">
                            <Building2 className="w-2.5 h-2.5 text-slate-400" />
                            <span>{sn}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResetPassword(u);
                        }}
                        className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-all"
                        title="Resetar Senha para 12345678 (Exigir 1º acesso)"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditUserModal(u);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        title="Editar Usuário & Setores"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Permissions Matrix Column */}
        <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedUser.name}
                </h2>
                <span className="px-2.5 py-0.5 bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 rounded-lg text-xs font-bold">
                  {selectedUser.role}
                </span>
                {selectedUser.must_change_password && (
                  <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-md text-[10px] font-bold flex items-center gap-1 border border-amber-300/40">
                    <KeyRound className="w-3 h-3" />
                    <span>Primeiro Acesso Pendente</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                CPF: {selectedUser.cpf || 'Não informado'} • E-mail: {selectedUser.email}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleResetPassword(selectedUser)}
                className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                title="Resetar senha deste usuário para 12345678"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                <span>Resetar Senha</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenEditUserModal(selectedUser)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Edit2 className="w-3.5 h-3.5 text-sky-600" />
                <span>Editar Perfil</span>
              </button>
            </div>
          </div>

          {/* Assigned Sectors Highlight Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-sky-600" />
              Setores UPA Sob Responsabilidade ({selectedUser.sector_names?.length || (selectedUser.sector_name ? 1 : 0)})
            </span>

            <div className="flex flex-wrap items-center gap-2">
              {(selectedUser.sector_names && selectedUser.sector_names.length > 0) ? (
                selectedUser.sector_names.map((sn, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-sky-100 dark:bg-sky-950 text-sky-900 dark:text-sky-200 border border-sky-300 dark:border-sky-800 rounded-lg text-xs font-bold flex items-center gap-1.5">
                    <Building2 className="w-3 h-3 text-sky-600" />
                    <span>{sn}</span>
                  </span>
                ))
              ) : selectedUser.sector_name ? (
                <span className="px-2.5 py-1 bg-sky-100 dark:bg-sky-950 text-sky-900 dark:text-sky-200 border border-sky-300 dark:border-sky-800 rounded-lg text-xs font-bold flex items-center gap-1.5">
                  <Building2 className="w-3 h-3 text-sky-600" />
                  <span>{selectedUser.sector_name}</span>
                </span>
              ) : (
                <span className="text-xs text-slate-400 italic">Nenhum setor específico vinculado (Acesso Institucional Geral/Ouvidoria).</span>
              )}
            </div>
          </div>

          {/* Permissions Switcher */}
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-xs">
                <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  <strong>Ações:</strong> <span className="font-bold text-emerald-600 dark:text-emerald-400">{operationalPermissionsList.filter(i => selectedUser.permissions[i.key]).length}/11 Ativas</span>
                  <span className="mx-2">•</span>
                  <strong>Módulos:</strong> <span className="font-bold text-sky-600 dark:text-sky-400">{modulePermissionsList.filter(i => selectedUser.permissions[i.key] !== false).length}/14 Ativos</span>
                </span>
              </div>

              {selectedUser.id !== currentUser.id && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={handleResetRoleDefaults}
                    className="px-2.5 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 dark:bg-sky-950 dark:hover:bg-sky-900 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 text-[11px] font-bold transition-all"
                    title={`Restaurar permissões padrão do perfil ${selectedUser.role}`}
                  >
                    Restaurar Padrão ({selectedUser.role})
                  </button>

                  <button
                    type="button"
                    onClick={handleEnableAll}
                    className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[11px] font-bold transition-all"
                  >
                    Ativar Todos
                  </button>

                  <button
                    type="button"
                    onClick={handleDisableAll}
                    className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-[11px] font-bold transition-all"
                  >
                    Desativar Todos
                  </button>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 text-sky-900 dark:text-sky-200 text-xs font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
              <span>
                <strong>Sincronização Inteligente:</strong> As Ações e os Módulos são vinculados bidirecionalmente. Desativar um item pai ou dependente desativa automaticamente os recursos associados para manter a governança.
              </span>
            </div>

            {selectedUser.id === currentUser.id && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Você está visualizando seu próprio usuário. Por razões de governança e segurança do sistema, a alteração das próprias permissões de acesso é bloqueada.</span>
              </div>
            )}

            {/* Operational Actions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Ações Operacionais no Sistema
                </h3>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  {operationalPermissionsList.filter(i => selectedUser.permissions[i.key]).length} de 11 ativas
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {operationalPermissionsList.map(item => {
                  const hasPerm = selectedUser.permissions[item.key];
                  const isSelf = selectedUser.id === currentUser.id;
                  return (
                    <button
                      key={item.key}
                      disabled={isSelf}
                      onClick={() => handleTogglePerm(item.key)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelf ? 'cursor-not-allowed opacity-60' : ''
                      } ${
                        hasPerm
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                          : 'bg-slate-50/60 dark:bg-slate-900/30 border-slate-200 dark:border-slate-700 text-slate-400'
                      }`}
                    >
                      <span className="text-xs font-semibold">{item.label}</span>
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center text-white ${
                        hasPerm ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}>
                        {hasPerm ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Granular Module Access */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-black text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                  Direitos de Acesso Granulares aos Módulos (Navegação & Notificações)
                </h3>
                <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 shrink-0 ml-2">
                  {modulePermissionsList.filter(i => selectedUser.permissions[i.key] !== false).length} de 14 ativos
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                Se um módulo for desativado para o usuário, ele não verá o menu correspondente nem receberá notificações associadas a esse módulo.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {modulePermissionsList.map(item => {
                  const hasPerm = selectedUser.permissions[item.key] !== false;
                  const isSelf = selectedUser.id === currentUser.id;
                  return (
                    <button
                      key={item.key}
                      disabled={isSelf}
                      onClick={() => handleTogglePerm(item.key)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelf ? 'cursor-not-allowed opacity-60' : ''
                      } ${
                        hasPerm
                          ? 'bg-sky-50/60 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200'
                          : 'bg-slate-50/60 dark:bg-slate-900/30 border-slate-200 dark:border-slate-700 text-slate-400 opacity-60'
                      }`}
                    >
                      <div className="pr-2">
                        <span className="text-xs font-bold block">{item.label}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{item.description}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center text-white shrink-0 ${
                        hasPerm ? 'bg-sky-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}>
                        {hasPerm ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-sky-600" />
                  <span>{editingUserId ? 'Editar Usuário e Atribuição de Setores' : 'Cadastrar Novo Usuário no Sistema'}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Defina os dados pessoais, perfil profissional e os setores sob coordenação do usuário
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Enf. Juliana Paes"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    E-mail Institucional <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="juliana.enfermagem@upa.sp.gov.br"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* CPF */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    CPF / Registro
                  </label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={e => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.111.222-33"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Cargo / Perfil de Acesso <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as Role })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
                  >
                    <option value="Coordenador">Coordenador (Gestão de Setor)</option>
                    <option value="Supervisor">Supervisor de Unidade</option>
                    <option value="Ouvidor">Ouvidor do Sistema</option>
                    <option value="Diretor">Diretor de Unidade UPA</option>
                    <option value="Administrador">Administrador Geral</option>
                    <option value="Consulta">Perfil de Consulta Apenas</option>
                  </select>
                </div>
              </div>

              {/* SECTORS MULTI-SELECTION SECTION */}
              <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-extrabold text-sky-900 dark:text-sky-100 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-sky-600" />
                      Atribuição de Setores ({formData.selectedSectorIds.length} Selecionados)
                    </label>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                      Selecione um ou <strong>múltiplos setores</strong> aos quais este usuário terá acesso para receber notificações e emitir pareceres técnicos.
                    </p>
                  </div>

                  {formData.selectedSectorIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, selectedSectorIds: [] })}
                      className="text-[10px] font-bold text-red-600 hover:underline"
                    >
                      Limpar Setores
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                  {sectors.map(sec => {
                    const isChecked = formData.selectedSectorIds.includes(sec.id);
                    return (
                      <button
                        type="button"
                        key={sec.id}
                        onClick={() => toggleSectorSelection(sec.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isChecked
                            ? 'bg-sky-600 text-white border-sky-700 shadow-2xs font-bold'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="text-xs truncate">{sec.name} ({sec.code})</div>
                          <div className={`text-[10px] truncate ${isChecked ? 'text-sky-100' : 'text-slate-400'}`}>
                            Resp: {sec.responsible_name}
                          </div>
                        </div>

                        <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-white text-sky-700' : 'border border-slate-300 dark:border-slate-600'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status active */}
              <div className="flex items-center gap-2 pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={e => setFormData({ ...formData, active: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Usuário Ativo no Sistema
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingUserId ? 'Salvar Alterações' : 'Confirmar Cadastro'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
