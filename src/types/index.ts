export type Role = 
  | 'Administrador' 
  | 'Ouvidor' 
  | 'Diretor' 
  | 'Coordenador' 
  | 'Supervisor' 
  | 'Consulta';

export interface UserPermissions {
  visualizar: boolean;
  cadastrar: boolean;
  editar: boolean;
  excluir: boolean;
  responder: boolean;
  encaminhar: boolean;
  encerrar: boolean;
  reabrir: boolean;
  emitir_relatorios: boolean;
  gerenciar_usuarios: boolean;
  configuracoes: boolean;

  // Direitos de Acesso Granulares por Módulo
  modulo_dashboard?: boolean;
  modulo_nova_manifestacao?: boolean;
  modulo_manifestacoes?: boolean;
  modulo_resposta_oficial?: boolean;
  modulo_parecer_setor?: boolean;
  modulo_controle_sla?: boolean;
  modulo_tramitacao_setores?: boolean;
  modulo_modelos_resposta?: boolean;
  modulo_gestao_setores?: boolean;
  modulo_gestao_equipe?: boolean;
  modulo_relatorios?: boolean;
  modulo_usuarios_niveis?: boolean;
  modulo_logs_auditoria?: boolean;
  modulo_configuracoes?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  cpf: string;
  role: Role;
  sector_id?: string;
  sector_name?: string;
  sector_ids?: string[];
  sector_names?: string[];
  active: boolean;
  avatar_url?: string;
  password?: string;
  must_change_password?: boolean;
  permissions: UserPermissions;
}

export type ManifestationType = 
  | 'Reclamação' 
  | 'Denúncia' 
  | 'Sugestão' 
  | 'Elogio' 
  | 'Informação';

export type Priority = 'Baixa' | 'Média' | 'Alta' | 'Urgente';

export type ManifestationStatus = 
  | 'Recebida' 
  | 'Triagem' 
  | 'Classificada' 
  | 'Encaminhada' 
  | 'Em análise' 
  | 'Respondida' 
  | 'Aguardando retorno' 
  | 'Concluída' 
  | 'Encerrada' 
  | 'Reaberta';

export type OriginChannel = 
  | 'Balcão Presencial' 
  | 'Caixa de Sugestões' 
  | 'WhatsApp' 
  | 'E-mail' 
  | 'Telefone 136 / OuvSUS' 
  | 'Site / Portal UPA';

export type RiskClassification = 'Azul' | 'Verde' | 'Amarelo' | 'Laranja' | 'Vermelho';

export interface ComplainantData {
  name: string;
  cpf: string;
  sus_card: string;
  phone: string;
  whatsapp: string;
  email: string;
  city: string;
  address: string;
  neighborhood: string;
  cep: string;
  gender: 'Masculino' | 'Feminino' | 'Outro' | 'Não informado';
  birth_date: string;
}

export interface OccurrenceData {
  date: string;
  time: string;
  upa_name: string;
  location_room: string;
  classification_risk: RiskClassification;
  notes: string;
}

export interface ProfessionalInvolved {
  id?: string;
  name: string;
  role: string;
  registration: string; // CRM, COREN, etc.
  shift: 'Manhã' | 'Tarde' | 'Noite' | 'Plantão 12h' | 'Plantão 24h';
  team: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'photo' | 'pdf' | 'audio' | 'video';
  url: string;
  size: string;
  created_at: string;
}

export interface Forwarding {
  id: string;
  sector_id: string;
  sector_name: string;
  responsible_name: string;
  sent_at: string;
  deadline: string;
  notes: string;
  response?: string;
  response_at?: string;
  status: 'Pendente' | 'Respondido' | 'Em Análise' | 'Recusado';
  digital_signature?: string;
}

export interface ResponseItem {
  id: string;
  author_name: string;
  author_role: string;
  created_at: string;
  content: string;
  is_final: boolean;
  digital_signature?: string;
  status_after: ManifestationStatus;
}

export interface SLAInfo {
  initial_deadline: string; // YYYY-MM-DD
  remaining_days: number;
  overdue_days: number;
  traffic_light: '🟢' | '🟡' | '🔴';
  status_label: 'Dentro do prazo' | 'Próximo do vencimento' | 'Prazo vencido';
}

export interface Manifestation {
  id: string;
  protocol: string; // e.g. OUV-2026-000142
  created_at: string; // YYYY-MM-DD
  created_time: string; // HH:mm
  type: ManifestationType;
  priority: Priority;
  status: ManifestationStatus;
  origin: OriginChannel;
  category: string;
  subcategory: string;
  description: string;
  notes?: string;
  is_confidential: boolean;
  is_anonymous: boolean;
  
  complainant: ComplainantData;
  occurrence: OccurrenceData;
  
  sector_id: string;
  sector_name: string;
  
  professional?: ProfessionalInvolved;
  
  attachments: Attachment[];
  forwardings: Forwarding[];
  responses: ResponseItem[];
  
  sla: SLAInfo;
  
  deleted_at: string | null; // Soft delete
  deleted_by?: string;
  deleted_reason?: string;
}

export interface Sector {
  id: string;
  name: string;
  code: string;
  responsible_name: string;
  email: string;
  phone: string;
  sla_days_default: number;
  active: boolean;
}

export interface Professional {
  id: string;
  name: string;
  role: string;
  registration: string;
  sector_id: string;
  sector_name: string;
  shift: 'Manhã' | 'Tarde' | 'Noite' | 'Plantão 12h' | 'Plantão 24h';
  team: string;
  active: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'new' | 'sla_warning' | 'sla_overdue' | 'answered' | 'closed';
  read: boolean;
  timestamp: string;
  manifestation_id?: string;
  protocol?: string;
}

export interface AuditLogItem {
  id: string;
  user_name: string;
  user_role: Role;
  action: 'Criação' | 'Edição' | 'Encaminhamento' | 'Resposta' | 'Encerramento' | 'Reabertura' | 'Exclusão (Soft Delete)' | 'Restauração' | 'Login' | 'Logout';
  entity: 'Manifestação' | 'Setor' | 'Usuário' | 'Configurações' | 'Profissional';
  entity_id: string;
  timestamp: string;
  ip: string;
  details: string;
}

export interface SystemSettings {
  upa_name: string;
  unit_code: string;
  logo_url: string;
  phone: string;
  email: string;
  address: string;
  director_name: string;
  ombudsman_coordinator: string;
  operating_hours?: string;
  welcome_message?: string;
  default_sla_days: number;
  warning_sla_days: number;
  categories: string[];
  subcategories: Record<string, string[]>;
  auto_protocol_prefix: string;
}

export interface ResponseTemplate {
  id: string;
  title: string;
  type: ManifestationType;
  category: string;
  content: string;
}
