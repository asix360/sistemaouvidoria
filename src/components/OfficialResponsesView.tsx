import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Sparkles,
  FileText,
  User,
  Building2,
  Filter,
  Check,
  ShieldCheck,
  Printer,
  Calendar,
  ChevronRight,
  ArrowRight,
  HeartHandshake,
  HelpCircle,
  BadgeCheck,
  RotateCcw
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { useToast } from '../context/ToastContext';
import { Manifestation, ManifestationStatus } from '../types';
import { printManifestationProtocol } from '../utils/exportHelpers';

interface OfficialResponsesViewProps {
  onOpenAiAssistant?: (m: Manifestation) => void;
}

export const OfficialResponsesView: React.FC<OfficialResponsesViewProps> = ({ onOpenAiAssistant }) => {
  const {
    manifestations,
    currentUser,
    sectors,
    settings,
    responseTemplates,
    addResponse,
    addForwarding,
    respondForwarding,
    updateStatus,
    generateDigitalSignature
  } = useSystem();
  const { notifyError, notifySuccess } = useToast();

  // Filter Modes
  const [filterMode, setFilterMode] = useState<'pendentes' | 'todas' | 'respondidas' | 'concluidas'>('pendentes');
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');

  // Response Mode: 'official' (Final/Official to Citizen) or 'sector_opinion' (Technical opinion from sector)
  const [responseType, setResponseType] = useState<'official' | 'sector_opinion'>('official');

  // Selected manifestation to respond
  const [selectedM, setSelectedM] = useState<Manifestation | null>(null);

  // Response Form State
  const [responseText, setResponseText] = useState('');
  const [isFinalResponse, setIsFinalResponse] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [signedOfficer, setSignedOfficer] = useState(currentUser.name || 'Ouvidor Institucional UPA 24h');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Forwarding Modal State
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [fwdSectorId, setFwdSectorId] = useState('');
  const [fwdResponsible, setFwdResponsible] = useState('');
  const [fwdDeadline, setFwdDeadline] = useState('');
  const [fwdNotes, setFwdNotes] = useState('');

  // Helper to get active sector info for any manifestation
  const getActiveSectorInfo = (m: Manifestation) => {
    if (m.forwardings && m.forwardings.length > 0) {
      const lastFwd = m.forwardings[m.forwardings.length - 1];
      return {
        sector_id: lastFwd.sector_id,
        sector_name: lastFwd.sector_name,
        responsible: lastFwd.responsible_name,
        is_forwarded: true,
        last_fwd: lastFwd,
        status_label: lastFwd.status === 'Pendente' ? 'Aguardando Parecer do Setor' : 'Com Parecer do Setor'
      };
    }
    return {
      sector_id: m.sector_id,
      sector_name: m.sector_name || 'Ouvidoria Geral',
      responsible: 'Ouvidor Institucional UPA 24h',
      is_forwarded: false,
      status_label: 'Ouvidoria Geral (Inicial)'
    };
  };

  const handleOpenForwarding = () => {
    if (!selectedM) return;
    setFwdSectorId(sectors[0]?.id || '');
    setFwdResponsible(sectors[0]?.responsible_name || '');
    setFwdDeadline(selectedM.sla?.initial_deadline || new Date().toISOString().split('T')[0]);
    setFwdNotes('');
    setShowForwardModal(true);
  };

  const handleSendForwardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedM || !fwdSectorId) return;

    const targetSec = sectors.find(s => s.id === fwdSectorId);
    addForwarding(selectedM.id, {
      sector_id: fwdSectorId,
      sector_name: targetSec ? targetSec.name : 'Setor UPA',
      responsible_name: fwdResponsible || (targetSec ? targetSec.responsible_name : 'Responsável'),
      deadline: fwdDeadline,
      notes: fwdNotes
    });

    setShowForwardModal(false);
    setSuccessToast(`Manifestação ${selectedM.protocol} encaminhada com sucesso para o setor ${targetSec?.name || ''}!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  // Active Non-deleted manifestations
  const activeManifestations = useMemo(() => {
    return manifestations.filter(m => !m.deleted_at);
  }, [manifestations]);

  // Statistics
  const stats = useMemo(() => {
    const total = activeManifestations.length;
    const pending = activeManifestations.filter(m => m.status === 'Registrada' || m.status === 'Em Análise' || m.responses.length === 0).length;
    const answered = activeManifestations.filter(m => m.responses.length > 0).length;
    const completed = activeManifestations.filter(m => m.status === 'Concluída').length;
    const responseRate = total > 0 ? Math.round((answered / total) * 100) : 100;

    return { total, pending, answered, completed, responseRate };
  }, [activeManifestations]);

  // Filtered List
  const filteredList = useMemo(() => {
    return activeManifestations.filter(m => {
      // Filter tab
      if (filterMode === 'pendentes') {
        if (m.status === 'Concluída' && m.responses.length > 0) return false;
        if (m.responses.length > 0 && m.responses.some(r => r.is_final)) return false;
      } else if (filterMode === 'respondidas') {
        if (m.responses.length === 0) return false;
      } else if (filterMode === 'concluidas') {
        if (m.status !== 'Concluída') return false;
      }

      // Sector filter logic
      const secInfo = getActiveSectorInfo(m);
      if (sectorFilter === 'ouvidoria') {
        if (secInfo.is_forwarded && secInfo.sector_name !== 'Ouvidoria Geral') return false;
      } else if (sectorFilter === 'my_sector') {
        const userSecName = currentUser.sector_name || '';
        const userSecId = currentUser.sector_id || '';
        const matchesActive = (userSecId && secInfo.sector_id === userSecId) || (userSecName && secInfo.sector_name === userSecName);
        const matchesFwd = m.forwardings.some(f => (userSecId && f.sector_id === userSecId) || (userSecName && f.sector_name === userSecName));
        if (!matchesActive && !matchesFwd) return false;
      } else if (sectorFilter !== 'all') {
        const matchesActive = secInfo.sector_id === sectorFilter || secInfo.sector_name === sectorFilter;
        const matchesFwd = m.forwardings.some(f => f.sector_id === sectorFilter || f.sector_name === sectorFilter);
        const matchesOriginal = m.sector_id === sectorFilter || m.sector_name === sectorFilter;
        if (!matchesActive && !matchesFwd && !matchesOriginal) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesProtocol = m.protocol.toLowerCase().includes(q);
        const matchesComplainant = m.complainant.name.toLowerCase().includes(q);
        const matchesDesc = m.description.toLowerCase().includes(q);
        const matchesSector = m.sector_name.toLowerCase().includes(q) || secInfo.sector_name.toLowerCase().includes(q);
        return matchesProtocol || matchesComplainant || matchesDesc || matchesSector;
      }

      return true;
    });
  }, [activeManifestations, filterMode, sectorFilter, searchQuery, currentUser]);

  // Handle Apply Template
  const handleApplyTemplate = (tplId: string) => {
    setSelectedTemplateId(tplId);
    if (!tplId || !selectedM) return;

    const tpl = responseTemplates.find(t => t.id === tplId);
    if (!tpl) return;

    let filled = tpl.content
      .replace(/\[NOME_MANIFESTANTE\]/g, selectedM.is_anonymous ? 'Prezado(a) Cidadão(ã)' : selectedM.complainant.name)
      .replace(/\[PROTOCOLO\]/g, selectedM.protocol)
      .replace(/\[NOME_SETOR\]/g, selectedM.sector_name)
      .replace(/\[DATA_OCORRENCIA\]/g, selectedM.occurrence?.date || selectedM.created_at)
      .replace(/\[NOME_UNIDADE\]/g, settings.upa_name || 'UPA 24h');

    setResponseText(filled);
  };

  // Submit Response or Sector Opinion
  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedM) return;

    if (!responseText.trim()) {
      notifyError('Validação de Resposta', ['O texto da resposta oficial / parecer técnico não pode estar em branco.']);
      return;
    }

    if (responseText.trim().length < 10) {
      notifyError('Validação de Resposta', [`A resposta deve conter pelo menos 10 caracteres explicativos (atual: ${responseText.trim().length}).`]);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const activeInfo = getActiveSectorInfo(selectedM);

      if (responseType === 'sector_opinion') {
        if (activeInfo.last_fwd) {
          respondForwarding(
            selectedM.id,
            activeInfo.last_fwd.id,
            `${responseText.trim()}\n\n---\nParecer Técnico emitido por: ${signedOfficer} (${activeInfo.sector_name})`,
            'Respondido'
          );
        } else {
          // Fallback if not forwarded yet
          addResponse(selectedM.id, {
            content: `[PARECER TÉCNICO - ${activeInfo.sector_name}]\n${responseText.trim()}\n\n---\nEmitido por: ${signedOfficer}`,
            is_final: false,
            status_after: 'Em análise'
          });
        }
        const msg = `Parecer técnico do setor ${activeInfo.sector_name} registrado com sucesso no protocolo ${selectedM.protocol}!`;
        setSuccessToast(msg);
        notifySuccess('Parecer Registrado!', msg);
      } else {
        // Official Response to Citizen
        addResponse(selectedM.id, {
          content: `${responseText.trim()}\n\n---\nAssinado digitalmente por: ${signedOfficer} (${currentUser.role || 'Ouvidoria Institucional UPA 24h'})`,
          is_final: isFinalResponse,
          status_after: isFinalResponse ? 'Concluída' : 'Respondida'
        });
        const msg = `Resposta oficial registrada com sucesso para o protocolo ${selectedM.protocol}!`;
        setSuccessToast(msg);
        notifySuccess('Resposta Oficial Publicada!', msg);
      }

      setIsSubmitting(false);
      setResponseText('');
      
      // Auto close toast after 4s
      setTimeout(() => setSuccessToast(''), 4000);
    }, 400);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-20">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-300 dark:border-emerald-800">
              Direito de Resposta Institucional
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Módulo de Respostas da Ouvidoria UPA 24h
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Garantia do direito de resposta e contraditório institucional para as manifestações registradas pelos cidadãos.
          </p>
        </div>

        {/* Quick Stats Banner */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-right">
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-extrabold uppercase block">Taxa de Resposta</span>
            <span className="text-xl font-black text-emerald-800 dark:text-emerald-300">{stats.responseRate}%</span>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-right">
            <span className="text-[10px] text-blue-700 dark:text-sky-400 font-extrabold uppercase block">Pendentes de Resposta</span>
            <span className="text-xl font-black text-blue-800 dark:text-sky-300">{stats.pending}</span>
          </div>
        </div>
      </div>

      {/* SUCCESS TOAST NOTIFICATION */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast('')}
            className="text-white hover:text-emerald-200 text-xs font-bold px-2 py-1 rounded-lg bg-emerald-700"
          >
            Fechar
          </button>
        </div>
      )}

      {/* FLUXO DE RESPOSTA INDIRETA BANNER */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900/90 via-sky-900/90 to-slate-900 text-white shadow-md border border-emerald-500/30 space-y-2">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Fluxo de Atendimento Indireto do Paciente (Ouvidoria como Ponte Única)</span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed">
          O paciente <strong>nunca recebe resposta direta do profissional de saúde ou setor</strong>. Toda manifestação aberta é direcionada ao <strong>Ouvidor do Sistema</strong>, que notifica o Coordenador/Diretor responsável pelo setor. Assim que o Coordenador envia o Parecer Técnico Interno, o Ouvidor é notificado e consolida a <strong>Resposta Oficial Institucional</strong> ao cidadão.
        </p>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] font-bold text-emerald-200 pt-1 border-t border-white/10">
          <span className="flex items-center gap-1">📥 1. Entrada na Ouvidoria ➔</span>
          <span className="flex items-center gap-1">🔔 2. Notificação ao Coordenador ➔</span>
          <span className="flex items-center gap-1">📝 3. Parecer Técnico Interno ➔</span>
          <span className="flex items-center gap-1 text-emerald-300">✉️ 4. Resposta Oficial pelo Ouvidor</span>
        </div>
      </div>

      {/* FILTER CARDS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setFilterMode('pendentes')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
            filterMode === 'pendentes'
              ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider block">Aguardando Resposta</span>
            <Clock className={`w-4 h-4 ${filterMode === 'pendentes' ? 'text-white' : 'text-amber-500'}`} />
          </div>
          <span className="text-2xl font-black mt-2 block">{stats.pending}</span>
          <span className="text-[10px] opacity-80 block">Exigem resposta institucional</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterMode('todas')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            filterMode === 'todas'
              ? 'bg-blue-600 text-white border-blue-700 shadow-md shadow-blue-600/20'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider block">Total Geral</span>
            <FileText className={`w-4 h-4 ${filterMode === 'todas' ? 'text-white' : 'text-blue-500'}`} />
          </div>
          <span className="text-2xl font-black mt-2 block">{stats.total}</span>
          <span className="text-[10px] opacity-80 block">Todas as ouvidorias</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterMode('respondidas')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            filterMode === 'respondidas'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider block">Com Resposta</span>
            <CheckCircle2 className={`w-4 h-4 ${filterMode === 'respondidas' ? 'text-white' : 'text-emerald-500'}`} />
          </div>
          <span className="text-2xl font-black mt-2 block">{stats.answered}</span>
          <span className="text-[10px] opacity-80 block">Com direito exercido</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterMode('concluidas')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            filterMode === 'concluidas'
              ? 'bg-slate-900 text-white border-slate-950 dark:bg-slate-950 dark:border-slate-700 shadow-md'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider block">Concluídas</span>
            <ShieldCheck className={`w-4 h-4 ${filterMode === 'concluidas' ? 'text-emerald-400' : 'text-slate-400'}`} />
          </div>
          <span className="text-2xl font-black mt-2 block">{stats.completed}</span>
          <span className="text-[10px] opacity-80 block">Processo encerrado</span>
        </button>
      </div>

      {/* SEARCH AND SECTOR FILTER CONTROLS */}
      <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por protocolo, cidadão, relato ou setor..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sectorFilter}
              onChange={e => setSectorFilter(e.target.value)}
              className="w-full md:w-64 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">🌐 Todos os Setores UPA 24h</option>
              <option value="ouvidoria">🏢 Ouvidoria Geral (Iniciais / Não Tramitadas)</option>
              {currentUser.sector_name && (
                <option value="my_sector">📌 Meu Setor ({currentUser.sector_name})</option>
              )}
              <optgroup label="Setores Internos da UPA">
                {sectors.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs font-bold">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider shrink-0">Filtrar por Setor:</span>
          
          <button
            onClick={() => setSectorFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              sectorFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            Todos
          </button>

          <button
            onClick={() => setSectorFilter('ouvidoria')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              sectorFilter === 'ouvidoria'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ouvidoria Geral</span>
          </button>

          {currentUser.sector_name && (
            <button
              onClick={() => setSectorFilter('my_sector')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                sectorFilter === 'my_sector'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 hover:bg-sky-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Meu Setor ({currentUser.sector_name})</span>
            </button>
          )}

          {sectors.slice(0, 4).map(s => (
            <button
              key={s.id}
              onClick={() => setSectorFilter(s.id)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                sectorFilter === s.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* TWO COLUMN MASTER-DETAIL WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: LIST OF MANIFESTATIONS (5 COLS) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-4 shadow-sm space-y-3 max-h-[750px] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2 px-1">
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Listagem de Ouvidorias ({filteredList.length})
            </span>
            <span className="text-[10px] text-slate-400 font-bold">Selecione para responder</span>
          </div>

          {filteredList.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-80" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Nenhuma manifestação encontrada neste filtro!
              </p>
              <p className="text-[11px] text-slate-400">
                Todas as ouvidorias selecionadas já possuem resposta ou não correspondem à busca.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredList.map(m => {
                const isSelected = selectedM?.id === m.id;
                const hasResp = m.responses.length > 0;

                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setSelectedM(m);
                      setResponseText('');
                      setSelectedTemplateId('');
                      setResponseType('official');
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex flex-col gap-2 relative ${
                      isSelected
                        ? 'bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/30 shadow-sm'
                        : 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-black text-blue-700 dark:text-sky-400">
                        {m.protocol}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        m.type === 'Reclamação' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' :
                        m.type === 'Elogio' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        m.type === 'Denúncia' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                        {m.type}
                      </span>
                    </div>

                    {/* Sector & Citizen */}
                    <div className="text-xs space-y-1">
                      <div className="font-extrabold text-slate-900 dark:text-white truncate">
                        {m.is_anonymous ? 'Manifestante Anônimo' : m.complainant.name}
                      </div>

                      {/* Active Sector Badge */}
                      {(() => {
                        const sec = getActiveSectorInfo(m);
                        return (
                          <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                            <span className={`px-2 py-0.5 rounded-md font-bold flex items-center gap-1 ${
                              sec.is_forwarded
                                ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-800'
                                : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                              <Building2 className="w-3 h-3 shrink-0" />
                              <span>{sec.sector_name}</span>
                            </span>

                            {sec.is_forwarded && (
                              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                                sec.last_fwd?.status === 'Pendente'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              }`}>
                                {sec.last_fwd?.status === 'Pendente' ? '⏳ Ag. Parecer' : '✓ Com Parecer'}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Excerpt */}
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 italic">
                      "{m.description}"
                    </p>

                    {/* Footer Status */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800 text-[10px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {m.created_at}
                      </span>

                      {hasResp ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {m.responses.length} Resposta(s)
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 animate-pulse" />
                          Sem Resposta ({m.sla.remaining_days}d SLA)
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: OFFICIAL RESPONSE COMPOSER PANEL (7 COLS) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-md space-y-6">
          {selectedM ? (
            <div className="space-y-6">
              
              {/* Selected Manifestation Summary Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-mono font-black text-blue-700 dark:text-sky-400">
                      {selectedM.protocol}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                      {selectedM.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleOpenForwarding}
                      className="px-3 py-1 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all"
                      title="Encaminhar esta manifestação para parecer técnico do setor"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Encaminhar p/ Setor</span>
                    </button>
                    <button
                      onClick={() => printManifestationProtocol(selectedM, settings)}
                      className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100"
                    >
                      <Printer className="w-3.5 h-3.5 text-blue-600" />
                      <span>Imprimir Protocolo</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Manifestante</span>
                    <strong className="text-slate-900 dark:text-white">
                      {selectedM.is_anonymous ? 'Anônimo' : selectedM.complainant.name}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Setor Envolvido</span>
                    <strong className="text-slate-900 dark:text-white">{selectedM.sector_name}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Teor da Ocorrência Cidadão</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    "{selectedM.description}"
                  </p>
                </div>
              </div>

              {/* Active Sector Tramitation Status Card */}
              {(() => {
                const secInfo = getActiveSectorInfo(selectedM);
                return (
                  <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                        <span className="text-xs font-black text-sky-900 dark:text-sky-200 uppercase tracking-wider">
                          Setor Atualmente Responsável:
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-sky-600 text-white text-xs font-black">
                          {secInfo.sector_name}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleOpenForwarding}
                        className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-sky-300 dark:border-sky-700 text-sky-800 dark:text-sky-300 text-xs font-bold hover:bg-sky-100 flex items-center gap-1 transition-all"
                      >
                        <Send className="w-3 h-3" />
                        <span>Tramitar a Outro Setor</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Responsável</span>
                        <strong className="text-slate-800 dark:text-slate-200">{secInfo.responsible}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Situação de Análise</span>
                        <strong className="text-sky-700 dark:text-sky-300">{secInfo.status_label}</strong>
                      </div>
                      {secInfo.last_fwd && (
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Prazo Parecer</span>
                          <strong className="text-slate-800 dark:text-slate-200">{secInfo.last_fwd.deadline}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* FORWARDINGS & SECTOR TECHNICAL OPINIONS HISTORY */}
              {selectedM.forwardings.length > 0 && (
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-sky-600" />
                    Pareceres Técnicos e Tramitações do Setor ({selectedM.forwardings.length})
                  </h3>

                  <div className="space-y-3">
                    {selectedM.forwardings.map((fwd, idx) => (
                      <div key={fwd.id || idx} className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 dark:text-white">
                              🏢 {fwd.sector_name}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              fwd.status === 'Pendente' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                              'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}>
                              {fwd.status}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold">{fwd.sent_at}</span>
                        </div>

                        {fwd.notes && (
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                            <strong>Despacho da Ouvidoria:</strong> "{fwd.notes}"
                          </div>
                        )}

                        {fwd.response ? (
                          <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                              <span>✓ Parecer Técnico Respondido:</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setResponseText(fwd.response || '');
                                  setResponseType('official');
                                }}
                                className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-500 shadow-2xs transition-all"
                              >
                                Usar como Resposta Oficial
                              </button>
                            </div>
                            <p className="text-slate-800 dark:text-slate-200 whitespace-pre-line font-medium leading-relaxed">
                              {fwd.response}
                            </p>
                            {fwd.responded_at && (
                              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-bold">
                                Emitido em: {fwd.responded_at} por {fwd.responsible_name}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="text-[11px] text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg">
                            <Clock className="w-3.5 h-3.5 animate-pulse" />
                            <span>Aguardando parecer do setor {fwd.sector_name} (Prazo: {fwd.deadline})</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EXISTING RESPONSES HISTORY */}
              {selectedM.responses.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Histórico de Respostas Oficiais ao Cidadão ({selectedM.responses.length})
                  </h3>

                  <div className="space-y-2">
                    {selectedM.responses.map((resp, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
                        <div className="flex justify-between text-[11px] text-emerald-800 dark:text-emerald-300 font-bold">
                          <span>{resp.author_name} ({resp.author_role})</span>
                          <span>{resp.timestamp}</span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-medium">
                          {resp.content}
                        </p>
                        {resp.is_final && (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100 text-[10px] font-extrabold uppercase">
                            ✓ Resposta Oficial Definitiva
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* NEW RESPONSE FORM */}
              <form onSubmit={handleSubmitResponse} className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                
                {/* RESPONSE TYPE SELECTOR (OFFICIAL VS SECTOR OPINION) */}
                <div className="p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center gap-2 border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setResponseType('official')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                      responseType === 'official'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resposta Oficial (Para o Cidadão)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResponseType('sector_opinion')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                      responseType === 'sector_opinion'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Parecer Técnico do Setor</span>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Send className="w-4 h-4 text-emerald-600" />
                    {responseType === 'official' ? 'Emitir Resposta Oficial Institucional' : 'Registrar Parecer Técnico Interno'}
                  </h3>

                  {/* AI Assistant Invoker Button */}
                  {onOpenAiAssistant && (
                    <button
                      type="button"
                      onClick={() => onOpenAiAssistant(selectedM)}
                      className="px-3 py-1.5 rounded-xl bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800 text-xs font-bold hover:bg-purple-200 flex items-center gap-1.5 transition-all shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 animate-pulse" />
                      <span>Gerar com Inteligência Artificial</span>
                    </button>
                  )}
                </div>

                {/* TEMPLATE PICKER */}
                {responseType === 'official' && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Modelos de Resposta Padrão da UPA
                    </label>
                    <select
                      value={selectedTemplateId}
                      onChange={e => handleApplyTemplate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Selecione um modelo pronto de resposta...</option>
                      {responseTemplates.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.title} ({t.type})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* TEXTAREA CONTENT */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {responseType === 'official' ? 'Texto do Despacho / Resposta ao Cidadão' : 'Texto do Parecer Técnico / Justificativa do Setor'} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={7}
                    value={responseText}
                    onChange={e => setResponseText(e.target.value)}
                    placeholder={
                      responseType === 'official'
                        ? 'Escreva a resposta técnica e humanizada da UPA para ser disponibilizada ao cidadão...'
                        : 'Descreva os esclarecimentos técnicos, providências adotadas ou justificativa do setor para a Ouvidoria...'
                    }
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none leading-relaxed font-medium"
                  />
                </div>

                {/* SIGNATURE & OPTIONS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80">
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-500 block mb-1">
                      Assinado Por (Servidor Responsável)
                    </label>
                    <input
                      type="text"
                      value={signedOfficer}
                      onChange={e => setSignedOfficer(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {responseType === 'official' && (
                    <div className="flex items-center gap-2 pt-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isFinalResponse}
                          onChange={e => setIsFinalResponse(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-300 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Marcar como Resposta Definitiva (Concluir Ouvidoria)
                      </span>
                    </div>
                  )}
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isSubmitting || !responseText.trim()}
                  className={`w-full py-3.5 px-4 font-extrabold text-xs rounded-xl shadow-lg text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
                    responseType === 'official'
                      ? 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-blue-700 hover:from-emerald-500 hover:to-blue-600 shadow-emerald-600/20'
                      : 'bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-700 hover:from-sky-500 hover:to-indigo-600 shadow-sky-600/20'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{responseType === 'official' ? 'Registrando Resposta Oficial...' : 'Registrando Parecer Técnico...'}</span>
                    </>
                  ) : (
                    <>
                      <BadgeCheck className="w-4 h-4" />
                      <span>{responseType === 'official' ? 'Publicar Resposta Oficial no Portal do Cidadão' : 'Registrar Parecer Técnico do Setor para Ouvidoria'}</span>
                    </>
                  )}
                </button>
              </form>

            </div>
          ) : (
            /* PLACEHOLDER WHEN NO MANIFESTATION IS SELECTED */
            <div className="p-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400 flex items-center justify-center mx-auto border border-slate-200 dark:border-slate-800">
                <MessageSquare className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-base font-black text-slate-800 dark:text-slate-200">
                Selecione uma Manifestação na Lista
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Clique em qualquer ouvidoria na coluna da esquerda para elaborar e publicar a resposta oficial da UPA 24h.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* FORWARDING MODAL */}
      {showForwardModal && selectedM && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Tramitar Manifestação {selectedM.protocol}
                  </h3>
                  <p className="text-xs text-slate-400">Encaminhar para apuração e parecer técnico do setor interno</p>
                </div>
              </div>

              <button
                onClick={() => setShowForwardModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendForwardingSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Setor UPA Destino <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={fwdSectorId}
                  onChange={e => {
                    setFwdSectorId(e.target.value);
                    const sec = sectors.find(s => s.id === e.target.value);
                    if (sec) setFwdResponsible(sec.responsible_name);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                >
                  {sectors.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}) - Resp: {s.responsible_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Responsável / Destinatário
                  </label>
                  <input
                    type="text"
                    value={fwdResponsible}
                    onChange={e => setFwdResponsible(e.target.value)}
                    placeholder="Nome do coordenador ou médico"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Prazo Limite p/ Parecer
                  </label>
                  <input
                    type="date"
                    required
                    value={fwdDeadline}
                    onChange={e => setFwdDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Despacho / Instrução ao Setor
                </label>
                <textarea
                  rows={4}
                  value={fwdNotes}
                  onChange={e => setFwdNotes(e.target.value)}
                  placeholder="Solicito verificação da conduta / esclarecimentos sobre a escala no dia do atendimento..."
                  className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowForwardModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Confirmar Encaminhamento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
