import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';

export const systemController = {
  async health(_req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: 'healthy', database: 'connected', timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  },

  async getSettings(_req: Request, res: Response, next: NextFunction) {
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
      next(error);
    }
  },

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const settings = await prisma.systemSetting.upsert({
        where: { id: 'default' },
        update: data,
        create: { id: 'default', ...data }
      });
      res.json(settings);
    } catch (error) {
      next(error);
    }
  },

  // Notifications
  async getNotifications(_req: Request, res: Response, next: NextFunction) {
    try {
      const notifications = await prisma.notification.findMany({ orderBy: { createdAt: 'desc' } });
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  },

  async createNotification(req: Request, res: Response, next: NextFunction) {
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
      next(error);
    }
  },

  async markNotificationRead(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await prisma.notification.update({
        where: { id: req.params.id },
        data: { read: true }
      });
      res.json(notification);
    } catch (error) {
      next(error);
    }
  },

  async clearNotifications(_req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.notification.deleteMany({});
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  // Audit Logs
  async getAuditLogs(_req: Request, res: Response, next: NextFunction) {
    try {
      const auditLogs = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
      res.json(auditLogs);
    } catch (error) {
      next(error);
    }
  },

  async createAuditLog(req: Request, res: Response, next: NextFunction) {
    try {
      const log = await prisma.auditLog.create({ data: req.body });
      res.status(201).json(log);
    } catch (error) {
      next(error);
    }
  },

  // Response Templates
  async getTemplates(_req: Request, res: Response, next: NextFunction) {
    try {
      const templates = await prisma.responseTemplate.findMany({ orderBy: { title: 'asc' } });
      res.json(templates);
    } catch (error) {
      next(error);
    }
  },

  async createTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const template = await prisma.responseTemplate.create({ data: req.body });
      res.status(201).json(template);
    } catch (error) {
      next(error);
    }
  },

  async deleteTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.responseTemplate.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  // Backup & Restore
  async exportBackup(_req: Request, res: Response, next: NextFunction) {
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
        tables: { settings, users, sectors, professionals, manifestations, notifications, auditLogs, templates }
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=backup_ouvidoria_upa_${new Date().toISOString().substring(0, 10)}.json`);
      res.json(backupData);
    } catch (error) {
      next(error);
    }
  },

  async restoreBackup(req: Request, res: Response, next: NextFunction) {
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
      next(error);
    }
  }
};
