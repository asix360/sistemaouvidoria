import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';

export const professionalController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const professionals = await prisma.professional.findMany({ orderBy: { name: 'asc' } });
      res.json(professionals);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const professional = await prisma.professional.create({ data: req.body });
      res.status(201).json(professional);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const professional = await prisma.professional.update({
        where: { id: req.params.id },
        data: req.body
      });
      res.json(professional);
    } catch (error) {
      next(error);
    }
  }
};
