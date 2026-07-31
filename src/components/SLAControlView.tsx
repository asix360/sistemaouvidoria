import React, { useState, useMemo } from 'react';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Send,
  Eye,
  BellRing,
  Filter
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { Manifestation } from '../types';

interface SLAControlViewProps {
  onSelectManifestation: (m: Manifestation) => void;
}

export const SLAControlView: React.FC<SLAControlViewProps> = ({ onSelectManifestation }) => {
  const { manifestations } = useSystem();
  const [filterLight, setFilterLight] = useState<string>('all');

  const activeItems = useMemo(() => {
    return manifestations.filter(m => !m.deleted_at && m.status !== 'Encerrada' && m.status !== 'Concluída');
  }, [manifestations]);

  const filteredItems = useMemo(() => {
    if (filterLight === 'all') return activeItems;
    return activeItems.filter(m => m.sla.traffic_light === filterLight);
  }, [activeItems, filterLight]);

  const stats = useMemo(() => {
    const green = activeItems.filter(m => m.sla.traffic_light === '🟢').length;
    const yellow = activeItems.filter(m => m.sla.traffic_light === '🟡').length;
    const red = activeItems.filter(m => m.sla.traffic_light === '🔴').length;
    return { green, yellow, red, total: activeItems.length };
  }, [activeItems]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-6 h-6 text-sky-600" /> Painel de Controle de Prazos SLA
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Monitoramento em tempo real com semáforo de urgência (🟢 Dentro do prazo | 🟡 Próximo | 🔴 Vencido)
        </p>
      </div>

      {/* Traffic Light Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Green */}
        <button
          onClick={() => setFilterLight(filterLight === '🟢' ? 'all' : '🟢')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            filterLight === '🟢' ? 'ring-2 ring-emerald-500 shadow-md' : ''
          } bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200 uppercase tracking-wider">
              Dentro do Prazo 🟢
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-emerald-900 dark:text-emerald-100">{stats.green}</span>
            <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">SLA regular</span>
          </div>
        </button>

        {/* Yellow */}
        <button
          onClick={() => setFilterLight(filterLight === '🟡' ? 'all' : '🟡')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            filterLight === '🟡' ? 'ring-2 ring-amber-500 shadow-md' : ''
          } bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-200 uppercase tracking-wider">
              Próximo do Vencimento 🟡
            </span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-amber-900 dark:text-amber-100">{stats.yellow}</span>
            <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">≤ 3 dias restantes</span>
          </div>
        </button>

        {/* Red */}
        <button
          onClick={() => setFilterLight(filterLight === '🔴' ? 'all' : '🔴')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            filterLight === '🔴' ? 'ring-2 ring-rose-500 shadow-md' : ''
          } bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 dark:text-rose-200 uppercase tracking-wider">
              Prazo Vencido 🔴
            </span>
            <AlertTriangle className="w-5 h-5 text-rose-600 animate-bounce" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-rose-900 dark:text-rose-100">{stats.red}</span>
            <span className="text-xs text-rose-700 dark:text-rose-300 font-medium">Cobrança prioritária</span>
          </div>
        </button>
      </div>

      {/* SLA Items Cards List */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Manifestações em Acompanhamento ({filteredItems.length})
        </h2>

        {filteredItems.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-400 text-xs">
            Nenhuma manifestação pendente para o filtro selecionado.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map(m => (
              <div
                key={m.id}
                className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold font-mono text-sky-700 dark:text-sky-400 text-sm">
                      {m.protocol}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      m.sla.traffic_light === '🟢' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                      m.sla.traffic_light === '🟡' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                      'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {m.sla.traffic_light} {m.sla.status_label}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 font-medium">
                    {m.created_at}
                  </span>
                </div>

                <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">
                  {m.description}
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500">
                  <div>
                    <span className="block text-[10px] text-slate-400">Setor Envolvido:</span>
                    <strong className="text-slate-700 dark:text-slate-300">{m.sector_name}</strong>
                  </div>

                  <div>
                    <span className="block text-[10px] text-slate-400">Prazo Final:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{m.sla.initial_deadline}</strong>
                  </div>

                  <button
                    onClick={() => onSelectManifestation(m)}
                    className="p-2 bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 text-sky-700 dark:text-sky-300 rounded-xl font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
