import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Send,
  MessageSquare,
  RotateCcw,
  Calendar,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { ActiveTab } from './Sidebar';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab }) => {
  const { manifestations, sectors, setSearchTerm } = useSystem();

  // Filters state
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Active non-deleted manifestations
  const activeManifestations = useMemo(() => {
    return manifestations.filter(m => !m.deleted_at);
  }, [manifestations]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return activeManifestations.filter(m => {
      if (selectedYear !== 'all' && !m.created_at.startsWith(selectedYear)) return false;
      if (selectedMonth !== 'all') {
        const mMonth = m.created_at.split('-')[1];
        if (mMonth !== selectedMonth) return false;
      }
      if (selectedSector !== 'all' && m.sector_id !== selectedSector && m.sector_name !== selectedSector) return false;
      if (selectedType !== 'all' && m.type !== selectedType) return false;
      if (selectedStatus !== 'all' && m.status !== selectedStatus) return false;
      return true;
    });
  }, [activeManifestations, selectedYear, selectedMonth, selectedSector, selectedType, selectedStatus]);

  // Calculated Indicators
  const kpis = useMemo(() => {
    const total = filteredData.length;
    const abertas = filteredData.filter(m => m.status === 'Recebida' || m.status === 'Triagem').length;
    const emAnalise = filteredData.filter(m => m.status === 'Em análise' || m.status === 'Classificada').length;
    const encaminhadas = filteredData.filter(m => m.status === 'Encaminhada').length;
    const respondidas = filteredData.filter(m => m.status === 'Respondida').length;
    const encerradas = filteredData.filter(m => m.status === 'Encerrada' || m.status === 'Concluída').length;
    const pendentes = filteredData.filter(m => m.status === 'Aguardando retorno').length;
    const reabertas = filteredData.filter(m => m.status === 'Reaberta').length;

    const dentroPrazo = filteredData.filter(m => m.sla.traffic_light === '🟢').length;
    const foraPrazo = filteredData.filter(m => m.sla.traffic_light === '🔴').length;

    return {
      total,
      abertas,
      emAnalise,
      encaminhadas,
      respondidas,
      encerradas,
      pendentes,
      reabertas,
      dentroPrazo,
      foraPrazo
    };
  }, [filteredData]);

  // Data for Type Pie Chart
  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach(m => {
      counts[m.type] = (counts[m.type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const PIE_COLORS: Record<string, string> = {
    'Reclamação': '#f43f5e', // rose
    'Denúncia': '#eab308',   // amber
    'Sugestão': '#3b82f6',   // blue
    'Elogio': '#10b981',     // emerald
    'Solicitação': '#8b5cf6', // violet
    'Informação': '#06b6d4'   // cyan
  };

  // Data for Sector Bar Chart
  const sectorBarData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach(m => {
      const secName = m.sector_name || 'Não classificado';
      counts[secName] = (counts[secName] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([sector, quantidade]) => ({ sector, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 8);
  }, [filteredData]);

  // Data for Line Chart (Monthly trend)
  const monthlyLineData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const counts = new Array(12).fill(0);
    const elogios = new Array(12).fill(0);

    filteredData.forEach(m => {
      const parts = m.created_at.split('-');
      if (parts.length >= 2) {
        const mIdx = parseInt(parts[1], 10) - 1;
        if (mIdx >= 0 && mIdx < 12) {
          counts[mIdx]++;
          if (m.type === 'Elogio') elogios[mIdx]++;
        }
      }
    });

    return months.map((mes, idx) => ({
      mes,
      Total: counts[idx],
      Elogios: elogios[idx]
    }));
  }, [filteredData]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Dashboard da Ouvidoria UPA
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visão consolidada de manifestações, prazos SLA e indicadores de saúde pública (SUS)
          </p>
        </div>

        <button
          onClick={() => setActiveTab('nova')}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-sky-600/20 transition-all self-start md:self-auto"
        >
          <FileText className="w-4 h-4" /> Registrar Manifestação
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
          <Filter className="w-4 h-4 text-sky-600" />
          Filtros de Pesquisa e Indicadores
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Year */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Ano
            </label>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="all">Todos os Anos</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>

          {/* Month */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Mês
            </label>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="all">Todos os Meses</option>
              <option value="01">Janeiro</option>
              <option value="02">Fevereiro</option>
              <option value="03">Março</option>
              <option value="04">Abril</option>
              <option value="05">Maio</option>
              <option value="06">Junho</option>
              <option value="07">Julho</option>
              <option value="08">Agosto</option>
              <option value="09">Setembro</option>
              <option value="10">Outubro</option>
              <option value="11">Novembro</option>
              <option value="12">Dezembro</option>
            </select>
          </div>

          {/* Sector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Setor UPA
            </label>
            <select
              value={selectedSector}
              onChange={e => setSelectedSector(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="all">Todos os Setores</option>
              {sectors.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Tipo
            </label>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="all">Todos os Tipos</option>
              <option value="Reclamação">Reclamação</option>
              <option value="Denúncia">Denúncia</option>
              <option value="Sugestão">Sugestão</option>
              <option value="Elogio">Elogio</option>
              <option value="Solicitação">Solicitação</option>
              <option value="Informação">Informação</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
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
        </div>
      </div>

      {/* SLA Alert Banner if Overdue items exist */}
      {kpis.foraPrazo > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500 text-white rounded-xl shrink-0">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
                Atenção: Existe(m) {kpis.foraPrazo} manifestação(ões) com prazo SLA vencido!
              </p>
              <p className="text-[11px] text-rose-700 dark:text-rose-300">
                Recomenda-se cobrar resposta imediata dos setores responsáveis para evitar apontamento de auditoria SUS.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('sla')}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shrink-0 transition-colors"
          >
            Ver Painel SLA
          </button>
        </div>
      )}

      {/* KPI Indicator Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Total Geral</span>
            <FileText className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{kpis.total}</span>
            <span className="text-[10px] text-slate-400 font-medium">Cadastrados</span>
          </div>
        </div>

        {/* Abertas */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Abertas / Triagem</span>
            <FolderOpen className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{kpis.abertas}</span>
            <span className="text-[10px] text-amber-600/80 font-medium">Aguardando</span>
          </div>
        </div>

        {/* Em Análise */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Em Análise</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{kpis.emAnalise}</span>
            <span className="text-[10px] text-blue-600/80 font-medium">Em apuração</span>
          </div>
        </div>

        {/* Encaminhadas */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Encaminhadas</span>
            <Send className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">{kpis.encaminhadas}</span>
            <span className="text-[10px] text-purple-600/80 font-medium">Nos setores</span>
          </div>
        </div>

        {/* Respondidas / Concluídas */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Respondidas</span>
            <MessageSquare className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{kpis.respondidas}</span>
            <span className="text-[10px] text-emerald-600/80 font-medium">Com parecer</span>
          </div>
        </div>

        {/* Encerradas */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Encerradas</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-teal-600 dark:text-teal-400">{kpis.encerradas}</span>
            <span className="text-[10px] text-teal-600/80 font-medium">Finalizadas</span>
          </div>
        </div>

        {/* Dentro do Prazo */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Dentro do Prazo 🟢</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{kpis.dentroPrazo}</span>
            <span className="text-[10px] text-emerald-600/80 font-medium">SLA ok</span>
          </div>
        </div>

        {/* Fora do Prazo */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Fora do Prazo 🔴</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">{kpis.foraPrazo}</span>
            <span className="text-[10px] text-rose-600/80 font-medium">Vencidos</span>
          </div>
        </div>

        {/* Pendentes */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Pendentes</span>
            <Clock className="w-4 h-4 text-orange-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-orange-600 dark:text-orange-400">{kpis.pendentes}</span>
            <span className="text-[10px] text-orange-600/80 font-medium">Aguardando</span>
          </div>
        </div>

        {/* Reabertas */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Reabertas</span>
            <RotateCcw className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{kpis.reabertas}</span>
            <span className="text-[10px] text-indigo-600/80 font-medium">Reincidentes</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart: Distribution by Type */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-sky-600" /> Distribuição por Tipo de Manifestação
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Percentual SUS</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Distribution by Sector */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" /> Volume de Demandas por Setor UPA
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Top 8 Setores</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorBarData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="sector" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#0284c7" radius={[6, 6, 0, 0]} name="Ocorrências" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Line Evolution Chart */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" /> Evolução Mensal das Manifestações ({selectedYear})
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Comparativo mensal entre total de chamados e número de elogios recebidos</p>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyLineData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Total" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 4 }} name="Total de Demandas" />
              <Line type="monotone" dataKey="Elogios" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} name="Elogios da População" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
