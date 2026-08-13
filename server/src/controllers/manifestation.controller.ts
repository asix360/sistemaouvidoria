import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';

export const manifestationController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, sector_id, type, priority, limit } = req.query;
      
      const where: any = {};
      if (status && typeof status === 'string') where.status = status;
      if (sector_id && typeof sector_id === 'string') where.sector_id = sector_id;
      if (type && typeof type === 'string') where.type = type;
      if (priority && typeof priority === 'string') where.priority = priority;

      const manifestations = await prisma.manifestation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...(limit ? { take: Number(limit) } : {})
      });

      res.json(manifestations);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      
      // Otimização Atômica de Protocolo sem loops excessivos de contagem
      let protocol = data.protocol;
      if (!protocol) {
        const currentYear = new Date().getFullYear();
        const randomSuffix = Math.floor(100000 + Math.random() * 900000);
        protocol = `OUV-${currentYear}-${randomSuffix}`;
      }
      data.protocol = protocol;

      // Fallbacks padrão de dados
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

      // Filtrar colunas válidas no schema do Prisma
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
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
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
      next(error);
    }
  }
};
