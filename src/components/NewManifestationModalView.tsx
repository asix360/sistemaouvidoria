import React, { useState } from 'react';
import {
  FileText,
  User,
  MapPin,
  Building2,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldAlert,
  EyeOff,
  Sparkles,
  Upload,
  X,
  FileCode,
  Music,
  Image as ImageIcon
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import {
  ManifestationType,
  Priority,
  OriginChannel,
  RiskClassification,
  Attachment
} from '../types';
import { ActiveTab } from './Sidebar';
import { useToast } from '../context/ToastContext';

interface NewManifestationModalViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const NewManifestationModalView: React.FC<NewManifestationModalViewProps> = ({ setActiveTab }) => {
  const { sectors, professionals, addManifestation, settings } = useSystem();
  const { notifyError, notifySuccess } = useToast();

  // Step state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submittedProtocol, setSubmittedProtocol] = useState<string | null>(null);

  // Form State
  const [type, setType] = useState<ManifestationType>('Reclamação');
  const [priority, setPriority] = useState<Priority>('Média');
  const [origin, setOrigin] = useState<OriginChannel>('Balcão Presencial');
  const [category, setCategory] = useState<string>('Atendimento Geral');
  const [subcategory, setSubcategory] = useState<string>('Demora na Recepção');
  const [description, setDescription] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isConfidential, setIsConfidential] = useState<boolean>(false);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  // Complainant state
  const [complainantName, setComplainantName] = useState<string>('');
  const [complainantCpf, setComplainantCpf] = useState<string>('');
  const [complainantSusCard, setComplainantSusCard] = useState<string>('');
  const [complainantPhone, setComplainantPhone] = useState<string>('');
  const [complainantWhatsapp, setComplainantWhatsapp] = useState<string>('');
  const [complainantEmail, setComplainantEmail] = useState<string>('');
  const [complainantCity, setComplainantCity] = useState<string>('São Paulo');
  const [complainantAddress, setComplainantAddress] = useState<string>('');
  const [complainantNeighborhood, setComplainantNeighborhood] = useState<string>('');
  const [complainantCep, setComplainantCep] = useState<string>('');
  const [complainantGender, setComplainantGender] = useState<'Masculino' | 'Feminino' | 'Outro' | 'Não informado'>('Não informado');
  const [complainantBirthDate, setComplainantBirthDate] = useState<string>('');

  // Occurrence state
  const todayStr = new Date().toISOString().substring(0, 10);
  const nowTimeStr = new Date().toTimeString().substring(0, 5);

  const [occDate, setOccDate] = useState<string>(todayStr);
  const [occTime, setOccTime] = useState<string>(nowTimeStr);
  const [occLocation, setOccLocation] = useState<string>('Recepção');
  const [occRisk, setOccRisk] = useState<RiskClassification>('Verde');
  const [occNotes, setOccNotes] = useState<string>('');

  // Sector & Professional
  const [selectedSectorId, setSelectedSectorId] = useState<string>(sectors[0]?.id || 'sec_1');
  const [profName, setProfName] = useState<string>('');
  const [profRole, setProfRole] = useState<string>('');
  const [profRegistration, setProfRegistration] = useState<string>('');
  const [profShift, setProfShift] = useState<'Manhã' | 'Tarde' | 'Noite' | 'Plantão 12h' | 'Plantão 24h'>('Plantão 12h');
  const [profTeam, setProfTeam] = useState<string>('');

  // Attachments
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Simulated File Upload Helper
  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'photo' | 'pdf' | 'audio') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAtts: Attachment[] = Array.from(files).map((file: File, idx) => ({
      id: `att_${Date.now()}_${idx}`,
      name: file.name,
      type: fileType,
      url: URL.createObjectURL(file),
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    }));

    setAttachments(prev => [...prev, ...newAtts]);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedSectorObj = sectors.find(s => s.id === selectedSectorId);

    const created = addManifestation({
      created_time: nowTimeStr,
      type,
      priority,
      status: 'Recebida',
      origin,
      category,
      subcategory,
      description,
      notes,
      is_confidential: isConfidential,
      is_anonymous: isAnonymous,
      complainant: {
        name: isAnonymous ? 'Anônimo' : complainantName || 'Cidadão Não Identificado',
        cpf: isAnonymous ? '' : complainantCpf,
        sus_card: isAnonymous ? '' : complainantSusCard,
        phone: isAnonymous ? '' : complainantPhone,
        whatsapp: isAnonymous ? '' : complainantWhatsapp,
        email: isAnonymous ? '' : complainantEmail,
        city: complainantCity,
        address: isAnonymous ? '' : complainantAddress,
        neighborhood: isAnonymous ? '' : complainantNeighborhood,
        cep: isAnonymous ? '' : complainantCep,
        gender: complainantGender,
        birth_date: complainantBirthDate
      },
      occurrence: {
        date: occDate,
        time: occTime,
        upa_name: settings.upa_name,
        location_room: occLocation,
        classification_risk: occRisk,
        notes: occNotes
      },
      sector_id: selectedSectorId,
      sector_name: selectedSectorObj ? selectedSectorObj.name : 'Recepção',
      professional: profName ? {
        name: profName,
        role: profRole || 'Profissional da Saúde',
        registration: profRegistration || 'N/A',
        shift: profShift,
        team: profTeam || 'Equipe de Plantão'
      } : undefined,
      attachments
    });

    setSubmittedProtocol(created.protocol);
    notifySuccess('Ouvidoria Registrada com Sucesso!', `Protocolo gerado: ${created.protocol}`);
  };

  if (submittedProtocol) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-6 animate-in fade-in zoom-in-95">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Manifestação Cadastrada com Sucesso!
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            O comprovante de ouvidoria foi gerado e inserido no fluxo de prazos SLA.
          </p>
        </div>

        <div className="p-6 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-2xl">
          <span className="text-xs font-semibold text-sky-700 dark:text-sky-300 uppercase tracking-wider block mb-1">
            Número de Protocolo Oficial
          </span>
          <span className="text-3xl font-extrabold text-sky-900 dark:text-sky-100 tracking-tight font-mono">
            {submittedProtocol}
          </span>
        </div>

        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => {
              setSubmittedProtocol(null);
              setCurrentStep(1);
              setDescription('');
              setComplainantName('');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
          >
            Cadastrar Outra
          </button>
          <button
            onClick={() => setActiveTab('lista')}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
          >
            Ir para Lista de Manifestações
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-sky-600" /> Cadastro de Nova Manifestação
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Preencha os dados do atendimento na Ouvidoria da {settings.upa_name}
        </p>
      </div>

      {/* Stepper Header */}
      <div className="grid grid-cols-4 gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
        {[
          { step: 1, title: '1. Classificação', icon: FileText },
          { step: 2, title: '2. Manifestante', icon: User },
          { step: 3, title: '3. Ocorrência', icon: MapPin },
          { step: 4, title: '4. Anexos e Envio', icon: Paperclip }
        ].map(s => {
          const Icon = s.icon;
          const isDone = currentStep > s.step;
          const isCurrent = currentStep === s.step;
          return (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all ${
                isCurrent
                  ? 'bg-sky-600 text-white shadow-md'
                  : isDone
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate hidden sm:inline">{s.title}</span>
            </button>
          );
        })}
      </div>

      {/* Form Steps */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
        {/* STEP 1: Classification & Core details */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
              <FileText className="w-4 h-4 text-sky-600" /> Tipo e Classificação do Atendimento
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de Manifestação *
                </label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as ManifestationType)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500"
                >
                  <option value="Reclamação">Reclamação</option>
                  <option value="Denúncia">Denúncia</option>
                  <option value="Sugestão">Sugestão</option>
                  <option value="Elogio">Elogio</option>
                  <option value="Informação">Informação</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Prioridade SLA *
                </label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as Priority)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500"
                >
                  <option value="Baixa">Baixa (15 dias)</option>
                  <option value="Média">Média (10 dias)</option>
                  <option value="Alta">Alta (7 dias)</option>
                  <option value="Urgente">Urgente (3 a 5 dias)</option>
                </select>
              </div>

              {/* Origin Channel */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Canal de Entrada *
                </label>
                <select
                  value={origin}
                  onChange={e => setOrigin(e.target.value as OriginChannel)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500"
                >
                  <option value="Balcão Presencial">Balcão Presencial</option>
                  <option value="Caixa de Sugestões">Caixa de Sugestões</option>
                  <option value="WhatsApp">WhatsApp OuvSUS</option>
                  <option value="E-mail">E-mail Ouvidoria</option>
                  <option value="Telefone 136 / OuvSUS">Telefone 136 / OuvSUS</option>
                  <option value="Site / Portal UPA">Site / Portal UPA</option>
                </select>
              </div>
            </div>

            {/* Category & Subcategory */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={e => {
                    setCategory(e.target.value);
                    const subList = settings.subcategories[e.target.value] || [];
                    if (subList.length > 0) setSubcategory(subList[0]);
                  }}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100"
                >
                  {settings.categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subcategoria
                </label>
                <select
                  value={subcategory}
                  onChange={e => setSubcategory(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100"
                >
                  {(settings.subcategories[category] || ['Geral']).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Privacy Flags */}
            <div className="flex flex-wrap items-center gap-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={isConfidential}
                  onChange={e => setIsConfidential(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                />
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                Manifestação Sigilosa (Acesso restrito à Ouvidoria)
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={e => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                />
                <EyeOff className="w-4 h-4 text-slate-500" />
                Manifestação Anônima (Oculta todos os dados pessoais do usuário)
              </label>
            </div>

            {/* Detailed Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Descrição Detalhada do Relato *
              </label>
              <textarea
                rows={5}
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Descreva minuciosamente o ocorrido, informando o contexto, fatos, horários, acompanhantes e pedidos..."
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Complainant Data */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
              <User className="w-4 h-4 text-sky-600" /> Identificação do Cidadão / Manifestante
            </h2>

            {isAnonymous ? (
              <div className="p-6 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-center space-y-2">
                <EyeOff className="w-8 h-8 text-amber-600 mx-auto" />
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Modo Anônimo Ativado
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-300 max-w-md mx-auto">
                  Os dados pessoais foram omitidos conforme solicitação de anonimato. A manifestação será registrada e investigada normalmente mantendo o sigilo total da fonte.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={complainantName}
                      onChange={e => setComplainantName(e.target.value)}
                      placeholder="Ex: Maria Aparecida da Silva"
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      CPF
                    </label>
                    <input
                      type="text"
                      value={complainantCpf}
                      onChange={e => setComplainantCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Cartão SUS
                    </label>
                    <input
                      type="text"
                      value={complainantSusCard}
                      onChange={e => setComplainantSusCard(e.target.value)}
                      placeholder="000 0000 0000 0000"
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Telefone
                    </label>
                    <input
                      type="text"
                      value={complainantPhone}
                      onChange={e => setComplainantPhone(e.target.value)}
                      placeholder="(11) 90000-0000"
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      WhatsApp
                    </label>
                    <input
                      type="text"
                      value={complainantWhatsapp}
                      onChange={e => setComplainantWhatsapp(e.target.value)}
                      placeholder="(11) 90000-0000"
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={complainantEmail}
                      onChange={e => setComplainantEmail(e.target.value)}
                      placeholder="nome@email.com"
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={complainantCity}
                      onChange={e => setComplainantCity(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Bairro
                    </label>
                    <input
                      type="text"
                      value={complainantNeighborhood}
                      onChange={e => setComplainantNeighborhood(e.target.value)}
                      placeholder="Ex: Bela Vista"
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Sexo
                    </label>
                    <select
                      value={complainantGender}
                      onChange={e => setComplainantGender(e.target.value as any)}
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5"
                    >
                      <option value="Não informado">Não informado</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      value={complainantBirthDate}
                      onChange={e => setComplainantBirthDate(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Occurrence Details & Professional Involved */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
              <MapPin className="w-4 h-4 text-sky-600" /> Dados da Ocorrência e Local na UPA
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Data do Ocorrido
                </label>
                <input
                  type="date"
                  value={occDate}
                  onChange={e => setOccDate(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Hora Aproximada
                </label>
                <input
                  type="time"
                  value={occTime}
                  onChange={e => setOccTime(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Local / Sala na UPA
                </label>
                <select
                  value={occLocation}
                  onChange={e => setOccLocation(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5"
                >
                  <option value="Recepção">Recepção</option>
                  <option value="Acolhimento">Acolhimento</option>
                  <option value="Triagem / Classificação de Risco">Triagem / Classificação de Risco</option>
                  <option value="Consultório Médico 1">Consultório Médico 1</option>
                  <option value="Consultório Médico 2">Consultório Médico 2</option>
                  <option value="Sala de Medicamentos">Sala de Medicamentos</option>
                  <option value="Sala de Emergência / Vermelha">Sala de Emergência / Vermelha</option>
                  <option value="Farmácia Central">Farmácia Central</option>
                  <option value="Laboratório">Laboratório</option>
                  <option value="Radiologia / Raio-X">Radiologia / Raio-X</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Classificação de Risco
                </label>
                <select
                  value={occRisk}
                  onChange={e => setOccRisk(e.target.value as RiskClassification)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5"
                >
                  <option value="Azul">🔵 Azul (Não urgente)</option>
                  <option value="Verde">🟢 Verde (Pouco urgente)</option>
                  <option value="Amarelo">🟡 Amarelo (Urgente)</option>
                  <option value="Laranja">🟠 Laranja (Muito urgente)</option>
                  <option value="Vermelho">🔴 Vermelho (Emergência)</option>
                </select>
              </div>
            </div>

            {/* Setor Envolvido */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-600" /> Setor e Profissional Citado
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Setor Envolvido *
                  </label>
                  <select
                    value={selectedSectorId}
                    onChange={e => setSelectedSectorId(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5"
                  >
                    {sectors.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code}) - Resp: {s.responsible_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Selecionar Servidor/Profissional Cadastrado (Opcional)
                  </label>
                  <select
                    onChange={e => {
                      const p = professionals.find(pr => pr.id === e.target.value);
                      if (p) {
                        setProfName(p.name);
                        setProfRole(p.role);
                        setProfRegistration(p.registration);
                        setProfShift(p.shift);
                        setProfTeam(p.team);
                      }
                    }}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5"
                  >
                    <option value="">Selecione da lista ou digite abaixo...</option>
                    {professionals.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.role} - {p.registration})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nome do Profissional
                  </label>
                  <input
                    type="text"
                    value={profName}
                    onChange={e => setProfName(e.target.value)}
                    placeholder="Ex: Dr. Fernando Dias"
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Registro Profissional (CRM / COREN)
                  </label>
                  <input
                    type="text"
                    value={profRegistration}
                    onChange={e => setProfRegistration(e.target.value)}
                    placeholder="Ex: CRM-SP 148.902"
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Turno / Plantão
                  </label>
                  <select
                    value={profShift}
                    onChange={e => setProfShift(e.target.value as any)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5"
                  >
                    <option value="Manhã">Manhã</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Noite">Noite</option>
                    <option value="Plantão 12h">Plantão 12h</option>
                    <option value="Plantão 24h">Plantão 24h</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Attachments & Confirmation */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
              <Paperclip className="w-4 h-4 text-sky-600" /> Anexo de Documentos, Fotos e Áudios
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Photo Upload */}
              <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-sky-500 p-4 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50 dark:bg-slate-900/50 transition-colors">
                <ImageIcon className="w-8 h-8 text-sky-500 mb-2" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Anexar Foto</span>
                <span className="text-[10px] text-slate-400">JPG, PNG (Máx 10MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => handleSimulatedFileUpload(e, 'photo')}
                  className="hidden"
                />
              </label>

              {/* PDF Upload */}
              <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-sky-500 p-4 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50 dark:bg-slate-900/50 transition-colors">
                <FileCode className="w-8 h-8 text-rose-500 mb-2" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Anexar Documento PDF</span>
                <span className="text-[10px] text-slate-400">Prontuário, Receitas</span>
                <input
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={e => handleSimulatedFileUpload(e, 'pdf')}
                  className="hidden"
                />
              </label>

              {/* Audio Upload */}
              <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-sky-500 p-4 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50 dark:bg-slate-900/50 transition-colors">
                <Music className="w-8 h-8 text-emerald-500 mb-2" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Anexar Áudio / Depoimento</span>
                <span className="text-[10px] text-slate-400">MP3, WAV, M4A</span>
                <input
                  type="file"
                  accept="audio/*"
                  multiple
                  onChange={e => handleSimulatedFileUpload(e, 'audio')}
                  className="hidden"
                />
              </label>
            </div>

            {/* Uploaded List */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Arquivos Anexados ({attachments.length}):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {attachments.map(att => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Paperclip className="w-4 h-4 text-sky-500 shrink-0" />
                        <span className="truncate font-medium">{att.name}</span>
                        <span className="text-[10px] text-slate-400">({att.size})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(att.id)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Box */}
            <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 space-y-2">
              <span className="text-xs font-bold text-sky-900 dark:text-sky-200 block">
                Resumo do Registro da Ouvidoria
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-sky-800 dark:text-sky-300">
                <div><strong>Tipo:</strong> {type}</div>
                <div><strong>Prioridade:</strong> {priority}</div>
                <div><strong>Canal:</strong> {origin}</div>
                <div><strong>Anônimo:</strong> {isAnonymous ? 'Sim' : 'Não'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
            >
              Anterior
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => {
                if (!description && currentStep === 1) {
                  alert('Por favor, informe a descrição detalhada antes de avançar.');
                  return;
                }
                setCurrentStep(prev => prev + 1);
              }}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
            >
              Próximo Passo
            </button>
          ) : (
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Finalizar e Gerar Protocolo
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
