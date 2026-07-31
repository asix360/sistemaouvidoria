import React, { useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Edit,
  ToggleLeft,
  ToggleRight,
  Search,
  CheckCircle2,
  FileText,
  Clock,
  AlertCircle,
  Mail,
  Phone,
  UserCheck,
  ShieldAlert,
  GitFork
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { Sector } from '../types';

interface SectorsManagementViewProps {
  onGoToTramitacao?: (sectorId?: string) => void;
}

export const SectorsManagementView: React.FC<SectorsManagementViewProps> = ({ onGoToTramitacao }) => {
  const { sectors, manifestations, addSector, updateSector, toggleSectorActive } = useSystem();

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [responsible, setResponsible] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [slaDays, setSlaDays] = useState(7);

  // Active Non-deleted Manifestations
  const activeManifestations = useMemo(() => {
    return manifestations.filter(m => !m.deleted_at);
  }, [manifestations]);

  // Sector Stats Map
  const sectorStatsMap = useMemo(() => {
    const map: Record<string, { total: number; pendingFwd: number }> = {};

    sectors.forEach(s => {
      map[s.id] = { total: 0, pendingFwd: 0 };
    });

    activeManifestations.forEach(m => {
      if (map[m.sector_id]) {
        map[m.sector_id].total += 1;
      }
      m.forwardings.forEach(f => {
        if (map[f.sector_id]) {
          if (f.status === 'Pendente') {
            map[f.sector_id].pendingFwd += 1;
          }
        }
      });
    });

    return map;
  }, [sectors, activeManifestations]);

  // Filtered Sectors
  const filteredSectors = useMemo(() => {
    return sectors.filter(s => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.responsible_name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
      );
    });
  }, [sectors, searchQuery]);

  const handleOpenAdd = () => {
    setEditingSector(null);
    setName('');
    setCode('');
    setResponsible('');
    setEmail('');
    setPhone('');
    setSlaDays(7);
    setShowModal(true);
  };

  const handleOpenEdit = (s: Sector) => {
    setEditingSector(s);
    setName(s.name);
    setCode(s.code);
    setResponsible(s.responsible_name);
    setEmail(s.email);
    setPhone(s.phone);
    setSlaDays(s.sla_days_default);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSector) {
      updateSector(editingSector.id, {
        name,
        code,
        responsible_name: responsible,
        email,
        phone,
        sla_days_default: Number(slaDays)
      });
    } else {
      addSector({
        name,
        code,
        responsible_name: responsible,
        email,
        phone,
        sla_days_default: Number(slaDays),
        active: true
      });
    }
    setShowModal(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-20">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 text-xs font-black uppercase tracking-wider border border-sky-300 dark:border-sky-800">
              Mapeamento de Organização Interna
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-sky-600 dark:text-sky-400" />
            Cadastro e Gestão de Setores da UPA 24h
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Departamentos, chefias técnicas, ramais institucionais e prazos de resposta (SLA)
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Setor</span>
        </button>
      </div>

      {/* QUICK SUMMARY METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Setores Ativos</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
            {sectors.filter(s => s.active).length} / {sectors.length}
          </span>
          <span className="text-[10px] text-slate-400">Em operação regular</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase block">SLA Médio dos Setores</span>
          <span className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1 block">
            {Math.round(sectors.reduce((acc, s) => acc + s.sla_days_default, 0) / (sectors.length || 1))} dias
          </span>
          <span className="text-[10px] text-slate-400">Tempo médio de apuração</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Manifestações Alocadas</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
            {activeManifestations.length}
          </span>
          <span className="text-[10px] text-slate-400">Distribuídas nos setores</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Demandas Pendentes</span>
          <span className="text-2xl font-black text-amber-500 mt-1 block">
            {Object.values(sectorStatsMap).reduce((acc: number, curr: { total: number; pendingFwd: number }) => acc + curr.pendingFwd, 0)}
          </span>
          <span className="text-[10px] text-slate-400">Aguardando parecer</span>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Filtrar por nome do setor, sigla, chefe ou e-mail..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-bold hidden sm:inline-block">
          Exibindo {filteredSectors.length} de {sectors.length} setores
        </span>
      </div>

      {/* SECTORS TABLE */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 font-black border-b border-slate-200 dark:border-slate-700 uppercase text-[10px]">
              <tr>
                <th className="p-4">Sigla</th>
                <th className="p-4">Setor UPA 24h</th>
                <th className="p-4">Responsável / Chefia</th>
                <th className="p-4">Canais de Contato</th>
                <th className="p-4 text-center">Volume Total</th>
                <th className="p-4 text-center">SLA Padrão</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filteredSectors.map(s => {
                const stat = sectorStatsMap[s.id] || { total: 0, pendingFwd: 0 };

                return (
                  <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-mono font-black text-sky-600 dark:text-sky-400">
                      {s.code}
                    </td>

                    <td className="p-4">
                      <strong className="text-slate-900 dark:text-white font-bold block">{s.name}</strong>
                      {stat.pendingFwd > 0 && (
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {stat.pendingFwd} tramitação(ões) pendente(s)
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>{s.responsible_name}</span>
                      </div>
                    </td>

                    <td className="p-4 text-slate-500 space-y-0.5 text-[11px]">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{s.email || 'Não cadastrado'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{s.phone || 'Ramal interno'}</span>
                      </div>
                    </td>

                    <td className="p-4 text-center font-black text-slate-800 dark:text-slate-200">
                      {stat.total}
                    </td>

                    <td className="p-4 text-center font-extrabold text-slate-700 dark:text-slate-300">
                      {s.sla_days_default} dias
                    </td>

                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        s.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {s.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onGoToTramitacao && (
                          <button
                            type="button"
                            onClick={() => onGoToTramitacao(s.id)}
                            className="p-1.5 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950 rounded-lg flex items-center gap-1 text-[11px] font-bold"
                            title="Tramitar demandas para este setor"
                          >
                            <GitFork className="w-4 h-4" />
                            <span className="hidden md:inline">Tramitar</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                          title="Editar dados do setor"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleSectorActive(s.id)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                          title={s.active ? 'Desativar Setor' : 'Ativar Setor'}
                        >
                          {s.active ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CRUD ADD/EDIT SECTOR */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-600" />
                {editingSector ? 'Editar Setor UPA' : 'Cadastrar Novo Setor UPA'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nome do Setor <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Farmácia Central / Dispensação"
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Sigla / Código <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="Ex: FAR"
                  className="w-full text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  SLA Padrão (Dias)
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  required
                  value={slaDays}
                  onChange={e => setSlaDays(Number(e.target.value))}
                  className="w-full text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Responsável / Chefia Técnica <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={responsible}
                onChange={e => setResponsible(e.target.value)}
                placeholder="Ex: Dra. Patricia Souza (CRF 12345)"
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  E-mail do Setor
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="farmacia@upa.sus.gov.br"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Telefone / Ramal
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Ramal 105"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Salvar Setor UPA
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
