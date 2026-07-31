import React, { useState } from 'react';
import { UserCheck, KeyRound, CheckCircle2, AlertCircle, X, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { useToast } from '../context/ToastContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUser, changeUserPassword } = useSystem();
  const { notifyError, notifySuccess } = useToast();

  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [cpf, setCpf] = useState(currentUser.cpf || '');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-sync form when modal opens or currentUser changes
  React.useEffect(() => {
    if (isOpen && currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setCpf(currentUser.cpf || '');
      setError('');
      setSuccess('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const valErrors: string[] = [];
    if (!name.trim()) valErrors.push('Informe seu nome completo.');
    if (!email.trim() || !email.includes('@')) valErrors.push('Informe um e-mail institucional válido.');

    if (newPassword.trim().length > 0) {
      if (newPassword.length < 6) valErrors.push('A nova senha deve ter no mínimo 6 caracteres.');
      if (newPassword === '12345678') valErrors.push('A nova senha não pode ser a senha padrão inicial (12345678).');
      if (newPassword !== confirmPassword) valErrors.push('A confirmação de senha não confere com a nova senha digitada.');
    }

    if (valErrors.length > 0) {
      setError(valErrors[0]);
      notifyError('Pendência na Atualização do Perfil', valErrors);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // 1. Update basic profile info
      updateUser(currentUser.id, {
        name,
        email,
        cpf
      });

      // 2. Update password if filled
      if (newPassword.trim().length >= 6) {
        changeUserPassword(currentUser.id, newPassword);
      }

      setIsSubmitting(false);
      setSuccess('Perfil e dados de segurança atualizados com sucesso no PostgreSQL!');
      notifySuccess('Perfil Atualizado com Sucesso!', 'Seus dados cadastrais e senha foram salvos.');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 1200);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 text-slate-100 relative animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Badge */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">
              Meu Perfil & Configurações de Acesso
            </h2>
            <p className="text-xs text-slate-400">
              Altere seus dados pessoais e atualize sua senha de acesso a qualquer momento.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section: Informações Pessoais */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> Dados Cadastrais
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">E-mail Institucional</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="seu.email@upa.saude.gov.br"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">CPF</label>
                <input
                  type="text"
                  value={cpf}
                  onChange={e => setCpf(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Perfil / Função</label>
                <div className="w-full text-xs p-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-emerald-400 font-bold">
                  {currentUser.role}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Alterar Senha */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" /> Alterar Senha de Acesso (Opcional)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nova Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full text-xs p-2.5 pr-8 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Confirmar Nova Senha</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Salvando...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
