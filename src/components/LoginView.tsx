import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  AlertCircle,
  Activity,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  Stethoscope,
  Building2,
  BadgeCheck,
  HelpCircle
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { UpaLogo } from './UpaLogo';

interface LoginViewProps {
  onBackToCitizen?: () => void;
}

import { useToast } from '../context/ToastContext';

export const LoginView: React.FC<LoginViewProps> = ({ onBackToCitizen }) => {
  const { login, loginAsUser, users, settings } = useSystem();
  const { notifyError, notifySuccess } = useToast();

  // Login Form State
  const [email, setEmail] = useState('admin.ouvidoria@upa.sp.gov.br');
  const [password, setPassword] = useState('12345678');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordMsg, setForgotPasswordMsg] = useState(false);

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!email.trim() || !password.trim()) {
      const msg = 'Por favor, informe seu e-mail/matrícula e senha de acesso.';
      setLoginError(msg);
      notifyError('Validação de Login', [msg]);
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const success = login(email, password);
      setIsLoading(false);
      if (!success) {
        const msg = 'Credenciais inválidas. Verifique o e-mail/matrícula e a senha digitada.';
        setLoginError(msg);
        notifyError('Falha na Autenticação', [msg]);
      } else {
        notifySuccess('Acesso Autorizado', 'Sessão iniciada no Sistema de Ouvidoria UPA.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-emerald-600 selection:text-white">
      {/* Background Decorative UPA Healthcare Lights */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-3">
          <UpaLogo size="md" showSubtitle={false} className="shrink-0" />
          <div className="h-8 w-px bg-slate-800 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">Ouvidoria UPA 24h</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                Módulo Restrito
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {settings.upa_name || 'Unidade de Pronto Atendimento 24h'}
            </p>
          </div>
        </div>

        {/* Back to Citizen Portal Button */}
        {onBackToCitizen && (
          <button
            type="button"
            onClick={onBackToCitizen}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 text-xs font-extrabold border border-slate-700 hover:border-emerald-500/50 transition-all flex items-center gap-2 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Portal Público do Cidadão</span>
          </button>
        )}
      </header>

      {/* Main Login Workspace */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-10 max-w-5xl mx-auto w-full">
        
        <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          
          {/* Header Badge & Title */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-blue-700 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/20 border border-emerald-400/30">
              <Lock className="w-6 h-6" />
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight">
              Área Restrita do Servidor
            </h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Acesso exclusivo para Ouvidores, Gestores, Médicos e Enfermeiros cadastrados na UPA 24h.
            </p>
          </div>

          {/* Login Error Notification */}
          {loginError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Forgot password info banner */}
          {forgotPasswordMsg && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5">
              <HelpCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Para redefinir sua senha institucional, solicite o suporte do Depto. de TI da UPA ou use o Acesso Rápido abaixo.</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {/* Email / Matrícula */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                E-mail Institucional ou Matrícula SUS <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ouvidor@upa.sus.gov.br"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 block">
                  Senha de Acesso <span className="text-emerald-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setForgotPasswordMsg(!forgotPasswordMsg)}
                  className="text-[11px] text-emerald-400 hover:underline font-semibold"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-800 text-emerald-600 focus:ring-emerald-500 bg-slate-950"
                />
                <span className="text-xs text-slate-400">Lembrar minhas credenciais neste computador</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-emerald-700 to-blue-700 hover:from-emerald-500 hover:to-blue-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verificando Autenticação...</span>
                </>
              ) : (
                <>
                  <span>Autenticar & Entrar no Módulo UPA</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-emerald-400">UPA 24h</span>
          <span>• Sistema Interno de Ouvidoria & Atendimento Médico</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Portaria MS nº 2.048/02</span>
          <span>•</span>
          <span>Segurança SSL / Criptografia 256-bit</span>
        </div>
      </footer>
    </div>
  );
};
