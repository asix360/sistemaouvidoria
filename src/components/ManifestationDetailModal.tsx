import React, { useState } from 'react';
import {
  X,
  Printer,
  Send,
  MessageSquare,
  Clock,
  ShieldCheck,
  RotateCcw,
  Trash2,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  User,
  MapPin,
  Building2,
  FileText,
  Sparkles,
  Lock,
  Download,
  Calendar
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { Manifestation, ManifestationStatus } from '../types';
import { printManifestationProtocol } from '../utils/exportHelpers';

interface ManifestationDetailModalProps {
  manifestation: Manifestation;
  onClose: () => void;
}

export const ManifestationDetailModal: React.FC<ManifestationDetailModalProps> = ({
  manifestation: m,
  onClose
}) => {
  const {
    currentUser,
    sectors,
    settings,
    responseTemplates,
    addForwarding,
    addResponse,
    updateStatus,
    softDeleteManifestation,
    restoreManifestation
  } = useSystem();

  const [activeTab, setActiveTab] = useState<'geral' | 'manifestante' | 'tramitacao' | 'respostas' | 'anexos'>('geral');

  // Forwarding Form State
  const [showFwdForm, setShowFwdForm] = useState(false);
  const [fwdSectorId, setFwdSectorId] = useState(sectors[0]?.id || 'sec_1');
  const [fwdResponsible, setFwdResponsible] = useState('');
  const [fwdDeadline, setFwdDeadline] = useState(m.sla.initial_deadline);
  const [fwdNotes, setFwdNotes] = useState('');

  // Response Form State
  const [showRespForm, setShowRespForm] = useState(false);
  const [respContent, setRespContent] = useState('');
  const [respIsFinal, setRespIsFinal] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  // Reopen/Close Motive
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState('');

  const perms = currentUser.permissions;

  // Forward Action
  const handleSendForwarding = (e: React.FormEvent) => {
    e.preventDefault();
    const sectorObj = sectors.find(s => s.id === fwdSectorId);
    addForwarding(m.id, {
      sector_id: fwdSectorId,
      sector_name: sectorObj ? sectorObj.name : 'Setor UPA',
      responsible_name: fwdResponsible || (sectorObj ? sectorObj.responsible_name : 'Responsável do Setor'),
      deadline: fwdDeadline,
      notes: fwdNotes
    });
    setShowFwdForm(false);
    setFwdNotes('');
  };

  // Response Action
  const handleSaveResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!respContent.trim()) return;

    addResponse(m.id, {
      content: respContent,
      is_final: respIsFinal,
      status_after: respIsFinal ? 'Concluída' : 'Respondida'
    });

    setShowRespForm(false);
    setRespContent('');
  };

  // Apply Template
  const handleApplyTemplate = (tplId: string) => {
    const tpl = responseTemplates.find(t => t.id === tplId);
    if (!tpl) return;
    let filled = tpl.content
      .replace(/\[NOME_MANIFESTANTE\]/g, m.is_anonymous ? 'Cidadão' : m.complainant.name)
      .replace(/\[PROTOCOLO\]/g, m.protocol)
      .replace(/\[NOME_SETOR\]/g, m.sector_name)
      .replace(/\[DATA_OCORRENCIA\]/g, m.occurrence.date);
    setRespContent(filled);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-600 text-white rounded-2xl shadow-md">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                  {m.protocol}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  m.sla.traffic_light === '🟢' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                  m.sla.traffic_light === '🟡' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                  'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}>
                  {m.sla.traffic_light} {m.sla.status_label} ({m.sla.remaining_days} dias)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Aberto em {m.created_at} às {m.created_time || '10:00'} • {m.origin}
              </p>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => printManifestationProtocol(m, settings)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Imprimir Comprovante de Ouvidoria"
            >
              <Printer className="w-4 h-4 text-sky-600" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-x-auto">
          {[
            { id: 'geral', label: 'Visão Geral', icon: FileText },
            { id: 'manifestante', label: 'Manifestante & Local', icon: User },
            { id: 'tramitacao', label: `Tramitação (${m.forwardings.length})`, icon: Send },
            { id: 'respostas', label: `Respostas (${m.responses.length})`, icon: MessageSquare },
            { id: 'anexos', label: `Anexos (${m.attachments.length})`, icon: Paperclip }
          ].map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-sky-600 text-sky-600 dark:text-sky-400 dark:border-sky-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
          {/* TAB 1: VISÃO GERAL */}
          {activeTab === 'geral' && (
            <div className="space-y-6">
              {/* Core Badges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Tipo</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{m.type}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Prioridade</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{m.priority}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Status Atual</span>
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400">{m.status}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Setor Envolvido</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{m.sector_name}</span>
                </div>
              </div>

              {/* QUICK ACTION BAR */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 via-slate-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Ações Rápidas de Gestão:</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveTab('tramitacao');
                      setShowFwdForm(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-2xs flex items-center gap-1.5 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Encaminhar para Setor (Tramitar)</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('respostas');
                      setShowRespForm(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-2xs flex items-center gap-1.5 transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Emitir Resposta Oficial</span>
                  </button>
                </div>
              </div>

              {/* Description Box */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Descrição Detalhada do Relato
                </h3>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {m.description}
                </div>
              </div>

              {/* Professional Citation */}
              {m.professional && (
                <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase block">
                      Servidor / Profissional Citado
                    </span>
                    <span className="text-xs font-bold text-purple-900 dark:text-purple-100">
                      {m.professional.name} ({m.professional.role})
                    </span>
                    <p className="text-[11px] text-purple-700 dark:text-purple-300">
                      {m.professional.registration} • {m.professional.shift} • {m.professional.team}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MANIFESTANTE & LOCAL */}
          {activeTab === 'manifestante' && (
            <div className="space-y-6">
              {/* Complainant Data */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <User className="w-4 h-4 text-sky-600" /> Identificação do Manifestante
                </h3>

                {m.is_anonymous ? (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs text-amber-800 dark:text-amber-200">
                    Manifestação realizada sob o regime de <strong>ANONIMATO</strong>. Dados sigilosos.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 block">Nome</span>
                      <span className="text-xs font-semibold">{m.complainant.name}</span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 block">CPF</span>
                      <span className="text-xs font-semibold">{m.complainant.cpf || 'Não informado'}</span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 block">Cartão SUS</span>
                      <span className="text-xs font-semibold">{m.complainant.sus_card || 'Não informado'}</span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 block">Telefone / WhatsApp</span>
                      <span className="text-xs font-semibold">{m.complainant.phone || m.complainant.whatsapp}</span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 block">E-mail</span>
                      <span className="text-xs font-semibold">{m.complainant.email || 'Não informado'}</span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 block">Município / Bairro</span>
                      <span className="text-xs font-semibold">{m.complainant.city} - {m.complainant.neighborhood}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Occurrence Location */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-sky-600" /> Detalhes do Local do Ocorrido na UPA
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Data e Hora</span>
                    <span className="text-xs font-semibold">{m.occurrence.date} às {m.occurrence.time}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Local / Sala</span>
                    <span className="text-xs font-semibold">{m.occurrence.location_room}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Classificação de Risco</span>
                    <span className="text-xs font-semibold">{m.occurrence.classification_risk}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRAMITAÇÃO / ENCAMINHAMENTOS */}
          {activeTab === 'tramitacao' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Send className="w-4 h-4 text-purple-600" /> Histórico de Tramitação por Setores
                </h3>

                {perms.encaminhar && !showFwdForm && (
                  <button
                    onClick={() => setShowFwdForm(true)}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Encaminhar a Outro Setor
                  </button>
                )}
              </div>

              {/* Forward Form */}
              {showFwdForm && (
                <form onSubmit={handleSendForwarding} className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold text-purple-900 dark:text-purple-200">
                    Encaminhar Manifestação ao Setor Responsável
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Setor Destino *
                      </label>
                      <select
                        value={fwdSectorId}
                        onChange={e => setFwdSectorId(e.target.value)}
                        className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2"
                      >
                        {sectors.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.responsible_name})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Responsável / Notificado
                      </label>
                      <input
                        type="text"
                        value={fwdResponsible}
                        onChange={e => setFwdResponsible(e.target.value)}
                        placeholder="Nome do chefe/coordenador"
                        className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Prazo de Resposta *
                      </label>
                      <input
                        type="date"
                        value={fwdDeadline}
                        onChange={e => setFwdDeadline(e.target.value)}
                        className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Despacho / Instruções de Apuração
                    </label>
                    <textarea
                      rows={2}
                      value={fwdNotes}
                      onChange={e => setFwdNotes(e.target.value)}
                      placeholder="Instruções para o responsável apurar o fato..."
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowFwdForm(false)}
                      className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg shadow-xs"
                    >
                      Confirmar Despacho
                    </button>
                  </div>
                </form>
              )}

              {/* Forwardings Timeline */}
              <div className="space-y-3">
                {m.forwardings.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Nenhum encaminhamento registrado até o momento.</p>
                ) : (
                  m.forwardings.map(f => (
                    <div
                      key={f.id}
                      className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-700 dark:text-purple-300">
                          Setor: {f.sector_name} (Resp: {f.responsible_name})
                        </span>
                        <span className="text-[10px] text-slate-400">{f.sent_at} • Prazo: {f.deadline}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">{f.notes}</p>
                      {f.response && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl mt-2 text-emerald-900 dark:text-emerald-200">
                          <span className="font-bold text-[10px] uppercase block text-emerald-600">Resposta do Setor:</span>
                          <p className="mt-1">{f.response}</p>
                          {f.digital_signature && (
                            <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 block mt-1">
                              Assinatura Digital: {f.digital_signature}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: RESPOSTAS DA OUVIDORIA */}
          {activeTab === 'respostas' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" /> Parecer e Respostas da Ouvidoria
                </h3>

                {perms.responder && !showRespForm && (
                  <button
                    onClick={() => setShowRespForm(true)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Registrar Resposta / Parecer
                  </button>
                )}
              </div>

              {/* Response Form */}
              {showRespForm && (
                <form onSubmit={handleSaveResponse} className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      Emitir Resposta Oficial com Assinatura Digital
                    </h4>

                    {/* Template Picker */}
                    <select
                      value={selectedTemplateId}
                      onChange={e => {
                        setSelectedTemplateId(e.target.value);
                        handleApplyTemplate(e.target.value);
                      }}
                      className="text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5"
                    >
                      <option value="">Usar Modelo Padronizado...</option>
                      {responseTemplates.map(t => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                    </select>
                  </div>

                  <textarea
                    rows={5}
                    required
                    value={respContent}
                    onChange={e => setRespContent(e.target.value)}
                    placeholder="Escreva a resposta fundamentada para o cidadão..."
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3"
                  />

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                      <input
                        type="checkbox"
                        checked={respIsFinal}
                        onChange={e => setRespIsFinal(e.target.checked)}
                        className="rounded text-emerald-600"
                      />
                      Esta é a resposta final para conclusão do processo.
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowRespForm(false)}
                        className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-xs"
                      >
                        Assinar e Enviar
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Response List */}
              <div className="space-y-3">
                {m.responses.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Nenhuma resposta final emitida ainda.</p>
                ) : (
                  m.responses.map(r => (
                    <div
                      key={r.id}
                      className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                        <span className="font-bold text-sky-700 dark:text-sky-300">
                          {r.author_name} ({r.author_role})
                        </span>
                        <span className="text-[10px] text-slate-400">{r.created_at}</span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">{r.content}</p>
                      {r.digital_signature && (
                        <div className="pt-2 flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>Assinatura Digital de Autenticidade: {r.digital_signature}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: ANEXOS */}
          {activeTab === 'anexos' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-sky-600" /> Documentos e Arquivos Anexados
              </h3>

              {m.attachments.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Nenhum anexo adicionado a esta manifestação.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {m.attachments.map(a => (
                    <div
                      key={a.id}
                      className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Paperclip className="w-4 h-4 text-sky-600 shrink-0" />
                        <div>
                          <span className="font-semibold block truncate">{a.name}</span>
                          <span className="text-[10px] text-slate-400">{a.size} • {a.created_at}</span>
                        </div>
                      </div>
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded-lg hover:bg-sky-200"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {perms.encerrar && m.status !== 'Encerrada' && (
              <button
                onClick={() => updateStatus(m.id, 'Encerrada')}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Encerrar Manifestação
              </button>
            )}

            {perms.reabrir && (m.status === 'Encerrada' || m.status === 'Concluída') && (
              <button
                onClick={() => updateStatus(m.id, 'Reaberta', 'Reaberto a pedido do usuário')}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reabrir
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {perms.excluir && (
              <button
                onClick={() => {
                  const reason = prompt('Motivo do arquivamento (Soft Delete):');
                  if (reason) softDeleteManifestation(m.id, reason);
                  onClose();
                }}
                className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Ocultar (Soft Delete)
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
