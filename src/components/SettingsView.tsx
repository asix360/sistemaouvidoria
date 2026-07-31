import React, { useState } from 'react';
import { Settings, Building2, Phone, Mail, User, Clock, CheckCircle2, Globe, MessageSquare, ShieldCheck } from 'lucide-react';
import { useSystem } from '../context/SystemContext';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings } = useSystem();

  const [upaName, setUpaName] = useState(settings.upa_name);
  const [unitCode, setUnitCode] = useState(settings.unit_code);
  const [logoUrl, setLogoUrl] = useState(settings.logo_url);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [directorName, setDirectorName] = useState(settings.director_name);
  const [coordinatorName, setCoordinatorName] = useState(settings.ombudsman_coordinator);
  const [operatingHours, setOperatingHours] = useState(settings.operating_hours || 'Atendimento 24 Horas — Todos os dias (segunda a domingo, inclusive feriados)');
  const [welcomeMessage, setWelcomeMessage] = useState(settings.welcome_message || 'Sua manifestação nos ajuda a aprimorar o acolhimento, triagem de emergência, atendimento médico e enfermagem do nosso Pronto Socorro.');
  const [defaultSla, setDefaultSla] = useState(settings.default_sla_days);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ...settings,
      upa_name: upaName,
      unit_code: unitCode,
      logo_url: logoUrl,
      phone,
      email,
      address,
      director_name: directorName,
      ombudsman_coordinator: coordinatorName,
      operating_hours: operatingHours,
      welcome_message: welcomeMessage,
      default_sla_days: Number(defaultSla)
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto pb-16">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-sky-600" /> Configurações Institucionais da UPA
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Parâmetros gerais da unidade de saúde que são refletidos no Portal do Cidadão e no Módulo Restrito
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2 text-emerald-800 dark:text-emerald-200 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Configurações salvas e aplicadas em todo o sistema com sucesso!
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
        
        {/* Identificação da Unidade */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-sky-600" />
            Identificação da Unidade de Saúde
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">Nome Oficial da UPA 24h *</label>
              <input
                type="text"
                required
                value={upaName}
                onChange={e => setUpaName(e.target.value)}
                className="w-full text-xs rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">Código da Unidade (CNES/SUS) *</label>
              <input
                type="text"
                required
                value={unitCode}
                onChange={e => setUnitCode(e.target.value)}
                className="w-full text-xs rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">Telefone da Ouvidoria / Recepção</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full text-xs rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">E-mail Institucional Oficial</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full text-xs rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">Prazo SLA Padrão (Dias Úteis)</label>
              <input
                type="number"
                value={defaultSla}
                onChange={e => setDefaultSla(Number(e.target.value))}
                className="w-full text-xs rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">Endereço Completo da UPA</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full text-xs rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Portal do Cidadão - Informações Públicas */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-emerald-600" />
            Textos do Portal do Cidadão (Página Pública)
          </h2>

          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">Horário de Funcionamento Exibido ao Cidadão</label>
            <input
              type="text"
              value={operatingHours}
              onChange={e => setOperatingHours(e.target.value)}
              className="w-full text-xs rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              placeholder="Ex: Atendimento 24 Horas — Todos os dias"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">Mensagem de Boas-Vindas do Portal Público</label>
            <textarea
              rows={3}
              value={welcomeMessage}
              onChange={e => setWelcomeMessage(e.target.value)}
              className="w-full text-xs rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              placeholder="Descreva a mensagem exibida na página inicial do cidadão..."
            />
          </div>
        </div>

        {/* Gestão e Coordenação Técnica */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2 flex items-center gap-1.5">
            <User className="w-4 h-4 text-sky-600" />
            Gestão e Coordenação Técnica
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">Diretor Técnico / Clínico Responsável</label>
              <input
                type="text"
                value={directorName}
                onChange={e => setDirectorName(e.target.value)}
                className="w-full text-xs rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">Ouvidor Geral / Coordenador</label>
              <input
                type="text"
                value={coordinatorName}
                onChange={e => setCoordinatorName(e.target.value)}
                className="w-full text-xs rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Rotina de Backup do Banco de Dados PostgreSQL */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Rotina de Backup & Segurança do Banco PostgreSQL
          </h2>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Todos os dados do sistema (manifestações, usuários, setores e auditoria) são gravados de forma permanente no banco de dados <strong>PostgreSQL 16</strong>. Você pode fazer o download de uma cópia de segurança completa (Backup JSON) a qualquer momento.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="/api/backup/export"
                download
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-2"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Exportar Backup Completo (JSON)</span>
              </a>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Salvar & Aplicar Configurações</span>
          </button>
        </div>
      </form>
    </div>
  );
};
