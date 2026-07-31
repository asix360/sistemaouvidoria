import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));

// Healthcheck endpoint
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'healthy', database: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', database: 'disconnected', error: (error as Error).message });
  }
});

// Settings Endpoints
app.get('/api/settings', async (_req, res) => {
  try {
    let settings = await prisma.systemSetting.findUnique({ where: { id: 'default' } });
    if (!settings) {
      settings = await prisma.systemSetting.create({
        data: {
          id: 'default',
          upa_name: 'UPA 24h Central Dr. Arnaldo Vieira - SUS',
          unit_code: 'UPA-2026-CENTRAL',
          phone: '(11) 3241-8900',
          email: 'ouvidoria.upa.central@saude.gov.br',
          address: 'Av. Paulista, 1500 - Bela Vista, São Paulo - SP',
          director_name: 'Dr. Roberto de Alencar',
          ombudsman_coordinator: 'Dra. Mariana Siqueira',
          default_sla_days: 15,
          warning_sla_days: 3,
          auto_protocol_prefix: 'OUV-2026',
          categories: ['Atendimento Geral', 'Tempo de Espera', 'Conduta Profissional'],
          subcategories: {}
        }
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const data = req.body;
    const settings = await prisma.systemSetting.upsert({
      where: { id: 'default' },
      update: data,
      create: { id: 'default', ...data }
    });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Users Endpoints
app.get('/api/users', async (_req, res) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { name: 'asc' } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const data = {
      password: '12345678',
      must_change_password: true,
      ...req.body
    };
    const user = await prisma.user.create({ data });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Alteração de senha pelo próprio usuário (Troca Obrigatória / Primeiro Acesso)
app.put('/api/users/:id/change-password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        password: newPassword,
        must_change_password: false
      }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Reset de senha pelo Administrador (Reseta para 12345678 e exige troca no próximo acesso)
app.put('/api/users/:id/reset-password', async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        password: '12345678',
        must_change_password: true
      }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Sectors Endpoints
app.get('/api/sectors', async (_req, res) => {
  try {
    const sectors = await prisma.sector.findMany({ orderBy: { name: 'asc' } });
    res.json(sectors);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/sectors', async (req, res) => {
  try {
    const sector = await prisma.sector.create({ data: req.body });
    res.status(201).json(sector);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put('/api/sectors/:id', async (req, res) => {
  try {
    const sector = await prisma.sector.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(sector);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Professionals Endpoints
app.get('/api/professionals', async (_req, res) => {
  try {
    const professionals = await prisma.professional.findMany({ orderBy: { name: 'asc' } });
    res.json(professionals);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/professionals', async (req, res) => {
  try {
    const professional = await prisma.professional.create({ data: req.body });
    res.status(201).json(professional);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put('/api/professionals/:id', async (req, res) => {
  try {
    const professional = await prisma.professional.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(professional);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Manifestations Endpoints
app.get('/api/manifestations', async (_req, res) => {
  try {
    const manifestations = await prisma.manifestation.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(manifestations);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/manifestations', async (req, res) => {
  try {
    const data = req.body;
    
    // Garantir Protocolo 100% Único e Sequencial sem Colisão no PostgreSQL
    let protocol = data.protocol;
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 25) {
      if (!protocol || attempts > 0) {
        const count = await prisma.manifestation.count();
        const currentYear = new Date().getFullYear();
        const padded = String(count + 1 + attempts).padStart(6, '0');
        protocol = `OUV-${currentYear}-${padded}`;
      }

      const existing = await prisma.manifestation.findUnique({ where: { protocol } });
      if (!existing) {
        isUnique = true;
      } else {
        attempts++;
        protocol = `OUV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      }
    }
    data.protocol = protocol;

    // Fallbacks padrão para evitar erro de validação do Prisma
    if (!data.created_at) data.created_at = new Date().toISOString().substring(0, 10);
    if (!data.created_time) data.created_time = new Date().toTimeString().substring(0, 5);
    if (!data.category) data.category = 'Atendimento Geral';
    if (!data.subcategory) data.subcategory = 'Atendimento Geral';
    if (!data.origin) data.origin = 'Portal do Cidadão (Web)';
    if (!data.occurrence) {
      data.occurrence = {
        date: data.created_at,
        time: data.created_time,
        location: data.sector_name || 'Recepção / Triagem UPA 24h',
        shift: 'Tarde'
      };
    }
    if (!data.complainant) {
      data.complainant = { name: 'Manifestante Anônimo' };
    }
    if (!data.attachments) data.attachments = [];
    if (!data.forwardings) data.forwardings = [];
    if (!data.responses) data.responses = [];
    if (!data.sla) {
      data.sla = {
        initial_deadline: data.created_at,
        remaining_days: 15,
        overdue_days: 0,
        traffic_light: '🟢',
        status_label: 'Dentro do prazo'
      };
    }

    // Filtrar apenas colunas pertencentes à tabela Manifestation no Prisma (elimina erro por campos extras como channel)
    const validKeys = [
      'id', 'protocol', 'created_at', 'created_time', 'type', 'priority', 'status',
      'origin', 'category', 'subcategory', 'description', 'notes', 'is_confidential',
      'is_anonymous', 'complainant', 'occurrence', 'sector_id', 'sector_name',
      'professional', 'attachments', 'forwardings', 'responses', 'sla',
      'deleted_at', 'deleted_by', 'deleted_reason'
    ];

    const cleanData: any = {};
    for (const key of validKeys) {
      if (data[key] !== undefined) {
        cleanData[key] = data[key];
      }
    }

    if (cleanData.is_anonymous) {
      cleanData.complainant = {
        name: 'Manifestante Anônimo',
        cpf: '',
        sus_card: '',
        phone: '',
        whatsapp: '',
        email: '',
        city: 'São Paulo',
        address: 'Não informado',
        neighborhood: 'Não informado',
        cep: '',
        gender: 'Não informado'
      };
    }

    const manifestation = await prisma.manifestation.create({ data: cleanData });
    res.status(201).json(manifestation);
  } catch (error) {
    console.error('Erro ao salvar manifestação no PostgreSQL:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put('/api/manifestations/:id', async (req, res) => {
  try {
    const data = req.body;
    const validKeys = [
      'protocol', 'created_at', 'created_time', 'type', 'priority', 'status',
      'origin', 'category', 'subcategory', 'description', 'notes', 'is_confidential',
      'is_anonymous', 'complainant', 'occurrence', 'sector_id', 'sector_name',
      'professional', 'attachments', 'forwardings', 'responses', 'sla',
      'deleted_at', 'deleted_by', 'deleted_reason'
    ];

    const updateData: any = {};
    for (const key of validKeys) {
      if (data[key] !== undefined) {
        updateData[key] = data[key];
      }
    }

    const manifestation = await prisma.manifestation.update({
      where: { id: req.params.id },
      data: updateData
    });
    res.json(manifestation);
  } catch (error) {
    console.error('Erro ao atualizar manifestação no PostgreSQL:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Notifications Endpoints
app.get('/api/notifications', async (_req, res) => {
  try {
    const notifications = await prisma.notification.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const data = req.body;
    const notification = await prisma.notification.create({
      data: {
        title: data.title || 'Notificação UPA',
        message: data.message || '',
        type: data.type || 'new',
        read: data.read || false,
        timestamp: data.timestamp || new Date().toISOString(),
        manifestation_id: data.manifestation_id || '',
        protocol: data.protocol || ''
      }
    });
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true }
    });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete('/api/notifications/clear', async (_req, res) => {
  try {
    await prisma.notification.deleteMany({});
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Audit Logs Endpoints
app.get('/api/audit-logs', async (_req, res) => {
  try {
    const auditLogs = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
    res.json(auditLogs);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/audit-logs', async (req, res) => {
  try {
    const log = await prisma.auditLog.create({ data: req.body });
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Response Templates Endpoints
app.get('/api/templates', async (_req, res) => {
  try {
    const templates = await prisma.responseTemplate.findMany({ orderBy: { title: 'asc' } });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/templates', async (req, res) => {
  try {
    const template = await prisma.responseTemplate.create({ data: req.body });
    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete('/api/templates/:id', async (req, res) => {
  try {
    await prisma.responseTemplate.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Backup & Restore Endpoints
app.get('/api/backup/export', async (_req, res) => {
  try {
    const [settings, users, sectors, professionals, manifestations, notifications, auditLogs, templates] = await Promise.all([
      prisma.systemSetting.findMany(),
      prisma.user.findMany(),
      prisma.sector.findMany(),
      prisma.professional.findMany(),
      prisma.manifestation.findMany(),
      prisma.notification.findMany(),
      prisma.auditLog.findMany(),
      prisma.responseTemplate.findMany()
    ]);

    const backupData = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      system: 'Ouvidoria UPA 24h',
      tables: {
        settings,
        users,
        sectors,
        professionals,
        manifestations,
        notifications,
        auditLogs,
        templates
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=backup_ouvidoria_upa_${new Date().toISOString().substring(0, 10)}.json`);
    res.json(backupData);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/backup/restore', async (req, res) => {
  try {
    const { tables } = req.body;
    if (!tables) {
      return res.status(400).json({ error: 'Formato de arquivo de backup inválido.' });
    }

    if (tables.settings) {
      for (const s of tables.settings) {
        await prisma.systemSetting.upsert({ where: { id: s.id }, update: s, create: s });
      }
    }

    if (tables.users) {
      for (const u of tables.users) {
        await prisma.user.upsert({ where: { id: u.id }, update: u, create: u });
      }
    }

    if (tables.sectors) {
      for (const sec of tables.sectors) {
        await prisma.sector.upsert({ where: { code: sec.code }, update: sec, create: sec });
      }
    }

    if (tables.professionals) {
      for (const p of tables.professionals) {
        await prisma.professional.upsert({ where: { id: p.id }, update: p, create: p });
      }
    }

    if (tables.manifestations) {
      for (const m of tables.manifestations) {
        await prisma.manifestation.upsert({ where: { id: m.id }, update: m, create: m });
      }
    }

    if (tables.templates) {
      for (const t of tables.templates) {
        await prisma.responseTemplate.upsert({ where: { id: t.id }, update: t, create: t });
      }
    }

    res.json({ status: 'success', message: 'Backup restaurado com sucesso no PostgreSQL!' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Ouvidoria UPA API rodando na porta ${PORT}`);
});
