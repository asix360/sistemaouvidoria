import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INITIAL_SETTINGS = {
  id: 'default',
  upa_name: 'UPA 24h Central Dr. Arnaldo Vieira - SUS',
  unit_code: 'UPA-2026-CENTRAL',
  logo_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=200',
  phone: '(11) 3241-8900',
  email: 'ouvidoria.upa.central@saude.gov.br',
  address: 'Av. Paulista, 1500 - Bela Vista, São Paulo - SP',
  director_name: 'Dr. Roberto de Alencar (CRM-SP 102.341)',
  ombudsman_coordinator: 'Dra. Mariana Siqueira (Ouvidora Geral)',
  operating_hours: 'Atendimento 24 Horas — Todos os dias (segunda a domingo, inclusive feriados)',
  welcome_message: 'Sua manifestação nos ajuda a aprimorar o acolhimento, triagem de emergência, atendimento médico e enfermagem do nosso Pronto Socorro.',
  default_sla_days: 15,
  warning_sla_days: 3,
  auto_protocol_prefix: 'OUV-2026',
  categories: [
    'Atendimento Geral',
    'Tempo de Espera',
    'Conduta Profissional',
    'Disponibilidade de Medicamento',
    'Infraestrutura e Limpeza',
    'Segurança e Acolhimento',
    'Exames e Diagnóstico'
  ],
  subcategories: {
    'Atendimento Geral': ['Demora na Recepção', 'Informação Incorreta', 'Falta de Ficha de Triagem'],
    'Tempo de Espera': ['Espera excessiva em Amarelo', 'Espera na Sala Vermelha', 'Atraso para Medicamento'],
    'Conduta Profissional': ['Falta de Empatia', 'Ausência no Posto', 'Excelente Atendimento', 'Negligência'],
    'Disponibilidade de Medicamento': ['Falta de Antibiótico', 'Falta de Insumo Hospitalar', 'Orientação de Dosagem'],
    'Infraestrutura e Limpeza': ['Banheiro Danificado', 'Ar Condicionado', 'Cadeiras de Rodas Quebradas'],
    'Segurança e Acolhimento': ['Gritos na Espera', 'Acolhimento Com Classificação', 'Suporte ao Acompanhante']
  }
};

const INITIAL_SECTORS = [
  { id: 'sec_1', code: 'REC', name: 'Recepção', responsible_name: 'Camila Santos', email: 'recepcao.upa@saude.gov.br', phone: 'Ramal 101', sla_days_default: 5, active: true },
  { id: 'sec_2', code: 'ACO', name: 'Acolhimento', responsible_name: 'Enf. Bruno Lima', email: 'acolhimento.upa@saude.gov.br', phone: 'Ramal 102', sla_days_default: 5, active: true },
  { id: 'sec_3', code: 'ENF', name: 'Enfermagem', responsible_name: 'Enf. Carla Mendes', email: 'enfermagem.upa@saude.gov.br', phone: 'Ramal 103', sla_days_default: 7, active: true },
  { id: 'sec_4', code: 'MED', name: 'Médicos', responsible_name: 'Dr. Fernando Dias', email: 'medicos.upa@saude.gov.br', phone: 'Ramal 104', sla_days_default: 10, active: true },
  { id: 'sec_5', code: 'FAR', name: 'Farmácia', responsible_name: 'Farm. Patricia Souza', email: 'farmacia.upa@saude.gov.br', phone: 'Ramal 105', sla_days_default: 5, active: true },
  { id: 'sec_6', code: 'LAB', name: 'Laboratório', responsible_name: 'Bioq. Marcos Vinicius', email: 'laboratorio.upa@saude.gov.br', phone: 'Ramal 106', sla_days_default: 7, active: true },
  { id: 'sec_7', code: 'RX', name: 'Raio X', responsible_name: 'Tech. Eduardo Costa', email: 'raiox.upa@saude.gov.br', phone: 'Ramal 107', sla_days_default: 7, active: true },
  { id: 'sec_8', code: 'ADM', name: 'Administrativo', responsible_name: 'Sérgio Nogueira', email: 'admin.upa@saude.gov.br', phone: 'Ramal 108', sla_days_default: 15, active: true }
];

const DEFAULT_ADMIN_USER = {
  id: 'user_admin',
  name: 'Administrador Geral',
  email: 'admin.ouvidoria@upa.sp.gov.br',
  cpf: '111.222.333-00',
  role: 'Administrador',
  active: true,
  password: '12345678',
  must_change_password: true,
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  permissions: {
    visualizar: true, cadastrar: true, editar: true, excluir: true,
    responder: true, encaminhar: true, encerrar: true, reabrir: true,
    emitir_relatorios: true, gerenciar_usuarios: true, configuracoes: true
  }
};

export async function main() {
  console.log('🔍 Verificando integridade e dados do banco de dados PostgreSQL...');

  // 1. Configurações da UPA (cria apenas se não existirem)
  const existingSettings = await prisma.systemSetting.findUnique({ where: { id: 'default' } });
  if (!existingSettings) {
    console.log('⚙️ Inicializando configurações institucionais da UPA...');
    await prisma.systemSetting.create({ data: INITIAL_SETTINGS });
  }

  // 2. Setores da UPA (cria apenas os que não existirem)
  for (const sector of INITIAL_SECTORS) {
    const existing = await prisma.sector.findUnique({ where: { code: sector.code } });
    if (!existing) {
      console.log(`🏢 Cadastrando setor inicial: ${sector.name} (${sector.code})...`);
      await prisma.sector.create({ data: sector });
    }
  }

  // 3. Usuário Administrador (cria apenas se não existir nenhum administrador)
  const existingAdmin = await prisma.user.findFirst({
    where: {
      OR: [
        { role: 'Administrador' },
        { email: DEFAULT_ADMIN_USER.email }
      ]
    }
  });

  if (!existingAdmin) {
    console.log('👤 Nenhum usuário Administrador encontrado. Criando Administrador Geral padrão (admin.ouvidoria@upa.sp.gov.br)...');
    await prisma.user.create({
      data: DEFAULT_ADMIN_USER
    });
  } else {
    console.log('✅ Usuário Administrador existente mantido sem alterações.');
  }

  console.log('✅ Verificação concluída. Todos os dados existentes foram preservados com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante a verificação do seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
