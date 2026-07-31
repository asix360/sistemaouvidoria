import React, { useState } from 'react';
import { Users, Plus, Edit, ToggleLeft, ToggleRight, Stethoscope } from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { Professional } from '../types';

export const ProfessionalsManagementView: React.FC = () => {
  const { professionals, sectors, addProfessional, updateProfessional, toggleProfessionalActive } = useSystem();

  const [showModal, setShowModal] = useState(false);
  const [editingProf, setEditingProf] = useState<Professional | null>(null);

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [registration, setRegistration] = useState('');
  const [sectorId, setSectorId] = useState(sectors[0]?.id || 'sec_4');
  const [shift, setShift] = useState<'Manhã' | 'Tarde' | 'Noite' | 'Plantão 12h' | 'Plantão 24h'>('Plantão 12h');
  const [team, setTeam] = useState('');

  const handleOpenAdd = () => {
    setEditingProf(null);
    setName('');
    setRole('');
    setRegistration('');
    setSectorId(sectors[0]?.id || 'sec_4');
    setShift('Plantão 12h');
    setTeam('');
    setShowModal(true);
  };

  const handleOpenEdit = (p: Professional) => {
    setEditingProf(p);
    setName(p.name);
    setRole(p.role);
    setRegistration(p.registration);
    setSectorId(p.sector_id);
    setShift(p.shift);
    setTeam(p.team);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sectorObj = sectors.find(s => s.id === sectorId);

    if (editingProf) {
      updateProfessional(editingProf.id, {
        name,
        role,
        registration,
        sector_id: sectorId,
        sector_name: sectorObj ? sectorObj.name : 'Médicos',
        shift,
        team
      });
    } else {
      addProfessional({
        name,
        role,
        registration,
        sector_id: sectorId,
        sector_name: sectorObj ? sectorObj.name : 'Médicos',
        shift,
        team,
        active: true
      });
    }
    setShowModal(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-sky-600" /> Corpo Profissional e Equipes da UPA
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cadastro de médicos (CRM), enfermeiros (COREN) e servidores citados em ouvidorias
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Cadastrar Profissional
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700 uppercase">
              <tr>
                <th className="p-3.5">Nome</th>
                <th className="p-3.5">Cargo / Especialidade</th>
                <th className="p-3.5">Registro (CRM/COREN)</th>
                <th className="p-3.5">Setor</th>
                <th className="p-3.5">Plantão / Equipe</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {professionals.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-purple-600 shrink-0" />
                    {p.name}
                  </td>
                  <td className="p-3.5 text-slate-700 dark:text-slate-300">{p.role}</td>
                  <td className="p-3.5 font-mono text-sky-600 dark:text-sky-400">{p.registration}</td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">{p.sector_name}</td>
                  <td className="p-3.5 text-slate-500">
                    <div>{p.shift}</div>
                    <div className="text-[10px]">{p.team}</div>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {p.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleProfessionalActive(p.id)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      >
                        {p.active ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingProf ? 'Editar Profissional' : 'Cadastrar Profissional'}
            </h3>

            <div>
              <label className="block text-xs font-semibold mb-1">Nome Completo *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Dr. Fernando Dias"
                className="w-full text-xs rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Cargo / Função *</label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="Ex: Clínico Geral"
                  className="w-full text-xs rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Registro (CRM/COREN)</label>
                <input
                  type="text"
                  value={registration}
                  onChange={e => setRegistration(e.target.value)}
                  placeholder="Ex: CRM-SP 148.902"
                  className="w-full text-xs rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Setor Principal *</label>
              <select
                value={sectorId}
                onChange={e => setSectorId(e.target.value)}
                className="w-full text-xs rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-900"
              >
                {sectors.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Turno / Plantão</label>
                <select
                  value={shift}
                  onChange={e => setShift(e.target.value as any)}
                  className="w-full text-xs rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-900"
                >
                  <option value="Manhã">Manhã</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noite">Noite</option>
                  <option value="Plantão 12h">Plantão 12h</option>
                  <option value="Plantão 24h">Plantão 24h</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Equipe</label>
                <input
                  type="text"
                  value={team}
                  onChange={e => setTeam(e.target.value)}
                  placeholder="Ex: Equipe Alpha"
                  className="w-full text-xs rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-sky-600 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Salvar Profissional
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
