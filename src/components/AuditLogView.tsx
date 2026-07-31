import React from 'react';
import { History, ShieldCheck, User, Globe, FileText, CheckCircle } from 'lucide-react';
import { useSystem } from '../context/SystemContext';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useSystem();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-16">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-6 h-6 text-sky-600" /> Trilha de Auditoria Imutável (Audit Trail)
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Registro histórico inviolável de criação, edição, despachos, assinaturas digitais e exclusões
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Data / Hora</th>
                <th className="p-3.5">Operador / Função</th>
                <th className="p-3.5">Ação Executada</th>
                <th className="p-3.5">Entidade / Registro</th>
                <th className="p-3.5">Endereço IP</th>
                <th className="p-3.5">Detalhamento da Alteração</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30">
                  <td className="p-3.5 font-mono text-slate-500">{log.timestamp}</td>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                    <div>{log.user_name}</div>
                    <div className="text-[10px] text-sky-600 dark:text-sky-400 font-normal">{log.user_role}</div>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      log.action === 'Criação' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                      log.action === 'Exclusão (Soft Delete)' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                      log.action === 'Encaminhamento' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                      'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">{log.entity_id}</td>
                  <td className="p-3.5 font-mono text-slate-400">{log.ip}</td>
                  <td className="p-3.5 text-slate-700 dark:text-slate-300 leading-relaxed">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
