import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Award,
  TrendingUp,
  Download,
  Printer,
  Calendar,
  Building2,
  Users,
  ThumbsUp,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  PieChart,
  Activity,
  ShieldCheck,
  FileText,
  HeartHandshake,
  MessageSquare,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { exportToCSV, exportManifestationsToPDF } from '../utils/exportHelpers';

export const ReportsView: React.FC = () => {
  const { manifestations, sectors, professionals, settings, currentUser } = useSystem();

  const [period, setPeriod] = useState<string>('all');
  const [selectedTab, setSelectedTab] = useState<'geral' | 'setores' | 'profissionais' | 'sla'>('geral');

  // Active non-deleted manifestations
  const activeData = useMemo(() => {
    return manifestations.filter(m => !m.deleted_at);
  }, [manifestations]);

  // Overall KPIs
  const kpis = useMemo(() => {
    const total = activeData.length;
    const resolved = activeData.filter(m => m.status === 'Concluída' || m.responses.some(r => r.is_final)).length;
    const answered = activeData.filter(m => m.responses.length > 0).length;
    const pending = total - answered;

    const complaints = activeData.filter(m => m.type === 'Reclamação').length;
    const praises = activeData.filter(m => m.type === 'Elogio').length;
    const denunciations = activeData.filter(m => m.type === 'Denúncia').length;
    const suggestions = activeData.filter(m => m.type === 'Sugestão').length;
    const requests = activeData.filter(m => m.type === 'Solicitação').length;

    // SLA compliance
    const withinSla = activeData.filter(m => m.sla.status_label.includes('No Prazo') || m.sla.traffic_light === '🟢').length;
    const slaRate = total > 0 ? Math.round((withinSla / total) * 100) : 100;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 100;

    return {
      total,
      resolved,
      answered,
      pending,
      complaints,
      praises,
      denunciations,
      suggestions,
      requests,
      slaRate,
      resolutionRate
    };
  }, [activeData]);

  // Sector-by-Sector In-depth Analytics
  const sectorAnalytics = useMemo(() => {
    return sectors.map(sec => {
      const secManifestations = activeData.filter(m => m.sector_id === sec.id || m.sector_name === sec.name);
      const total = secManifestations.length;
      const complaints = secManifestations.filter(m => m.type === 'Reclamação' || m.type === 'Denúncia').length;
      const praises = secManifestations.filter(m => m.type === 'Elogio').length;
      const resolved = secManifestations.filter(m => m.status === 'Concluída' || m.responses.length > 0).length;
      const resolutionPct = total > 0 ? Math.round((resolved / total) * 100) : 100;

      return {
        id: sec.id,
        name: sec.name,
        code: sec.code,
        responsible: sec.responsible_name,
        total,
        complaints,
        praises,
        resolved,
        resolutionPct
      };
    }).sort((a, b) => b.total - a.total);
  }, [sectors, activeData]);

  // Ranking: Professionals cited
  const professionalRanking = useMemo(() => {
    const counts: Record<string, { total: number; praises: number; complaints: number; role: string }> = {};
    
    activeData.forEach(m => {
      if (m.professional?.name) {
        const key = m.professional.name;
        if (!counts[key]) {
          counts[key] = { total: 0, praises: 0, complaints: 0, role: m.professional.role };
        }
        counts[key].total += 1;
        if (m.type === 'Elogio') counts[key].praises += 1;
        if (m.type === 'Reclamação' || m.type === 'Denúncia') counts[key].complaints += 1;
      }
    });

    return Object.entries(counts)
      .map(([name, obj]) => ({ name, role: obj.role, total: obj.total, praises: obj.praises, complaints: obj.complaints }))
      .sort((a, b) => b.total - a.total);
  }, [activeData]);

  // Export CSV
  const handleExportReportCSV = () => {
    const rows = sectorAnalytics.map(s => ({
      Setor_UPA: s.name,
      Codigo: s.code,
      Responsavel: s.responsible,
      Total_Manifestacoes: s.total,
      Reclamacoes_Denuncias: s.complaints,
      Elogios: s.praises,
      Taxa_Resolucao_Pct: `${s.resolutionPct}%`
    }));
    exportToCSV(rows, `Relatorio_Estatistico_UPA24h_${new Date().toISOString().substring(0, 10)}`);
  };

  // Export PDF Report
  const handleExportPDFReport = () => {
    exportManifestationsToPDF(
      activeData,
      {
        period,
        generatedBy: `${currentUser.name} (${currentUser.role})`
      },
      settings
    );
  };

  // Print Official Report
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-20">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-xs font-black uppercase tracking-wider border border-blue-300 dark:border-blue-800">
              Relatório Gerencial & Inteligência UPA 24h
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-blue-600 dark:text-sky-400" />
            Estatísticas e Análise do Sistema de Ouvidoria
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Indicadores de desempenho, taxa de solução do Direito de Resposta e controle do SUS
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportPDFReport}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Exportar Relatório PDF</span>
          </button>

          <button
            type="button"
            onClick={handlePrintReport}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4 text-blue-600" />
            <span>Imprimir</span>
          </button>

          <button
            type="button"
            onClick={handleExportReportCSV}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS OVERVIEW GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Total Registrado</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{kpis.total}</div>
          <span className="text-[10px] text-slate-400 font-semibold block">Ouvidorias do Cidadão</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Direito de Resposta</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{kpis.resolutionRate}%</div>
          <span className="text-[10px] text-slate-400 font-semibold block">{kpis.answered} com resposta oficial</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Conformidade SLA</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">{kpis.slaRate}%</div>
          <span className="text-[10px] text-slate-400 font-semibold block">Dentro do prazo da Lei</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Elogios & Acolhimento</span>
            <ThumbsUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">{kpis.praises}</div>
          <span className="text-[10px] text-slate-400 font-semibold block">Agradecimentos da equipe</span>
        </div>

      </div>

      {/* MANIFESTATION TYPE DISTRIBUTION METER */}
      <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-600" />
            Distribuição por Tipo de Ouvidoria
          </h3>
          <span className="text-xs text-slate-400 font-bold">{kpis.total} Total</span>
        </div>

        {/* Visual Multi-color Bar */}
        <div className="h-4 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${kpis.total > 0 ? (kpis.complaints / kpis.total) * 100 : 0}%` }}
            className="bg-red-500 h-full transition-all"
            title={`Reclamações: ${kpis.complaints}`}
          />
          <div
            style={{ width: `${kpis.total > 0 ? (kpis.praises / kpis.total) * 100 : 0}%` }}
            className="bg-emerald-500 h-full transition-all"
            title={`Elogios: ${kpis.praises}`}
          />
          <div
            style={{ width: `${kpis.total > 0 ? (kpis.denunciations / kpis.total) * 100 : 0}%` }}
            className="bg-rose-700 h-full transition-all"
            title={`Denúncias: ${kpis.denunciations}`}
          />
          <div
            style={{ width: `${kpis.total > 0 ? (kpis.suggestions / kpis.total) * 100 : 0}%` }}
            className="bg-amber-500 h-full transition-all"
            title={`Sugestões: ${kpis.suggestions}`}
          />
          <div
            style={{ width: `${kpis.total > 0 ? (kpis.requests / kpis.total) * 100 : 0}%` }}
            className="bg-blue-600 h-full transition-all"
            title={`Solicitações: ${kpis.requests}`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-semibold pt-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">Reclamações ({kpis.complaints})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">Elogios ({kpis.praises})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-700 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">Denúncias ({kpis.denunciations})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">Sugestões ({kpis.suggestions})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">Solicitações ({kpis.requests})</span>
          </div>
        </div>
      </div>

      {/* SECTOR PERFORMANCE TABLE */}
      <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              Análise Detalhada de Desempenho por Setor da UPA 24h
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Acompanhamento de volume, resolutividade de resposta e demanda interna por ala do Pronto Atendimento.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-extrabold uppercase text-[10px]">
                <th className="py-3 px-3">Setor UPA</th>
                <th className="py-3 px-3">Responsável</th>
                <th className="py-3 px-3 text-center">Volume Total</th>
                <th className="py-3 px-3 text-center">Reclamações</th>
                <th className="py-3 px-3 text-center">Elogios</th>
                <th className="py-3 px-3 text-center">Taxa de Resposta (%)</th>
                <th className="py-3 px-3 text-right">Status do Setor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {sectorAnalytics.map(sec => (
                <tr key={sec.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                    <span className="block">{sec.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">{sec.code}</span>
                  </td>

                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    {sec.responsible || 'Coordenador UPA'}
                  </td>

                  <td className="py-3 px-3 text-center font-black text-slate-800 dark:text-slate-200">
                    {sec.total}
                  </td>

                  <td className="py-3 px-3 text-center font-bold text-rose-600 dark:text-rose-400">
                    {sec.complaints}
                  </td>

                  <td className="py-3 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                    {sec.praises}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <div className="inline-flex items-center gap-1.5 font-bold">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        sec.resolutionPct >= 80 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {sec.resolutionPct}%
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-right">
                    {sec.resolutionPct >= 80 ? (
                      <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase">
                        ✓ Desempenho Adequado
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase">
                        ! Atenção Requerida
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RANKING PROFESSIONALS CITED */}
      <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            Rankings de Profissionais Citados nas Ouvidorias
          </h3>
          <span className="text-xs text-slate-400">Médicos, Enfermeiros e Recepção</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {professionalRanking.length === 0 ? (
            <p className="text-xs text-slate-400 italic p-4">Nenhum profissional citado especificamente no período.</p>
          ) : (
            professionalRanking.map((p, idx) => (
              <div key={p.name} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-extrabold text-xs flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </span>
                  <div>
                    <strong className="text-slate-900 dark:text-white block">{p.name}</strong>
                    <span className="text-[10px] text-slate-400">{p.role}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-bold text-[11px]">
                  <span className="text-emerald-600 dark:text-emerald-400">{p.praises} elogio(s)</span>
                  <span>•</span>
                  <span className="text-rose-600 dark:text-rose-400">{p.complaints} citação(ões)</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
