import {
  Manifestation,
  Sector,
  Professional,
  UserProfile,
  SystemSettings,
  ResponseTemplate,
  AuditLogItem,
  NotificationItem
} from '../types';

export const INITIAL_SETTINGS: SystemSettings = {
  upa_name: "UPA 24h Central Dr. Arnaldo Vieira - SUS",
  unit_code: "UPA-2026-CENTRAL",
  logo_url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=200",
  phone: "(11) 3241-8900",
  email: "ouvidoria.upa.central@saude.gov.br",
  address: "Av. Paulista, 1500 - Bela Vista, São Paulo - SP",
  director_name: "Dr. Roberto de Alencar (CRM-SP 102.341)",
  ombudsman_coordinator: "Dra. Mariana Siqueira (Ouvidora Geral)",
  operating_hours: "Atendimento 24 Horas — Todos os dias (segunda a domingo, inclusive feriados)",
  welcome_message: "Sua manifestação nos ajuda a aprimorar o acolhimento, triagem de emergência, atendimento médico e enfermagem do nosso Pronto Socorro.",
  default_sla_days: 15,
  warning_sla_days: 3,
  auto_protocol_prefix: "OUV-2026",
  categories: [
    "Atendimento Geral",
    "Tempo de Espera",
    "Conduta Profissional",
    "Disponibilidade de Medicamento",
    "Infraestrutura e Limpeza",
    "Segurança e Acolhimento",
    "Exames e Diagnóstico"
  ],
  subcategories: {
    "Atendimento Geral": ["Demora na Recepção", "Informação Incorreta", "Falta de Ficha de Triagem"],
    "Tempo de Espera": ["Espera excessiva em Amarelo", "Espera na Sala Vermelha", "Atraso para Medicamento"],
    "Conduta Profissional": ["Falta de Empatia", "Ausência no Posto", "Excelente Atendimento", "Negligência"],
    "Disponibilidade de Medicamento": ["Falta de Antibiótico", "Falta de Insumo Hospitalar", "Orientação de Dosagem"],
    "Infraestrutura e Limpeza": ["Banheiro Danificado", "Ar Condicionado", "Cadeiras de Rodas Quebradas"],
    "Segurança e Acolhimento": ["Gritos na Espera", "Acolhimento Com Classificação", "Suporte ao Acompanhante"]
  }
};

export const INITIAL_SECTORS: Sector[] = [
  { id: 'sec_1', code: 'REC', name: 'Recepção', responsible_name: 'Camila Santos', email: 'recepcao.upa@saude.gov.br', phone: 'Ramal 101', sla_days_default: 5, active: true },
  { id: 'sec_2', code: 'ACO', name: 'Acolhimento', responsible_name: 'Enf. Bruno Lima', email: 'acolhimento.upa@saude.gov.br', phone: 'Ramal 102', sla_days_default: 5, active: true },
  { id: 'sec_3', code: 'ENF', name: 'Enfermagem', responsible_name: 'Enf. Carla Mendes', email: 'enfermagem.upa@saude.gov.br', phone: 'Ramal 103', sla_days_default: 7, active: true },
  { id: 'sec_4', code: 'MED', name: 'Médicos', responsible_name: 'Dr. Fernando Dias', email: 'medicos.upa@saude.gov.br', phone: 'Ramal 104', sla_days_default: 10, active: true },
  { id: 'sec_5', code: 'FAR', name: 'Farmácia', responsible_name: 'Farm. Patricia Souza', email: 'farmacia.upa@saude.gov.br', phone: 'Ramal 105', sla_days_default: 5, active: true },
  { id: 'sec_6', code: 'LAB', name: 'Laboratório', responsible_name: 'Bioq. Marcos Vinicius', email: 'laboratorio.upa@saude.gov.br', phone: 'Ramal 106', sla_days_default: 7, active: true },
  { id: 'sec_7', code: 'RX', name: 'Raio X', responsible_name: 'Tech. Eduardo Costa', email: 'raiox.upa@saude.gov.br', phone: 'Ramal 107', sla_days_default: 7, active: true },
  { id: 'sec_8', code: 'ADM', name: 'Administrativo', responsible_name: 'Sérgio Nogueira', email: 'admin.upa@saude.gov.br', phone: 'Ramal 108', sla_days_default: 15, active: true },
  { id: 'sec_9', code: 'FIN', name: 'Financeiro', responsible_name: 'Helena Rocha', email: 'financeiro.upa@saude.gov.br', phone: 'Ramal 109', sla_days_default: 15, active: true },
  { id: 'sec_10', code: 'TI', name: 'TI', responsible_name: 'Gerson Silva', email: 'ti.upa@saude.gov.br', phone: 'Ramal 110', sla_days_default: 3, active: true },
  { id: 'sec_11', code: 'RH', name: 'RH', responsible_name: 'Juliana Paes', email: 'rh.upa@saude.gov.br', phone: 'Ramal 111', sla_days_default: 10, active: true },
  { id: 'sec_12', code: 'LIM', name: 'Limpeza', responsible_name: 'Marta Ribeiro', email: 'limpeza.upa@saude.gov.br', phone: 'Ramal 112', sla_days_default: 3, active: true },
  { id: 'sec_13', code: 'SEG', name: 'Segurança', responsible_name: 'Capitanio Viana', email: 'seguranca.upa@saude.gov.br', phone: 'Ramal 113', sla_days_default: 5, active: true },
  { id: 'sec_14', code: 'MAN', name: 'Manutenção', responsible_name: 'José Andrade', email: 'manutencao.upa@saude.gov.br', phone: 'Ramal 114', sla_days_default: 5, active: true },
  { id: 'sec_15', code: 'DIR', name: 'Direção', responsible_name: 'Dr. Roberto de Alencar', email: 'direcao.upa@saude.gov.br', phone: 'Ramal 200', sla_days_default: 15, active: true },
  { id: 'sec_16', code: 'COO', name: 'Coordenação', responsible_name: 'Dra. Mariana Siqueira', email: 'coordenacao.upa@saude.gov.br', phone: 'Ramal 201', sla_days_default: 10, active: true }
];

export const INITIAL_PROFESSIONALS: Professional[] = [];

// Único usuário inicial para o sistema: Administrador
export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user_admin',
    name: 'Administrador Geral',
    email: 'admin.ouvidoria@upa.sp.gov.br',
    cpf: '111.222.333-00',
    role: 'Administrador',
    active: true,
    password: '12345678',
    must_change_password: false,
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    permissions: {
      visualizar: true, cadastrar: true, editar: true, excluir: true,
      responder: true, encaminhar: true, encerrar: true, reabrir: true,
      emitir_relatorios: true, gerenciar_usuarios: true, configuracoes: true
    }
  }
];

export const INITIAL_MANIFESTATIONS: Manifestation[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [];

export const INITIAL_RESPONSE_TEMPLATES: ResponseTemplate[] = [
  {
    id: 'tpl_1',
    title: 'Agradecimento por Elogio Institucional',
    type: 'Elogio',
    category: 'Atendimento Geral',
    content: 'Prezado(a) cidadão(ã),\n\nAgradecemos sinceramente pelo registro do seu elogio referente ao atendimento recebido na UPA 24h. Sua manifestação foi encaminhada à Direção da Unidade e à equipe médica/de enfermagem envolvida, servindo como importante estímulo ao aperfeiçoamento contínuo dos nossos serviços prestados à população pelo SUS.\n\nAtenciosamente,\nOuvidoria Geral - UPA 24h'
  },
  {
    id: 'tpl_2',
    title: 'Resposta Padrão - Esclarecimento de Demora por Sobrecarga',
    type: 'Reclamação',
    category: 'Tempo de Espera',
    content: 'Prezado(a) cidadão(ã),\n\nEm resposta à sua manifestação referente ao tempo de espera para atendimento médico, informamos que a UPA 24h opera sob o protocolo acolhimento com classificação de risco (Protocolo de Manchester). Na data mencionada, houve um pico atípico de atendimentos de urgência na Sala Vermelha (casos gravíssimos), o que demandou a mobilização temporária da equipe multiprofissional.\n\nLamentamos o transtorno e reafirmamos nosso compromisso com a assistência célere e humanizada.\n\nAtenciosamente,\nOuvidoria Geral - UPA 24h'
  }
];
