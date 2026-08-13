import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';

export const sectorController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const sectors = await prisma.sector.findMany({ orderBy: { name: 'asc' } });
      res.json(sectors);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const sector = await prisma.sector.create({ data: req.body });
      res.status(201).json(sector);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const sector = await prisma.sector.update({
        where: { id: req.params.id },
        data: req.body
      });
      res.json(sector);
    } catch (error) {
      next(error);
    }
  }
};
