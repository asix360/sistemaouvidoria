import React, { useState } from 'react';
import {
  Building2,
  Send,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  ShieldCheck,
  Search,
  Filter,
  AlertTriangle,
  UserCheck,
  Check,
  X,
  ChevronRight,
  Info
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { useToast } from '../context/ToastContext';
import { Manifestation, Forwarding } from '../types';

interface SectorResponseViewProps {
  onSelectManifestation?: (m: Manifestation) => void;
}

export const SectorResponseView: React.FC<SectorResponseViewProps> = ({
  onSelectManifestation
}) => {
  const {
    manifestations,
    currentUser,
    sectors,
    respondForwarding,
    generateDigitalSignature
  } = useSystem();
  const { notifyError, notifySuccess } = useToast();

  // Determine user's assigned sectors
  const userSectorIds = currentUser.sector_ids && currentUser.sector_ids.length > 0
    ? currentUser.sector_ids
    : currentUser.sector_id
    ? [currentUser.sector_id]
    : [];

  const userSectorNames = currentUser.sector_names && currentUser.sector_names.length > 0
    ? currentUser.sector_names
    : currentUser.sector_name
    ? [currentUser.sector_name]
    : [];

  // Filter state
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<string>('ALL');
  const [activeStatusTab, setActiveStatusTab] = useState<'PENDING' | 'ANSWERED' | 'ALL'>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [respondingFwdId, setRespondingFwdId] = useState<string | null>(null);
  const [sectorOpinionText, setSectorOpinionText] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Collect all forwardings across all manifestations that belong to the user's sectors (or all sectors if Admin/Ouvidor)
  const isGlobalUser = currentUser.role === 'Administrador' || currentUser.role === 'Ouvidor' || currentUser.role === 'Diretor' || userSectorIds.length === 0;

  interface ForwardingWithManifestation {
    forwarding: Forwarding;
    manifestation: Manifestation;
  }

  const allRelevantForwardings: ForwardingWithManifestation[] = [];

  manifestations.forEach(m => {
    if (m.deleted_at) return;
    m.forwardings.forEach(fwd => {
      // Check sector match
      const belongsToUserSector = isGlobalUser || userSectorIds.includes(fwd.sector_id) || userSectorNames.includes(fwd.sector_name);
      
      if (belongsToUserSector) {
        allRelevantForwardings.push({
          forwarding: fwd,
          manifestation: m
        });
      }
    });
  });

  // Apply Sector Filter if specific sector selected
  const filteredBySector = allRelevantForwardings.filter(item => {
    if (selectedSectorFilter === 'ALL') return true;
    return item.forwarding.sector_id === selectedSectorFilter || item.forwarding.sector_name === selectedSectorFilter;
  });

  // Apply Tab Filter
  const filteredByStatus = filteredBySector.filter(item => {
    if (activeStatusTab === 'PENDING') return item.forwarding.status === 'Pendente';
    if (activeStatusTab === 'ANSWERED') return item.forwarding.status === 'Respondido';
    return true;
  });

  // Apply Search
  const finalForwardings = filteredByStatus.filter(item => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.manifestation.protocol.toLowerCase().includes(term) ||
      item.manifestation.description.toLowerCase().includes(term) ||
      item.forwarding.sector_name.toLowerCase().includes(term) ||
      (item.forwarding.response && item.forwarding.response.toLowerCase().includes(term))
    );
  });

  // Handlers
  const handleStartResponse = (fwd: Forwarding) => {
    setRespondingFwdId(fwd.id);
    setSectorOpinionText(fwd.response || '');
  };

  const handleSubmitOpinion = (manifestationId: string, forwardingId: string) => {
    if (!sectorOpinionText.trim()) {
      notifyError('Validação de Parecer Técnico', ['Por favor, digite o conteúdo do parecer técnico do setor antes de enviar.']);
      return;
    }
    if (sectorOpinionText.trim().length < 10) {
      notifyError('Validação de Parecer Técnico', [`O parecer deve conter uma justificativa de pelo menos 10 caracteres (atual: ${sectorOpinionText.trim().length}).`]);
      return;
    }

    respondForwarding(manifestationId, forwardingId, sectorOpinionText.trim(), 'Respondido');

    setRespondingFwdId(null);
    setSectorOpinionText('');
    const msg = `Parecer técnico registrado e enviado à Ouvidoria Geral com sucesso!`;
    setToastMsg(msg);
    notifySuccess('Parecer Técnico Registrado!', msg);
    setTimeout(() => setToastMsg(''), 6000);
  };

  // Counts
  const pendingCount = allRelevantForwardings.filter(i => i.forwarding.status === 'Pendente').length;
  const answeredCount = allRelevantForwardings.filter(i => i.forwarding.status === 'Respondido').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-sky-600" /> Módulo de Resposta e Parecer Técnico do Setor
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Painel do Coordenador de Setor para apuração interna e envio do Parecer Técnico ao Ouvidor Geral
        </p>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-200" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg('')}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* COORDENADOR & SETOR BANNER */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white shadow-md border border-sky-500/30 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-sky-300">
              <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Perfil do Coordenador: {currentUser.name} ({currentUser.role})</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              O paciente <strong>nunca recebe resposta direta do setor</strong>. Neste módulo, o Coordenador redige o <strong>Parecer Técnico Interno</strong> e envia para a Ouvidoria. O Ouvidor do Sistema analisará seu parecer para estruturar a Resposta Oficial ao Cidadão.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 text-right shrink-0">
            <span className="text-[10px] font-bold text-sky-300 uppercase block">Setores Atribuídos</span>
            <div className="flex flex-wrap items-center justify-end gap-1 mt-1">
              {userSectorNames.length > 0 ? (
                userSectorNames.map((sn, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-sky-500/30 border border-sky-400/40 text-white rounded-md text-[11px] font-bold">
                    {sn}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-300 font-semibold">Todos os Setores (Modo Gestor/Ouvidor)</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* COUNTERS AND FILTERS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveStatusTab('PENDING')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeStatusTab === 'PENDING'
              ? 'bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-100 ring-2 ring-amber-500/20'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">Aguardando Parecer</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black mt-1 text-amber-600 dark:text-amber-400">{pendingCount}</div>
          <span className="text-[10px] text-slate-400">Encaminhamentos pendentes de resposta do setor</span>
        </button>

        <button
          onClick={() => setActiveStatusTab('ANSWERED')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeStatusTab === 'ANSWERED'
              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/20'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">Pareceres Já Enviados</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">{answeredCount}</div>
          <span className="text-[10px] text-slate-400">Pareceres fornecidos à Ouvidoria Geral</span>
        </button>

        <button
          onClick={() => setActiveStatusTab('ALL')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeStatusTab === 'ALL'
              ? 'bg-sky-500/10 border-sky-500 text-sky-900 dark:text-sky-100 ring-2 ring-sky-500/20'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">Todos os Encaminhamentos</span>
            <FileText className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-black mt-1 text-sky-600 dark:text-sky-400">{allRelevantForwardings.length}</div>
          <span className="text-[10px] text-slate-400">Total de demandas recebidas da Ouvidoria</span>
        </button>
      </div>

      {/* SEARCH AND SECTOR DROPDOWN */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Filtrar por protocolo, setor ou texto..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {isGlobalUser && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedSectorFilter}
              onChange={e => setSelectedSectorFilter(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="ALL">Todos os Setores UPA</option>
              {sectors.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code}) - Resp: {s.responsible_name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* LIST OF FORWARDINGS */}
      {finalForwardings.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Nenhum encaminhamento encontrado
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Não há pendências de parecer técnico no momento para os filtros aplicados.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {finalForwardings.map(({ forwarding: fwd, manifestation: m }) => {
            const isRespondingThis = respondingFwdId === fwd.id;
            const isPending = fwd.status === 'Pendente';

            return (
              <div
                key={fwd.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-5 space-y-4 transition-all hover:border-slate-300 dark:hover:border-slate-600"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-black text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800">
                      {m.protocol}
                    </span>

                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                      Setor: {fwd.sector_name}
                    </span>

                    <span className="text-xs font-bold text-slate-500">
                      Resp: {fwd.responsible_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 ${
                      isPending
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {isPending ? <Clock className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>{isPending ? 'Aguardando Parecer Técnico' : 'Parecer Técnico Enviado'}</span>
                    </span>

                    {onSelectManifestation && (
                      <button
                        onClick={() => onSelectManifestation(m)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <span>Ver Processo Completo</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Dispatch & Citizen Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Citizen Report Excerpt */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-400 block">
                      Relato do Paciente / Manifestação ({m.type})
                    </span>
                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium line-clamp-3">
                      "{m.description}"
                    </p>
                    <div className="text-[10px] text-slate-400 pt-1">
                      Categoria: <strong>{m.category}</strong> • Prioridade: <strong>{m.priority}</strong>
                    </div>
                  </div>

                  {/* Right: Ouvidor Dispatch Instructions */}
                  <div className="p-3.5 rounded-xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-sky-800 dark:text-sky-300 block flex items-center gap-1">
                        <Send className="w-3 h-3 text-sky-600" /> Despacho da Ouvidoria
                      </span>
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                        Prazo do Setor: {fwd.deadline}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      {fwd.notes || 'Encaminhado ao setor responsável para verificação dos fatos e esclarecimento técnico.'}
                    </p>
                    <div className="text-[10px] text-slate-400 pt-1">
                      Encaminhado em: <strong>{fwd.sent_at}</strong>
                    </div>
                  </div>
                </div>

                {/* Parecer Técnico Response Section */}
                {fwd.response ? (
                  <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                    <div className="flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200 font-bold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Parecer Técnico Registrado do Setor
                      </span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                        Em: {fwd.response_at || 'Data registrada'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium whitespace-pre-wrap bg-white/60 dark:bg-slate-900/60 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      {fwd.response}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold pt-1">
                      <span>Assinado por: <strong>{fwd.responsible_name}</strong> ({fwd.sector_name})</span>
                      <button
                        onClick={() => handleStartResponse(fwd)}
                        className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
                      >
                        Complementar Parecer
                      </button>
                    </div>
                  </div>
                ) : isRespondingThis ? (
                  /* Form to write Parecer Técnico */
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-sky-400 dark:border-sky-600 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-sky-600" />
                        <span>Redigir Parecer Técnico Interno do Setor ({fwd.sector_name})</span>
                      </h4>

                      <button
                        onClick={() => setRespondingFwdId(null)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <textarea
                        rows={4}
                        required
                        value={sectorOpinionText}
                        onChange={e => setSectorOpinionText(e.target.value)}
                        placeholder="Escreva os esclarecimentos do setor, apuração dos fatos, condutas adotadas e fundamentação técnica..."
                        className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed font-sans"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-[11px] text-sky-900 dark:text-sky-200 flex items-start gap-2">
                      <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Nota de Fluxo Indireto:</strong> Seu parecer é um documento de apuração interna. Ao enviar, o <strong>Ouvidor do Sistema</strong> será notificado para estruturar e publicar a <strong>Resposta Oficial ao Paciente</strong>.
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="text-[10px] text-slate-400 font-mono">
                        Assinatura: {generateDigitalSignature(sectorOpinionText || 'PARECER')}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setRespondingFwdId(null)}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all"
                        >
                          Cancelar
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSubmitOpinion(m.id, fwd.id)}
                          disabled={!sectorOpinionText.trim()}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Enviar Parecer Técnico à Ouvidoria</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Button to open response form */
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleStartResponse(fwd)}
                      className="px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-sm transition-all flex items-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Redigir Parecer Técnico do Setor</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
