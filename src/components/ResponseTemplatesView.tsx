import React, { useState, useMemo } from 'react';
import {
  FileCode,
  Plus,
  Search,
  Copy,
  Check,
  Edit2,
  Trash2,
  FileText,
  BookmarkCheck,
  Sparkles,
  Info,
  X,
  Tag
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { ResponseTemplate, ManifestationType } from '../types';

export const ResponseTemplatesView: React.FC = () => {
  const {
    responseTemplates,
    addResponseTemplate,
    updateResponseTemplate,
    deleteResponseTemplate,
    currentUser
  } = useSystem();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ResponseTemplate | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ManifestationType>('Reclamação');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');

  // Filtering
  const filteredTemplates = useMemo(() => {
    return responseTemplates.filter(t => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.content.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = selectedType === 'all' || t.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [responseTemplates, searchTerm, selectedType]);

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setTitle('');
    setType('Reclamação');
    setCategory('Tempo de Espera');
    setContent('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tpl: ResponseTemplate) => {
    setEditingTemplate(tpl);
    setTitle(tpl.title);
    setType(tpl.type);
    setCategory(tpl.category);
    setContent(tpl.content);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (editingTemplate) {
      updateResponseTemplate(editingTemplate.id, {
        title: title.trim(),
        type,
        category: category.trim() || 'Geral',
        content: content.trim()
      });
    } else {
      addResponseTemplate({
        title: title.trim(),
        type,
        category: category.trim() || 'Geral',
        content: content.trim()
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, templateTitle: string) => {
    if (confirm(`Tem certeza que deseja excluir o modelo "${templateTitle}"?`)) {
      deleteResponseTemplate(id);
    }
  };

  const handleCopy = (tpl: ResponseTemplate) => {
    navigator.clipboard.writeText(tpl.content);
    setCopiedId(tpl.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const insertVariable = (varName: string) => {
    setContent(prev => `${prev}${varName}`);
  };

  const getTypeColor = (t: ManifestationType) => {
    switch (t) {
      case 'Reclamação':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Denúncia':
        return 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'Elogio':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Sugestão':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-20">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white shadow-md">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <BookmarkCheck className="w-4 h-4" />
            <span>Gestão Institucional UPA 24h</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Modelos de Resposta Padrão</h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
            Cadastre e padronize textos de respostas formais e pareceres técnicos para agilizar o atendimento da Ouvidoria e dos Setores.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Modelo</span>
        </button>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total de Modelos</span>
          <span className="text-xl font-black text-slate-800 dark:text-white mt-0.5 block">{responseTemplates.length}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
          <span className="text-[10px] font-bold text-amber-500 uppercase block">Reclamações</span>
          <span className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5 block">
            {responseTemplates.filter(t => t.type === 'Reclamação').length}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-500 uppercase block">Elogios</span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
            {responseTemplates.filter(t => t.type === 'Elogio').length}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
          <span className="text-[10px] font-bold text-red-500 uppercase block">Denúncias</span>
          <span className="text-xl font-black text-red-600 dark:text-red-400 mt-0.5 block">
            {responseTemplates.filter(t => t.type === 'Denúncia').length}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-blue-500 uppercase block">Sugestão & Info</span>
          <span className="text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5 block">
            {responseTemplates.filter(t => t.type === 'Sugestão' || t.type === 'Informação').length}
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar modelo por título, categoria ou palavra-chave..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Type Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {['all', 'Reclamação', 'Elogio', 'Denúncia', 'Sugestão', 'Informação'].map(t => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedType === t
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t === 'all' ? 'Todos os Tipos' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <FileText className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">Nenhum modelo encontrado</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            Nenhum modelo de resposta padrão atende aos critérios da busca. Tente alterar o filtro ou cadastrar um novo modelo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(tpl => (
            <div
              key={tpl.id}
              className="flex flex-col justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-2xs group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getTypeColor(tpl.type)}`}>
                    {tpl.type}
                  </span>

                  <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-lg">
                    <Tag className="w-3 h-3 text-emerald-500" />
                    {tpl.category}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {tpl.title}
                </h3>

                {/* Template Content Box */}
                <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700/60 font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap line-clamp-6 leading-relaxed">
                  {tpl.content}
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                <button
                  onClick={() => handleCopy(tpl)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    copiedId === tpl.id
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                  }`}
                >
                  {copiedId === tpl.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Texto</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(tpl)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Editar modelo"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(tpl.id, tpl.title)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title="Excluir modelo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  <BookmarkCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    {editingTemplate ? 'Editar Modelo de Resposta' : 'Cadastrar Modelo de Resposta Padrão'}
                  </h3>
                  <p className="text-xs text-slate-400">Insira um modelo reutilizável de resposta oficial ou parecer</p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Título do Modelo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Ex: Resposta Padrão para Reclamação de Tempo de Espera"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Manifestação
                  </label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as ManifestationType)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Reclamação">Reclamação</option>
                    <option value="Denúncia">Denúncia</option>
                    <option value="Sugestão">Sugestão</option>
                    <option value="Elogio">Elogio</option>
                    <option value="Informação">Informação</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Categoria Padrão
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="Ex: Tempo de Espera, Conduta, Insumos..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Quick Variables Toolbar */}
              <div>
                <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Inserir Variáveis Dinâmicas (Substituídas Automaticamente):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '[NOME_MANIFESTANTE]',
                    '[PROTOCOLO]',
                    '[NOME_SETOR]',
                    '[DATA_OCORRENCIA]',
                    '[NOME_UNIDADE]'
                  ].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => insertVariable(v)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-[11px] font-mono font-bold hover:bg-emerald-100 transition-colors"
                    >
                      + {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Texto do Modelo <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={8}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Escreva a estrutura do texto de resposta..."
                  className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all"
                >
                  {editingTemplate ? 'Salvar Alterações' : 'Cadastrar Modelo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
