import React, { useState, lazy, Suspense } from 'react';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { SystemProvider, useSystem } from './context/SystemContext';
import { Sidebar, ActiveTab, isTabAllowed } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { ManifestationListView } from './components/ManifestationListView';
import { Manifestation } from './types';
import { ToastProvider } from './context/ToastContext';

// Code-splitting de visões pesadas com React.lazy
const CitizenPortalView = lazy(() => import('./components/CitizenPortalView').then(m => ({ default: m.CitizenPortalView })));
const OfficialResponsesView = lazy(() => import('./components/OfficialResponsesView').then(m => ({ default: m.OfficialResponsesView })));
const SectorResponseView = lazy(() => import('./components/SectorResponseView').then(m => ({ default: m.SectorResponseView })));
const NewManifestationModalView = lazy(() => import('./components/NewManifestationModalView').then(m => ({ default: m.NewManifestationModalView })));
const SLAControlView = lazy(() => import('./components/SLAControlView').then(m => ({ default: m.SLAControlView })));
const TramitacaoView = lazy(() => import('./components/TramitacaoView').then(m => ({ default: m.TramitacaoView })));
const SectorsManagementView = lazy(() => import('./components/SectorsManagementView').then(m => ({ default: m.SectorsManagementView })));
const ProfessionalsManagementView = lazy(() => import('./components/ProfessionalsManagementView').then(m => ({ default: m.ProfessionalsManagementView })));
const ReportsView = lazy(() => import('./components/ReportsView').then(m => ({ default: m.ReportsView })));
const UsersPermissionsView = lazy(() => import('./components/UsersPermissionsView').then(m => ({ default: m.UsersPermissionsView })));
const AuditLogView = lazy(() => import('./components/AuditLogView').then(m => ({ default: m.AuditLogView })));
const SettingsView = lazy(() => import('./components/SettingsView').then(m => ({ default: m.SettingsView })));
const ResponseTemplatesView = lazy(() => import('./components/ResponseTemplatesView').then(m => ({ default: m.ResponseTemplatesView })));
const ManifestationDetailModal = lazy(() => import('./components/ManifestationDetailModal').then(m => ({ default: m.ManifestationDetailModal })));
const ChangePasswordModal = lazy(() => import('./components/ChangePasswordModal').then(m => ({ default: m.ChangePasswordModal })));

const ViewLoadingFallback = () => (
  <div className="h-full w-full flex flex-col items-center justify-center p-12 space-y-4">
    <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-sky-600 dark:text-sky-400 animate-pulse">
      <Loader2 className="w-6 h-6 animate-spin" />
    </div>
    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Carregando módulo UPA...</p>
  </div>
);

const MainAppContent: React.FC = () => {
  const { isAuthenticated, currentUser, manifestations } = useSystem();
  
  // Navegação por Path Limpo para 2 Módulos: Público (/cidadao) vs Restrito (/servidor)
  const [viewMode, setViewModeState] = useState<'citizen' | 'admin'>(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return path.includes('/servidor') || path.includes('/admin') || hash.includes('servidor') || hash.includes('admin')
      ? 'admin'
      : 'citizen';
  });

  const setViewMode = (mode: 'citizen' | 'admin') => {
    setViewModeState(mode);
    const targetPath = mode === 'admin' ? '/servidor' : '/cidadao';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  };

  React.useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('/servidor') || path.includes('/admin') || hash.includes('servidor') || hash.includes('admin')) {
        setViewModeState('admin');
      } else {
        setViewModeState('citizen');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedManifestation, setSelectedManifestation] = useState<Manifestation | null>(null);

  // 1. Página Pública do Cidadão (/cidadao)
  if (viewMode === 'citizen') {
    return (
      <Suspense fallback={<ViewLoadingFallback />}>
        <CitizenPortalView
          onGoToAdminLogin={() => setViewMode('admin')}
        />
      </Suspense>
    );
  }

  // 2. Página Restrita do Funcionário - Não Autenticado (/servidor)
  if (!isAuthenticated) {
    return (
      <LoginView
        onBackToCitizen={() => setViewMode('citizen')}
      />
    );
  }

  // 3. Admin View Mode - Authenticated Internal System
  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden font-sans relative">
      {/* First Access / Reset Mandatory Password Change Modal */}
      {currentUser?.must_change_password && (
        <Suspense fallback={null}>
          <ChangePasswordModal />
        </Suspense>
      )}
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Header Bar */}
        <Header
          setActiveTab={setActiveTab}
          onOpenCitizenPortal={() => setViewMode('citizen')}
          onToggleMobileMenu={() => setMobileOpen(prev => !prev)}
        />

        {/* Dynamic Workspace Area with Strict Module Route Guard */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {!isTabAllowed(activeTab, currentUser) ? (
            <div className="h-full flex items-center justify-center p-8">
              <div className="max-w-md w-full p-8 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 rounded-3xl shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-red-500/20">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">Acesso Bloqueado ao Módulo</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Seu perfil de usuário não possui permissão de acesso ao módulo <strong className="text-slate-700 dark:text-slate-200 uppercase">{activeTab}</strong>.
                  </p>
                </div>
                <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl text-[11px] text-red-700 dark:text-red-300 font-semibold">
                  🔒 Este módulo foi desativado nas configurações do seu perfil de usuário.
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className="w-full py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold shadow-md hover:bg-slate-800 dark:hover:bg-white transition-all"
                >
                  Voltar ao Dashboard Principal
                </button>
              </div>
            </div>
          ) : (
            <Suspense fallback={<ViewLoadingFallback />}>
              {activeTab === 'dashboard' && (
                <DashboardView
                  setActiveTab={setActiveTab}
                  onSelectManifestation={m => setSelectedManifestation(m)}
                />
              )}

              {(activeTab === 'manifestacoes' || activeTab === 'lista') && (
                <ManifestationListView
                  setActiveTab={setActiveTab}
                  onSelectManifestation={m => setSelectedManifestation(m)}
                />
              )}

              {activeTab === 'respostas' && <OfficialResponsesView />}

              {activeTab === 'resposta_setor' && (
                <SectorResponseView
                  onSelectManifestation={m => setSelectedManifestation(m)}
                />
              )}

              {activeTab === 'nova' && (
                <NewManifestationModalView
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === 'sla' && (
                <SLAControlView
                  onSelectManifestation={m => setSelectedManifestation(m)}
                />
              )}

              {activeTab === 'tramitacao' && (
                <TramitacaoView
                  onSelectManifestation={m => setSelectedManifestation(m)}
                />
              )}

              {activeTab === 'setores' && (
                <SectorsManagementView
                  onGoToTramitacao={() => setActiveTab('tramitacao')}
                />
              )}

              {activeTab === 'profissionais' && <ProfessionalsManagementView />}

              {activeTab === 'relatorios' && <ReportsView />}

              {activeTab === 'usuarios' && <UsersPermissionsView />}

              {activeTab === 'auditoria' && <AuditLogView />}

              {activeTab === 'modelos' && <ResponseTemplatesView />}

              {activeTab === 'configuracoes' && <SettingsView />}
            </Suspense>
          )}
        </main>
      </div>

      {/* Manifestation Detail & Workflow Modal */}
      {selectedManifestation && (
        <Suspense fallback={null}>
          <ManifestationDetailModal
            manifestation={
              manifestations.find(m => m.id === selectedManifestation.id) || selectedManifestation
            }
            onClose={() => setSelectedManifestation(null)}
          />
        </Suspense>
      )}
    </div>
  );
};

export function App() {
  return (
    <ToastProvider>
      <SystemProvider>
        <MainAppContent />
      </SystemProvider>
    </ToastProvider>
  );
}

export default App;

