import React, { useState } from 'react';
import { KeyRound, ShieldAlert, CheckCircle2, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useSystem } from '../context/SystemContext';

export const ChangePasswordModal: React.FC = () => {
  const { currentUser, changeUserPassword } = useSystem();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword.trim()) {
      setError('Por favor, informe a nova senha.');
      return;
    }

    if (newPassword.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (newPassword === '12345678') {
      setError('A nova senha não pode ser igual à senha padrão inicial (12345678).');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('A confirmação da senha não confere com a nova senha digitada.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      changeUserPassword(currentUser.id, newPassword);
      setIsSubmitting(false);
      setSuccess(true);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Top Header Badge */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
              Primeiro Acesso / Troca Obrigatória
            </span>
            <h2 className="text-xl font-black text-white tracking-tight pt-1">
              Altere sua Senha Inicial
            </h2>
            <p className="text-xs text-slate-400">
              Olá, <strong className="text-slate-200">{currentUser.name}</strong>. Por normas de segurança do sistema UPA 24h, você deve cadastrar uma nova senha pessoal para continuar.
            </p>
          </div>
        </div>

        {/* Security Warning Box */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-400">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>Regras para a Nova Senha:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-400 pl-1">
            <li>Mínimo de 6 caracteres</li>
            <li>Diferente da senha padrão inicial (12345678)</li>
            <li>Recomendado misturar letras e números</li>
          </ul>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="text-sm font-bold text-emerald-200">Senha alterada com sucesso!</div>
            <p className="text-xs text-emerald-300/80">Redirecionando para o painel de atendimento...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Nova Senha */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Nova Senha <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Digite sua nova senha"
                  className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
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

            {/* Confirmar Nova Senha */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Confirmar Nova Senha <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Salvando nova senha...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Salvar Nova Senha & Acessar Sistema</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
