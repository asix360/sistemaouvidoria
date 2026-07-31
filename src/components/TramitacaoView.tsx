import React, { useState, useMemo } from 'react';
import {
  GitFork,
  Search,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  UserCheck,
  FileText,
  Printer,
  Plus,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  BadgeAlert,
  ChevronRight,
  HelpCircle,
  FileCheck2,
  XCircle,
  Calendar
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { Manifestation, Forwarding, Sector } from '../types';

interface TramitacaoViewProps {
  onSelectManifestation?: (m: Manifestation) => void;
}

export const TramitacaoView: React.FC<TramitacaoViewProps> = ({ onSelectManifestation }) => {
  const {
    manifestations,
    sectors,
    currentUser,
    settings,
    addForwarding,
    respondForwarding,
    updateStatus
  } = useSystem();

  // Active non-deleted manifestations
  const activeManifestations = useMemo(() => {
    return manifestations.filter(m => !m.deleted_at);
  }, [manifestations]);

  // Tab Filter
  const [activeTab, setActiveTab] = useState<'pendentes' | 'todas' | 'respondidas' | 'remover'>('pendentes');
  const [selectedSectorId, setSelectedSectorId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Manifestation for Dispatch Details
  const [selectedM, setSelectedM] = useState<Manifestation | null>(null);

  // New Dispatch Form Modal State
  const [showNewModal, setShowNewModal] = useState(false);
  const [targetSectorId, setTargetSectorId] = useState('');
  const [responsibleName, setResponsibleName] = useState('');
  const [deadlineDays, setDeadlineDays] = useState(5);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sector Opinion Response State
  const [respondingFwdId, setRespondingFwdId] = useState<string | null>(null);
  const [sectorOpinionText, setSectorOpinionText] = useState('');
  const [sectorStatus, setSectorStatus] = useState<'Respondido' | 'Recusado'>('Respondido');

  // Success Notification
  const [toastMsg, setToastMsg] = useState('');

  // All Forwardings extracted for high-level statistics
  const allForwardings = useMemo(() => {
    const list: { manifestation: Manifestation; forwarding: Forwarding }[] = [];
    activeManifestations.forEach(m => {
      m.forwardings.forEach(f => {
        list.push({ manifestation: m, forwarding: f });
      });
    });
    return list;
  }, [activeManifestations]);

  // Quick Statistics
  const stats = useMemo(() => {
    const totalDispatched = allForwardings.length;
    const pending = allForwardings.filter(item => item.forwarding.status === 'Pendente').length;
    const answered = allForwardings.filter(item => item.forwarding.status === 'Respondido').length;
    const refused = allForwardings.filter(item => item.forwarding.status === 'Recusado').length;

    // Count by sector
    const sectorCounts: Record<string, number> = {};
    allForwardings.forEach(item => {
      const name = item.forwarding.sector_name;
      sectorCounts[name] = (sectorCounts[name] || 0) + 1;
    });

    let topSector = 'Não informado';
    let maxCount = 0;
    Object.entries(sectorCounts).forEach(([sec, cnt]) => {
      if (cnt > maxCount) {
        maxCount = cnt;
        topSector = sec;
      }
    });

    return { totalDispatched, pending, answered, refused, topSector };
  }, [allForwardings]);

  // Filtered List of Manifestations for the Left Column
  const filteredManifestations = useMemo(() => {
    return activeManifestations.filter(m => {
      const hasDispatches = m.forwardings.length > 0;

      // Status tab
      if (activeTab === 'pendentes') {
        const hasPendingFwd = m.forwardings.some(f => f.status === 'Pendente');
        if (!hasPendingFwd && m.status !== 'Encaminhada') return false;
      } else if (activeTab === 'respondidas') {
        if (!m.forwardings.some(f => f.status === 'Respondido')) return false;
      }

      // Sector filter
      if (selectedSectorId !== 'all') {
        const matchesMainSector = m.sector_id === selectedSectorId;
        const matchesFwdSector = m.forwardings.some(f => f.sector_id === selectedSectorId);
        if (!matchesMainSector && !matchesFwdSector) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesProtocol = m.protocol.toLowerCase().includes(q);
        const matchesCitizen = m.complainant.name.toLowerCase().includes(q);
        const matchesDesc = m.description.toLowerCase().includes(q);
        const matchesSector = m.sector_name.toLowerCase().includes(q);
        return matchesProtocol || matchesCitizen || matchesDesc || matchesSector;
      }

      return true;
    });
  }, [activeManifestations, activeTab, selectedSectorId, searchQuery]);

  // Handle Sector Change in New Dispatch Modal
  const handleSelectTargetSector = (secId: string) => {
    setTargetSectorId(secId);
    const sec = sectors.find(s => s.id === secId);
    if (sec) {
      setResponsibleName(sec.responsible_name);
      setDeadlineDays(sec.sla_days_default || 5);
    }
  };

  // Create New Sector Dispatch
  const handleCreateDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedM || !targetSectorId || !notes.trim()) return;

    setIsSubmitting(true);

    const sec = sectors.find(s => s.id === targetSectorId);
    if (!sec) return;

    const today = new Date();
    today.setDate(today.getDate() + Number(deadlineDays));
    const deadlineStr = today.toISOString().substring(0, 10);

    setTimeout(() => {
      addForwarding(selectedM.id, {
        sector_id: sec.id,
        sector_name: sec.name,
        responsible_name: responsibleName || sec.responsible_name,
        deadline: deadlineStr,
        notes: notes.trim()
      });

      setIsSubmitting(false);
      setShowNewModal(false);
      setNotes('');
      setToastMsg(`Encaminhamento de tramitação realizado com sucesso para ${sec.name}!`);
      setTimeout(() => setToastMsg(''), 4000);
    }, 300);
  };

  // Submit Technical Opinion for a Sector Forwarding
  const handleSubmitSectorOpinion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedM || !respondingFwdId || !sectorOpinionText.trim()) return;

    respondForwarding(selectedM.id, respondingFwdId, sectorOpinionText.trim(), sectorStatus);

    setRespondingFwdId(null);
    setSectorOpinionText('');
    setToastMsg(`Parecer técnico emitido com sucesso! O Ouvidor Geral foi notificado para elaborar a Resposta Oficial ao Cidadão.`);
    setTimeout(() => setToastMsg(''), 5000);
  };

  // Print Official Dispatch Term
  const handlePrintDispatchTerm = (fwd: Forwarding) => {
    if (!selectedM) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Guia de Tramitação Interna - UPA 24h - ${selectedM.protocol}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
            .header { text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 25px; }
            .logo { font-size: 20px; font-weight: bold; color: #0369a1; text-transform: uppercase; }
            .sub { font-size: 12px; color: #64748b; }
            .box { border: 1px solid #cbd5e1; padding: 15px; border-radius: 8px; margin-between: 15px; background: #f8fafc; margin-bottom: 20px; }
            .title { font-size: 14px; font-weight: bold; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px; }
            .row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px; }
            .label { font-weight: bold; color: #475569; }
            .signature-box { margin-top: 50px; display: flex; justify-content: space-between; text-align: center; font-size: 11px; }
            .sig-line { width: 45%; border-top: 1px solid #64748b; pt-1; margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">${settings.upa_name || 'UNIDADE DE PRONTO ATENDIMENTO 24H'}</div>
            <div class="sub">DESPACHO DE TRAMITAÇÃO INTERNA DA OUVIDORIA SUS</div>
            <div class="sub" style="font-weight: bold; color: #0284c7; margin-top: 5px;">PROTOCOLO Nº ${selectedM.protocol}</div>
          </div>

          <div class="box">
            <div class="title">1. DADOS DA MANIFESTAÇÃO</div>
            <div class="row"><span class="label">Manifestante:</span> <span>${selectedM.is_anonymous ? 'Anônimo' : selectedM.complainant.name}</span></div>
            <div class="row"><span class="label">Tipo / Categoria:</span> <span>${selectedM.type} - ${selectedM.category}</span></div>
            <div class="row"><span class="label">Data de Entrada:</span> <span>${selectedM.created_at}</span></div>
            <p style="font-size: 12px; margin-top: 10px; font-style: italic;">"${selectedM.description}"</p>
          </div>

          <div class="box">
            <div class="title">2. DETERMINAÇÃO DE TRAMITAÇÃO AO SETOR</div>
            <div class="row"><span class="label">Setor Destino:</span> <span><strong>${fwd.sector_name}</strong></span></div>
            <div class="row"><span class="label">Responsável pela Chefia:</span> <span>${fwd.responsible_name}</span></div>
            <div class="row"><span class="label">Data de Envio:</span> <span>${fwd.sent_at}</span></div>
            <div class="row"><span class="label">Prazo Limite para Parecer:</span> <span><strong>${fwd.deadline}</strong></span></div>
            <p style="font-size: 12px; margin-top: 10px;"><strong>Instruções do Ouvidor:</strong> ${fwd.notes}</p>
          </div>

          ${fwd.response ? `
          <div class="box">
            <div class="title">3. PARECER TÉCNICO REGISTRADO PELO SETOR</div>
            <div class="row"><span class="label">Status:</span> <span><strong>${fwd.status}</strong></span></div>
            <div class="row"><span class="label">Data da Resposta:</span> <span>${fwd.response_at || ''}</span></div>
            <p style="font-size: 12px; margin-top: 10px;">${fwd.response}</p>
            ${fwd.digital_signature ? `<div style="font-size: 10px; color: #0284c7; margin-top: 8px;">Assinatura Digital: ${fwd.digital_signature}</div>` : ''}
          </div>
          ` : ''}

          <div class="signature-box">
            <div class="sig-line">
              <strong>${currentUser.name}</strong><br/>
              Ouvidoria Geral / Coordenação UPA 24h
            </div>
            <div class="sig-line">
              <strong>${fwd.responsible_name}</strong><br/>
              Responsável pelo Setor ${fwd.sector_name}
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-20">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 text-xs font-black uppercase tracking-wider border border-sky-300 dark:border-sky-800">
              Gestão de Fluxo Interno UPA 24h
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <GitFork className="w-7 h-7 text-sky-600 dark:text-sky-400" />
            Módulo de Tramitação e Encaminhamento de Setores
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Distribuição de tarefas, requerimentos de pareceres técnicos e despacho entre os departamentos da UPA.
          </p>
        </div>

        {/* Action Button: New Dispatch */}
        <button
          type="button"
          onClick={() => {
            if (!selectedM && activeManifestations.length > 0) {
              setSelectedM(activeManifestations[0]);
            }
            setShowNewModal(true);
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Encaminhar Manifestação (Nova Tramitação)</span>
        </button>
      </div>

      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="p-4 rounded-2xl bg-sky-600 text-white shadow-xl flex items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button
            onClick={() => setToastMsg('')}
            className="text-white hover:text-sky-200 text-xs font-bold px-2 py-1 rounded-lg bg-sky-700"
          >
            Fechar
          </button>
        </div>
      )}

      {/* FLUXO INTERNO BANNER */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white shadow-md border border-sky-500/30 space-y-2">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-sky-300">
          <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
          <span>Fluxo de Resposta Indireta: Comunicação Interna (Ouvidor ⟷ Coordenador de Setor)</span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed">
          O Ouvidor realiza o encaminhamento para apuração ao Coordenador do Setor. O Coordenador redige o <strong>Parecer Técnico Interno</strong> e reencaminha ao Ouvidor. Assim que o parecer é enviado, o Ouvidor recebe uma notificação automática para redigir e publicar a <strong>Resposta Oficial ao Paciente</strong>.
        </p>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        <button
          type="button"
          onClick={() => setActiveTab('pendentes')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'pendentes'
              ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider block">Tramitações Pendentes</span>
            <Clock className={`w-4 h-4 ${activeTab === 'pendentes' ? 'text-white' : 'text-amber-500'}`} />
          </div>
          <span className="text-2xl font-black mt-2 block">{stats.pending}</span>
          <span className="text-[10px] opacity-80 block">Aguardando parecer do setor</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('respondidas')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'respondidas'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider block">Pareceres Concluídos</span>
            <CheckCircle2 className={`w-4 h-4 ${activeTab === 'respondidas' ? 'text-white' : 'text-emerald-500'}`} />
          </div>
          <span className="text-2xl font-black mt-2 block">{stats.answered}</span>
          <span className="text-[10px] opacity-80 block">Setor respondeu instrução</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('todas')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'todas'
              ? 'bg-blue-600 text-white border-blue-700 shadow-md shadow-blue-600/20'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider block">Total Despachado</span>
            <GitFork className={`w-4 h-4 ${activeTab === 'todas' ? 'text-white' : 'text-blue-500'}`} />
          </div>
          <span className="text-2xl font-black mt-2 block">{stats.totalDispatched}</span>
          <span className="text-[10px] opacity-80 block">Histórico de tramitação</span>
        </button>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Setor Mais Demandado</span>
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-base font-black text-slate-900 dark:text-white mt-2 block truncate">
            {stats.topSector}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold block">Maior fluxo de despachos</span>
        </div>

      </div>

      {/* FILTER SEARCH TOOLBAR */}
      <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar protocolo, manifestante, setor ou teor..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedSectorId}
            onChange={e => setSelectedSectorId(e.target.value)}
            className="w-full md:w-64 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">Todos os Setores UPA</option>
            {sectors.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TWO COLUMN MASTER-DETAIL WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: LIST OF MANIFESTATIONS FOR TRAMITAÇÃO (5 COLS) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-4 shadow-sm space-y-3 max-h-[750px] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2 px-1">
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Ouvidorias & Tramitações ({filteredManifestations.length})
            </span>
            <span className="text-[10px] text-slate-400 font-bold">Selecione para gerenciar</span>
          </div>

          {filteredManifestations.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-sky-500 mx-auto opacity-80" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Nenhuma tramitação encontrada neste filtro!
              </p>
              <p className="text-[11px] text-slate-400">
                Ajuste os filtros de busca ou clique em "Encaminhar Manifestação" para criar uma nova.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredManifestations.map(m => {
                const isSelected = selectedM?.id === m.id;
                const fwdCount = m.forwardings.length;
                const lastFwd = fwdCount > 0 ? m.forwardings[fwdCount - 1] : null;

                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setSelectedM(m);
                      setRespondingFwdId(null);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex flex-col gap-2 relative ${
                      isSelected
                        ? 'bg-sky-50/90 dark:bg-sky-950/60 border-sky-500 ring-2 ring-sky-500/30 shadow-sm'
                        : 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-black text-sky-700 dark:text-sky-400">
                        {m.protocol}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                        {m.status}
                      </span>
                    </div>

                    {/* Sector & Citizen */}
                    <div className="text-xs space-y-0.5">
                      <div className="font-extrabold text-slate-900 dark:text-white truncate">
                        {m.is_anonymous ? 'Manifestante Anônimo' : m.complainant.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>Setor Origem: {m.sector_name}</span>
                      </div>
                    </div>

                    {/* Last forwarding status */}
                    {lastFwd ? (
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] flex items-center justify-between gap-2">
                        <div className="truncate">
                          <span className="text-[10px] text-slate-400 block font-bold">Último Encaminhamento:</span>
                          <strong className="text-slate-800 dark:text-slate-200">{lastFwd.sector_name}</strong>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                          lastFwd.status === 'Respondido' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          lastFwd.status === 'Recusado' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {lastFwd.status}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Sem encaminhamentos anteriores</span>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-400">
                      <span>{m.created_at}</span>
                      <span className="font-bold text-sky-600 dark:text-sky-400">
                        {fwdCount} Tramitação(ões)
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: TRAMITAÇÃO WORKSPACE & TIMELINE (7 COLS) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-md space-y-6">
          {selectedM ? (
            <div className="space-y-6">
              
              {/* Selected Manifestation Overview Header */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-mono font-black text-sky-700 dark:text-sky-400">
                      {selectedM.protocol}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                      {selectedM.type}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleSelectTargetSector(sectors[0]?.id || '');
                      setShowNewModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Novo Encaminhamento</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Manifestante</span>
                    <strong className="text-slate-900 dark:text-white">
                      {selectedM.is_anonymous ? 'Anônimo' : selectedM.complainant.name}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Setor Principal</span>
                    <strong className="text-slate-900 dark:text-white">{selectedM.sector_name}</strong>
                  </div>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  "{selectedM.description}"
                </p>
              </div>

              {/* TIMELINE OF TRAMITAÇÕES FOR THIS MANIFESTATION */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <GitFork className="w-4 h-4 text-sky-600" />
                    Linha do Tempo de Tramitações e Despachos ({selectedM.forwardings.length})
                  </h3>
                </div>

                {selectedM.forwardings.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
                    <Send className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Nenhum encaminhamento registrado para esta ouvidoria.
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                      Clique no botão acima para despachar para a chefia de algum setor interno.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                    {selectedM.forwardings.map((fwd, index) => (
                      <div key={fwd.id} className="relative pl-10 space-y-2">
                        {/* Timeline Node Icon */}
                        <div className={`absolute left-2.5 top-1 -translate-x-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black ${
                          fwd.status === 'Respondido' ? 'bg-emerald-600 border-white text-white' :
                          fwd.status === 'Recusado' ? 'bg-rose-600 border-white text-white' :
                          'bg-amber-500 border-white text-white'
                        }`}>
                          {index + 1}
                        </div>

                        {/* Card Content */}
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-xs space-y-3">
                          
                          {/* Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-2">
                            <div>
                              <strong className="text-sm font-black text-slate-900 dark:text-white block">
                                Setor: {fwd.sector_name}
                              </strong>
                              <span className="text-[11px] text-slate-500">
                                Responsável: <strong>{fwd.responsible_name}</strong>
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                fwd.status === 'Respondido' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                                fwd.status === 'Recusado' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                                'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}>
                                {fwd.status}
                              </span>

                              <button
                                type="button"
                                onClick={() => handlePrintDispatchTerm(fwd)}
                                className="p-1.5 text-slate-500 hover:text-sky-600 dark:hover:text-sky-400"
                                title="Imprimir Guia de Tramitação"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Dispatch Dates & Notes */}
                          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                            <div>
                              <span className="font-bold text-slate-400 block">Data de Envio:</span>
                              <span className="text-slate-800 dark:text-slate-200">{fwd.sent_at}</span>
                            </div>
                            <div>
                              <span className="font-bold text-slate-400 block">Prazo Limite (SLA Setor):</span>
                              <strong className="text-rose-600 dark:text-rose-400">{fwd.deadline}</strong>
                            </div>
                          </div>

                          <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">
                              Determinação / Instruções da Ouvidoria:
                            </span>
                            <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                              {fwd.notes}
                            </p>
                          </div>

                          {/* Sector Opinion Result (if answered) */}
                          {fwd.response ? (
                            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1.5">
                              <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
                                <span className="flex items-center gap-1">
                                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                                  Parecer Oficial do Setor ({fwd.status})
                                </span>
                                <span>{fwd.response_at}</span>
                              </div>
                              <p className="text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-medium">
                                {fwd.response}
                              </p>
                              {fwd.digital_signature && (
                                <div className="text-[9px] font-mono text-emerald-700 dark:text-emerald-400 pt-1 border-t border-emerald-200 dark:border-emerald-800">
                                  Assinatura Digital do Parecer: {fwd.digital_signature}
                                </div>
                              )}
                            </div>
                          ) : (
                            /* Trigger Sector Response Form */
                            <div>
                              {respondingFwdId === fwd.id ? (
                                <form onSubmit={handleSubmitSectorOpinion} className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-3">
                                  <h4 className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                                    <UserCheck className="w-4 h-4 text-amber-600" />
                                    Registrar Parecer Técnico do Setor
                                  </h4>

                                  <div>
                                    <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                      Resposta / Providências Adotadas pelo Setor <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                      rows={4}
                                      value={sectorOpinionText}
                                      onChange={e => setSectorOpinionText(e.target.value)}
                                      placeholder="Descreva as verificações realizadas, esclarecimentos ou ações corretivas tomadas pela chefia..."
                                      className="w-full p-3 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                  </div>

                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-3 text-xs">
                                      <label className="flex items-center gap-1.5 cursor-pointer font-bold text-emerald-700">
                                        <input
                                          type="radio"
                                          name="status"
                                          checked={sectorStatus === 'Respondido'}
                                          onChange={() => setSectorStatus('Respondido')}
                                        />
                                        <span>Concluir Parecer</span>
                                      </label>
                                      <label className="flex items-center gap-1.5 cursor-pointer font-bold text-rose-700">
                                        <input
                                          type="radio"
                                          name="status"
                                          checked={sectorStatus === 'Recusado'}
                                          onChange={() => setSectorStatus('Recusado')}
                                        />
                                        <span>Recusar Tramitação</span>
                                      </label>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setRespondingFwdId(null)}
                                        className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
                                      >
                                        Cancelar
                                      </button>
                                      <button
                                        type="submit"
                                        disabled={!sectorOpinionText.trim()}
                                        className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs disabled:opacity-50"
                                      >
                                        Salvar Parecer
                                      </button>
                                    </div>
                                  </div>
                                </form>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRespondingFwdId(fwd.id);
                                    setSectorOpinionText('');
                                  }}
                                  className="w-full py-2 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-200 text-xs font-bold rounded-xl border border-amber-300 dark:border-amber-800 transition-colors flex items-center justify-center gap-2"
                                >
                                  <UserCheck className="w-4 h-4 text-amber-600" />
                                  <span>Dar Parecer Técnico neste Encaminhamento</span>
                                </button>
                              )}
                            </div>
                          )}

                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="p-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400 flex items-center justify-center mx-auto border border-slate-200 dark:border-slate-800">
                <GitFork className="w-8 h-8 text-sky-600" />
              </div>
              <h3 className="text-base font-black text-slate-800 dark:text-slate-200">
                Selecione uma Ouvidoria na Lista
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Escolha qualquer manifestação à esquerda para visualizar o histórico de tramitação ou realizar novos encaminhamentos entre setores da UPA.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* MODAL: NOVA TRAMITAÇÃO / ENCAMINHAMENTO */}
      {showNewModal && selectedM && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <form onSubmit={handleCreateDispatch} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <GitFork className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Novo Encaminhamento Interno
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-sky-50 dark:bg-sky-950/40 rounded-xl text-xs space-y-1 border border-sky-200 dark:border-sky-800">
              <div className="font-bold text-sky-800 dark:text-sky-300">
                Protocolo: {selectedM.protocol} ({selectedM.type})
              </div>
              <div className="text-slate-600 dark:text-slate-300 line-clamp-1 italic">
                "{selectedM.description}"
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Setor de Destino <span className="text-red-500">*</span>
                </label>
                <select
                  value={targetSectorId}
                  onChange={e => handleSelectTargetSector(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">Selecione o setor da UPA...</option>
                  {sectors.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}) - Chefia: {s.responsible_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Responsável / Chefia
                  </label>
                  <input
                    type="text"
                    value={responsibleName}
                    onChange={e => setResponsibleName(e.target.value)}
                    placeholder="Nome do coordenador"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Prazo em Dias (SLA Setor)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={deadlineDays}
                    onChange={e => setDeadlineDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Determinação / Instrução do Ouvidor <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Especifique as orientações para apuração do fato ou pedido de parecer técnico..."
                  required
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !targetSectorId || !notes.trim()}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting ? 'Gerando Despacho...' : 'Confirmar & Despachar'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
