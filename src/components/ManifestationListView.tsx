import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Trash2,
  RotateCcw,
  Eye,
  Clock,
  Printer,
  ShieldCheck,
  AlertCircle,
  Plus
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { Manifestation } from '../types';
import { exportManifestationsToCSV, exportManifestationsToPDF } from '../utils/exportHelpers';
import { ActiveTab } from './Sidebar';

interface ManifestationListViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onSelectManifestation: (m: Manifestation) => void;
}

export const ManifestationListView: React.FC<ManifestationListViewProps> = ({
  setActiveTab,
  onSelectManifestation
}) => {
  const {
    manifestations,
    searchTerm,
    setSearchTerm,
    showDeleted,
    setShowDeleted,
    restoreManifestation,
    currentUser,
    settings
  } = useSystem();

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [slaFilter, setSlaFilter] = useState<string>('all');

  const handleExportPDF = () => {
    exportManifestationsToPDF(
      filteredList,
      {
        searchTerm,
        typeFilter,
        statusFilter,
        slaFilter,
        showDeleted,
        generatedBy: `${currentUser.name} (${currentUser.role})`
      },
      settings
    );
  };

  // Real-time live search filter
  const filteredList = useMemo(() => {
    return manifestations.filter(m => {
      // Soft Delete Filter
      if (showDeleted) {
        if (!m.deleted_at) return false;
      } else {
        if (m.deleted_at) return false;
      }

      // Quick dropdown filters
      if (typeFilter !== 'all' && m.type !== typeFilter) return false;
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (slaFilter !== 'all' && m.sla.traffic_light !== slaFilter) return false;

      // Smart search term matching (case insensitive)
      if (searchTerm.trim().length > 0) {
        const query = searchTerm.toLowerCase();
        const matchProtocol = m.protocol.toLowerCase().includes(query);
        const matchName = m.complainant?.name?.toLowerCase().includes(query);
        const matchCpf = m.complainant?.cpf?.includes(query);
        const matchPhone = m.complainant?.phone?.includes(query) || m.complainant?.whatsapp?.includes(query);
        const matchType = m.type.toLowerCase().includes(query);
        const matchSector = m.sector_name.toLowerCase().includes(query);
        const matchProf = m.professional?.name?.toLowerCase().includes(query);
        const matchStatus = m.status.toLowerCase().includes(query);
        const matchDate = m.created_at.includes(query);
        const matchDesc = m.description.toLowerCase().includes(query);

        return (
          matchProtocol ||
          matchName ||
          matchCpf ||
          matchPhone ||
          matchType ||
          matchSector ||
          matchProf ||
          matchStatus ||
          matchDate ||
          matchDesc
        );
      }

      return true;
    });
  }, [manifestations, searchTerm, showDeleted, typeFilter, statusFilter, slaFilter]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-sky-600" /> Consulta de Manifestações
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pesquisa em tempo real com filtros avançados e controle de prazos SLA
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-800 dark:text-sky-200 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors shadow-xs"
            title="Exportar listagem filtrada para relatório em formato PDF"
          >
            <Printer className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Exportar PDF</span>
          </button>

          <button
            onClick={() => exportManifestationsToCSV(filteredList)}
            className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <button
            onClick={() => setActiveTab('nova')}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" /> Nova Manifestação
          </button>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Pesquisa Inteligente: Digite nº protocolo, CPF, nome, telefone, setor, médico ou palavra-chave..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2 text-slate-800 dark:text-slate-200"
              >
                <option value="all">Todos os Tipos</option>
                <option value="Reclamação">Reclamação</option>
                <option value="Denúncia">Denúncia</option>
                <option value="Sugestão">Sugestão</option>
                <option value="Elogio">Elogio</option>
                <option value="Informação">Informação</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2 text-slate-800 dark:text-slate-200"
              >
                <option value="all">Todos os Status</option>
                <option value="Recebida">Recebida</option>
                <option value="Triagem">Triagem</option>
                <option value="Encaminhada">Encaminhada</option>
                <option value="Em análise">Em análise</option>
                <option value="Respondida">Respondida</option>
                <option value="Concluída">Concluída</option>
                <option value="Encerrada">Encerrada</option>
                <option value="Reaberta">Reaberta</option>
              </select>
            </div>

            <div>
              <select
                value={slaFilter}
                onChange={e => setSlaFilter(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2 text-slate-800 dark:text-slate-200"
              >
                <option value="all">Todos os Prazos SLA</option>
                <option value="🟢">🟢 Dentro do prazo</option>
                <option value="🟡">🟡 Próximo do vencimento</option>
                <option value="🔴">🔴 Vencido</option>
              </select>
            </div>
          </div>

          {/* Soft Delete Lixeira Toggle */}
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              showDeleted
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{showDeleted ? 'Sair da Lixeira' : 'Ver Ocultadas (Soft Delete)'}</span>
          </button>
        </div>
      </div>

      {/* Manifestations Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Protocolo</th>
                <th className="p-3.5">Abertura</th>
                <th className="p-3.5">Tipo</th>
                <th className="p-3.5">Manifestante</th>
                <th className="p-3.5">Setor Envolvido</th>
                <th className="p-3.5">SLA</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Nenhuma manifestação encontrada com os critérios pesquisados.
                  </td>
                </tr>
              ) : (
                filteredList.map(m => (
                  <tr
                    key={m.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="p-3.5 font-bold font-mono text-sky-700 dark:text-sky-400">
                      {m.protocol}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      {m.created_at}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        m.type === 'Reclamação' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                        m.type === 'Elogio' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        m.type === 'Denúncia' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                        'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                      }`}>
                        {m.type}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-800 dark:text-slate-200 font-medium">
                      {m.is_anonymous ? 'Anônimo' : m.complainant.name}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      {m.sector_name}
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold flex items-center gap-1 text-[11px]">
                        <span>{m.sla.traffic_light}</span>
                        <span className={
                          m.sla.traffic_light === '🟢' ? 'text-emerald-600' :
                          m.sla.traffic_light === '🟡' ? 'text-amber-600' : 'text-rose-600 font-bold'
                        }>
                          {m.sla.initial_deadline}
                        </span>
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {m.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {showDeleted ? (
                        <button
                          onClick={() => restoreManifestation(m.id)}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 ml-auto"
                        >
                          <RotateCcw className="w-3 h-3" /> Restaurar
                        </button>
                      ) : (
                        <button
                          onClick={() => onSelectManifestation(m)}
                          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 ml-auto shadow-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Detalhes
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
