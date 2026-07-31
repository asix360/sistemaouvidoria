import React, { useState } from 'react';
import {
  HeartHandshake,
  Search,
  FilePlus,
  FileText,
  CheckCircle2,
  Copy,
  Clock,
  User,
  Building,
  UserX,
  Stethoscope,
  Send,
  Calendar,
  AlertTriangle,
  Check,
  ShieldCheck,
  Activity,
  Award,
  BookOpen,
  Lock,
  ArrowRight,
  AlertCircle,
  Syringe,
  PhoneCall,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { useToast } from '../context/ToastContext';
import { Manifestation, ManifestationType, Priority } from '../types';
import { UpaLogo } from './UpaLogo';

interface CitizenPortalViewProps {
  onGoToAdminLogin: () => void;
}

export const CitizenPortalView: React.FC<CitizenPortalViewProps> = ({ onGoToAdminLogin }) => {
  const {
    settings,
    sectors,
    manifestations,
    addManifestation
  } = useSystem();

  // Citizen Navigation Tabs
  const [activeTab, setActiveTab] = useState<'nova_ouvidoria' | 'consultar_protocolo' | 'guia_cidadao'>('nova_ouvidoria');

  // --- 1. NEW MANIFESTATION FORM STATE ---
  const [manType, setManType] = useState<ManifestationType>('Reclamação');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [complainantName, setComplainantName] = useState('');
  const [complainantCpf, setComplainantCpf] = useState('');
  const [complainantSus, setComplainantSus] = useState('');
  const [complainantPhone, setComplainantPhone] = useState('');
  const [complainantEmail, setComplainantEmail] = useState('');
  const [complainantNeighborhood, setComplainantNeighborhood] = useState('');
  const [selectedSectorId, setSelectedSectorId] = useState(sectors[0]?.id || '');
  const [priority, setPriority] = useState<Priority>('Média');
  const [description, setDescription] = useState('');
  const [patientType, setPatientType] = useState<'Paciente' | 'Acompanhante' | 'Familiar' | 'Outro'>('Paciente');
  const [professionalCited, setProfessionalCited] = useState('');

  // Submission result state
  const [createdProtocol, setCreatedProtocol] = useState<Manifestation | null>(null);
  const [copiedProtocol, setCopiedProtocol] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 2. CONSULT PROTOCOL STATE ---
  const [searchProtocolInput, setSearchProtocolInput] = useState('');
  const [searchedManifestation, setSearchedManifestation] = useState<Manifestation | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Filter out any non-UPA sectors if any existed
  const upaSectors = sectors.filter(s => !s.name.toLowerCase().includes('usf'));

  // Handle Form Submit
  const handleCreateManifestationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!isAnonymous && !complainantName.trim()) {
      setFormError('Por favor, informe seu nome completo ou selecione "Manifestação Anônima".');
      return;
    }

    if (!description.trim() || description.trim().length < 15) {
      setFormError('Sua mensagem deve ter pelo menos 15 caracteres para que possamos investigar o fato.');
      return;
    }

    const targetSector = upaSectors.find(s => s.id === selectedSectorId) || upaSectors[0];

    setIsSubmitting(true);

    setTimeout(() => {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const created_at_str = `${yyyy}-${mm}-${dd}`;
      const timeStr = today.toTimeString().substring(0, 5);

      const newM = addManifestation({
        type: manType,
        sector_id: targetSector ? targetSector.id : 'sec_1',
        sector_name: targetSector ? targetSector.name : 'Acolhimento & Triagem UPA',
        status: 'Registrada',
        priority: priority,
        channel: 'Web/Portal',
        origin: 'Portal Público do Cidadão',
        category: 'Atendimento Geral',
        subcategory: 'Atendimento Geral',
        is_anonymous: isAnonymous,
        complainant: {
          name: isAnonymous ? 'Manifestante Anônimo' : complainantName,
          cpf: isAnonymous ? '' : complainantCpf,
          sus_card: isAnonymous ? '' : complainantSus,
          phone: isAnonymous ? '' : complainantPhone,
          whatsapp: isAnonymous ? '' : complainantPhone,
          email: isAnonymous ? '' : complainantEmail,
          city: 'São Paulo',
          address: 'Não informado',
          neighborhood: complainantNeighborhood || 'Bairro Unidade',
          cep: '',
          gender: 'Não informado',
          birth_date: ''
        },
        occurrence: {
          date: created_at_str,
          time: timeStr,
          location: targetSector ? targetSector.name : 'Recepção / Triagem UPA 24h',
          shift: 'Tarde'
        },
        description: description,
        created_time: timeStr,
        patient_type: patientType,
        professional_cited: professionalCited || undefined,
        attachments: []
      });

      setIsSubmitting(false);
      setCreatedProtocol(newM);
    }, 500);
  };

  // Handle Search Protocol (Busca inteligente flexível a espaços, hífen e números)
  const handleSearchProtocolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const rawInput = searchProtocolInput.trim();
    if (!rawInput) {
      setSearchedManifestation(null);
      return;
    }

    const cleanInput = rawInput.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    // 1. Procurar no estado local em memória
    let match = manifestations.find(m => {
      const pClean = m.protocol.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      return (
        m.protocol.toUpperCase() === rawInput.toUpperCase() ||
        pClean === cleanInput ||
        (cleanInput.length >= 4 && pClean.endsWith(cleanInput)) ||
        (pClean.length >= 4 && cleanInput.endsWith(pClean))
      );
    });

    // 2. Se não encontrou na memória local, buscar na API PostgreSQL
    if (!match) {
      try {
        const apiService = (await import('../services/api')).apiService;
        const allManifestations = await apiService.getManifestations();
        if (Array.isArray(allManifestations)) {
          match = allManifestations.find(m => {
            const pClean = m.protocol.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            return (
              m.protocol.toUpperCase() === rawInput.toUpperCase() ||
              pClean === cleanInput ||
              (cleanInput.length >= 4 && pClean.endsWith(cleanInput)) ||
              (pClean.length >= 4 && cleanInput.endsWith(pClean))
            );
          });
        }
      } catch (err) {
        console.warn('Erro ao consultar API backend:', err);
      }
    }

    setSearchedManifestation(match || null);
  };

  // Copy Protocol Helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedProtocol(true);
    setTimeout(() => setCopiedProtocol(false), 2000);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between font-sans selection:bg-emerald-600 selection:text-white">
      
      {/* TOP HOSPITAL BRANDING BAR - UPA 24H COLORS (Green + Royal Blue + Emergency Red) */}
      <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
        {/* Top Emergency Strip */}
        <div className="bg-gradient-to-r from-emerald-700 via-blue-700 to-emerald-800 text-white py-1 px-4 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300"></span>
            </span>
            <span>SISTEMA PÚBLICO DE OUVIDORIA UPA 24H • CANAL DIRETO DO PACIENTE E CIDADÃO</span>
          </div>
        </div>

        {/* Main Header Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          {/* UPA 24h Authentic Logo */}
          <div className="flex items-center gap-4">
            <UpaLogo size="md" showSubtitle={true} />
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />
            <div className="hidden md:block">
              <span className="text-xs font-extrabold text-blue-700 dark:text-sky-400 uppercase tracking-wide block">
                {settings.upa_name || 'Unidade de Pronto Atendimento 24 Horas'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Ouvidoria de Urgência e Emergência Hospitalar
              </span>
            </div>
          </div>

          {/* UPA Contact & Unit Badge */}
          {(settings.phone?.trim() || settings.unit_code?.trim()) && (
            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              {settings.phone?.trim() && (
                <>
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-bold">{settings.phone}</span>
                </>
              )}
              {settings.phone?.trim() && settings.unit_code?.trim() && (
                <span className="text-slate-300 dark:text-slate-700">•</span>
              )}
              {settings.unit_code?.trim() && (
                <span className="font-medium hidden sm:inline">{settings.unit_code}</span>
              )}
            </div>
          )}
        </div>
      </header>

      {/* HERO SECTION - HOSPITAL & EMERGENCY UPA ATMOSPHERE */}
      <section className="bg-gradient-to-b from-emerald-50/80 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800 py-10 px-4 sm:px-6 relative overflow-hidden">
        {/* Background Decorative UPA Colors */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          
          {settings.operating_hours?.trim() && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-2xs">
              <Stethoscope className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{settings.operating_hours}</span>
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Ouvidoria da <span className="text-emerald-600 dark:text-emerald-400">{settings.upa_name || 'Unidade de Pronto Atendimento'}</span>
          </h1>

          {settings.welcome_message?.trim() && (
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
              {settings.welcome_message}
            </p>
          )}

          {/* UPA Core Pillar Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 text-xs">
            <div className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold shadow-2xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Garantia de Sigilo & LGPD</span>
            </div>
            {settings.operating_hours?.trim() && (
              <div className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold shadow-2xs flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>{settings.operating_hours}</span>
              </div>
            )}
            <div className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold shadow-2xs flex items-center gap-1.5">
              <UserX className="w-4 h-4 text-amber-600" />
              <span>Opção de Relato Anônimo</span>
            </div>
          </div>

        </div>
      </section>

      {/* MAIN PORTAL CONTENT WORKSPACE */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 space-y-8">

        {/* CITIZEN NAVIGATION BAR */}
        <div className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row gap-1.5 shadow-sm">
          <button
            type="button"
            onClick={() => {
              setActiveTab('nova_ouvidoria');
              setCreatedProtocol(null);
            }}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'nova_ouvidoria'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <FilePlus className="w-4 h-4" />
            <span>1. Abrir Nova Ouvidoria UPA</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('consultar_protocolo')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'consultar_protocolo'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>2. Acompanhar Protocolo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guia_cidadao')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'guia_cidadao'
                ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-emerald-300 border border-slate-700 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-500" />
            <span>3. Direitos do Paciente UPA</span>
          </button>
        </div>

        {/* TAB 1: FORMULARIO DE NOVA OUVIDORIA */}
        {activeTab === 'nova_ouvidoria' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
            
            {/* SUCCESS PROTOCOL GENERATED */}
            {createdProtocol ? (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div>
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200 uppercase tracking-widest border border-emerald-300 dark:border-emerald-700">
                      Ouvidoria Cadastrada com Sucesso!
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                      Comprovante de Registro UPA 24h
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-md mx-auto">
                      Sua manifestação foi enviada para a Ouvidoria Interna do Pronto Atendimento. Guarde seu número de protocolo para consultar o andamento.
                    </p>
                  </div>

                  {/* Protocol Highlight Box */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-lg mx-auto shadow-xs">
                    <div className="text-left">
                      <span className="text-[11px] uppercase font-bold text-slate-400 block">Número do Protocolo</span>
                      <span className="text-xl font-mono font-black text-blue-700 dark:text-sky-400 tracking-widest">
                        {createdProtocol.protocol}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(createdProtocol.protocol)}
                      className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-blue-700/20 shrink-0"
                    >
                      {copiedProtocol ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-300" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar Protocolo</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Protocol Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left text-xs text-slate-700 dark:text-slate-300 pt-3 border-t border-emerald-200 dark:border-emerald-900">
                    <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Tipo da Manifestação</span>
                      <strong className="text-slate-900 dark:text-slate-100 text-sm">{createdProtocol.type}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Setor Responsável</span>
                      <strong className="text-slate-900 dark:text-slate-100 text-sm">{createdProtocol.sector_name}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Prazo de Resposta (SLA)</span>
                      <strong className="text-emerald-700 dark:text-emerald-400 text-sm">{createdProtocol.sla.remaining_days} dias úteis</strong>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchProtocolInput(createdProtocol.protocol);
                      setSearchedManifestation(createdProtocol);
                      setHasSearched(true);
                      setActiveTab('consultar_protocolo');
                    }}
                    className="w-full py-3.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <Search className="w-4 h-4" />
                    <span>Acompanhar Este Protocolo Agora</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCreatedProtocol(null);
                      setDescription('');
                      setComplainantName('');
                      setComplainantCpf('');
                      setComplainantPhone('');
                      setComplainantEmail('');
                    }}
                    className="w-full py-3.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <FilePlus className="w-4 h-4" />
                    <span>Abrir Outra Manifestação</span>
                  </button>
                </div>
              </div>
            ) : (
              /* FORM ENTRY */
              <form onSubmit={handleCreateManifestationSubmit} className="space-y-6">
                
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <HeartHandshake className="w-5 h-5 text-emerald-600" />
                      Formulário Oficial de Ouvidoria UPA 24h
                    </h2>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-300 dark:border-emerald-800">
                      Atendimento Cidadão
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Relate detalhes do seu atendimento de emergência na UPA. Todas as manifestações passam por análise da gestão médica e administrativa.
                  </p>
                </div>

                {formError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* 1. SELEÇÃO DO TIPO DE MANIFESTAÇÃO */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    1. Escolha a classificação da sua mensagem <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {(['Reclamação', 'Elogio', 'Sugestão', 'Denúncia', 'Informação'] as ManifestationType[]).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setManType(t)}
                        className={`py-3 px-3 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center gap-1 ${
                          manType === t
                            ? t === 'Reclamação'
                              ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/20'
                              : t === 'Elogio'
                              ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                              : t === 'Denúncia'
                              ? 'bg-rose-700 text-white border-rose-600 shadow-md shadow-rose-700/20'
                              : 'bg-blue-700 text-white border-blue-600 shadow-md shadow-blue-700/20'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{t}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. MANIFESTAÇÃO ANÔNIMA TOGGLE */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserX className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Deseja enviar como Manifestação Anônima?</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={e => setIsAnonymous(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isAnonymous
                      ? 'Nenhum dado pessoal será registrado. Nota: sem e-mail/telefone, não poderemos enviar respostas diretamente para você.'
                      : 'Seus dados de identificação estarão protegidos sob absoluto sigilo nos termos da legislação do SUS e LGPD.'}
                  </p>
                </div>

                {/* 3. IDENTIFICAÇÃO DO CIDADÃO (SE NÃO FOR ANÔNIMO) */}
                {!isAnonymous && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                      Identificação do Cidadão / Paciente
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                          Nome Completo <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={complainantName}
                          onChange={e => setComplainantName(e.target.value)}
                          placeholder="Informe seu nome completo"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                          CPF ou Nº Cartão SUS
                        </label>
                        <input
                          type="text"
                          value={complainantCpf}
                          onChange={e => setComplainantCpf(e.target.value)}
                          placeholder="000.000.000-00"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                          Telefone / WhatsApp
                        </label>
                        <input
                          type="text"
                          value={complainantPhone}
                          onChange={e => setComplainantPhone(e.target.value)}
                          placeholder="(11) 90000-0000"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                          E-mail para Receber Notificações
                        </label>
                        <input
                          type="email"
                          value={complainantEmail}
                          onChange={e => setComplainantEmail(e.target.value)}
                          placeholder="seu.email@exemplo.com"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. SETOR E PERFIL NO ATENDIMENTO UPA */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      Setor da UPA Relacionado <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedSectorId}
                      onChange={e => setSelectedSectorId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {upaSectors.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      Vínculo do Manifestante
                    </label>
                    <select
                      value={patientType}
                      onChange={e => setPatientType(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Paciente">Paciente Atendido</option>
                      <option value="Acompanhante">Acompanhante</option>
                      <option value="Familiar">Familiar de Paciente</option>
                      <option value="Outro">Outro Cidadão</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      Profissional Citado (Opcional)
                    </label>
                    <input
                      type="text"
                      value={professionalCited}
                      onChange={e => setProfessionalCited(e.target.value)}
                      placeholder="Ex: Médico, Enfermeiro, Recepção..."
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* 5. DESCRIÇÃO DETALHADA */}
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    Relato Detalhado dos Fatos na UPA <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={5}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Descreva detalhadamente o ocorrido na UPA 24h: horário de chegada, recepção, classificação na Triagem de Manchester, tempo de espera para consulta médica, medicação, postura dos profissionais..."
                    className="w-full p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Mínimo 15 caracteres. Quanto mais preciso for o relato, mais rápida será a apuração pela ouvidoria.
                  </span>
                </div>

                {/* BOTÃO ENVIAR */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-4 bg-gradient-to-r from-emerald-600 via-emerald-700 to-blue-700 hover:from-emerald-500 hover:to-blue-600 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Registrando no Sistema da Ouvidoria UPA 24h...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Cadastrar Manifestação & Emitir Comprovante</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: CONSULTAR PROTOCOLO */}
        {activeTab === 'consultar_protocolo' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Search className="w-6 h-6 text-blue-600 dark:text-sky-400" />
                Consulta Pública de Protocolos UPA 24h
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Acompanhe as providências e despachos oficiais informando o número do seu protocolo (ex: OUV-2026-000101).
              </p>
            </div>

            <form onSubmit={handleSearchProtocolSubmit} className="space-y-3">
              <div className="relative">
                <FileText className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchProtocolInput}
                  onChange={e => setSearchProtocolInput(e.target.value)}
                  placeholder="DIGITE O SEU PROTOCOLO (EX: OUV-2026-000101)"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-mono text-slate-900 dark:text-white uppercase tracking-wider placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <Search className="w-4 h-4" />
                <span>Consultar Status</span>
              </button>
            </form>

            {/* CONSULTATION RESULTS */}
            {hasSearched && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                {searchedManifestation ? (
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-5">
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Protocolo Localizado</span>
                        <span className="text-xl font-mono font-black text-blue-700 dark:text-sky-400">
                          {searchedManifestation.protocol}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                          Status: {searchedManifestation.status}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          SLA Legal: {searchedManifestation.sla.status_label}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Tipo</span>
                        <strong>{searchedManifestation.type}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Setor UPA</span>
                        <strong>{searchedManifestation.sector_name}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Data do Registro</span>
                        <strong>{searchedManifestation.created_at} às {searchedManifestation.created_time}</strong>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">Teor da Manifestação</span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed">
                        "{searchedManifestation.description}"
                      </p>
                    </div>

                    {/* Official Responses */}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                      <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Despachos e Respostas Oficiais da Ouvidoria
                      </h3>

                      {searchedManifestation.responses.length > 0 ? (
                        <div className="space-y-2">
                          {searchedManifestation.responses.map((resp, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
                              <div className="flex justify-between text-[10px] text-emerald-700 dark:text-emerald-400 mb-1">
                                <strong>{resp.author_name} ({resp.author_role})</strong>
                                <span>{resp.created_at}</span>
                              </div>
                              <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">{resp.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 italic">
                          Sua manifestação foi recebida e encontra-se sob análise técnica pela equipe de Ouvidoria da UPA. Uma resposta formal será emitida dentro do prazo legal.
                        </div>
                      )}
                    </div>

                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                    <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Protocolo não Encontrado</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                      Verifique se digitou a numeração exatamente como no comprovante (exemplo: OUV-2026-000101).
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DIREITOS DO PACIENTE UPA */}
        {activeTab === 'guia_cidadao' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Direitos e Deveres do Paciente na UPA 24h</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Conheça os regulamentos do Ministério da Saúde para atendimento em Unidades de Pronto Atendimento
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-extrabold text-xs uppercase tracking-wider">
                  <Activity className="w-4 h-4" />
                  <span>1. Triagem & Classificação de Risco</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Na UPA 24h, os atendimentos não ocorrem por ordem de chegada, mas sim por prioridade médica (Protocolo de Manchester: Vermelho, Laranja, Amarelo, Verde, Azul).
                </p>
              </div>

              <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-blue-600 dark:text-sky-400 font-extrabold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>2. Direito a Acompanhante Legitimado</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Garantia por lei para idosos, gestantes, menores de 18 anos e pessoas com deficiência acompanhadas em salas de medicação e observação.
                </p>
              </div>

              <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
                  <Stethoscope className="w-4 h-4" />
                  <span>3. Identificação e Prontuário Médico</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  O paciente tem direito a saber o nome de todos os profissionais envolvidos no seu atendimento e receber cópia legível de boletim médico e receitas.
                </p>
              </div>

              <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider">
                  <Clock className="w-4 h-4" />
                  <span>4. Resposta Regulamentada pela Ouvidoria</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Todas as reclamações e solicitações dirigidas à Ouvidoria UPA 24h possuem prazo máximo estabelecido na Lei Federal nº 13.460/2017.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* CARD DINÂMICO DE INFORMAÇÕES INSTITUCIONAIS DA UPA */}
        {(settings.address?.trim() || settings.phone?.trim() || settings.email?.trim() || settings.unit_code?.trim() || settings.director_name?.trim() || settings.ombudsman_coordinator?.trim()) && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Building className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Dados de Contato & Localização da Unidade
              </h3>
            </div>

            {(settings.address?.trim() || settings.phone?.trim() || settings.email?.trim() || settings.unit_code?.trim()) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                {settings.address?.trim() && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block">Endereço da UPA:</span>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{settings.address}</p>
                  </div>
                )}

                {settings.phone?.trim() && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block">Telefone da Ouvidoria:</span>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{settings.phone}</p>
                  </div>
                )}

                {settings.email?.trim() && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block">E-mail Institucional:</span>
                    <p className="font-semibold text-slate-700 dark:text-slate-200 truncate">{settings.email}</p>
                  </div>
                )}

                {settings.unit_code?.trim() && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block">Código da Unidade:</span>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{settings.unit_code}</p>
                  </div>
                )}
              </div>
            )}

            {(settings.director_name?.trim() || settings.ombudsman_coordinator?.trim()) && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
                {settings.director_name?.trim() && (
                  <div>
                    <strong className="text-slate-700 dark:text-slate-300">Direção Técnica:</strong> {settings.director_name}
                  </div>
                )}
                {settings.ombudsman_coordinator?.trim() && (
                  <div>
                    <strong className="text-slate-700 dark:text-slate-300">Coordenação de Ouvidoria:</strong> {settings.ombudsman_coordinator}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">UPA 24h</span>
            <span>• Ouvidoria do Pronto Atendimento Público</span>
          </div>

          <div className="flex items-center gap-4">
            {settings.address?.trim() && (
              <>
                <span className="font-semibold text-slate-600 dark:text-slate-400">{settings.address}</span>
                <span>•</span>
              </>
            )}
            <span>SUS - Ministério da Saúde</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
