import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';

export const userController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await prisma.user.findMany({ orderBy: { name: 'asc' } });
      res.json(users);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = {
        password: '12345678',
        must_change_password: true,
        ...req.body
      };
      const user = await prisma.user.create({ data });
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: req.body
      });
      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req: Request, res: Response, next: NextFunction) {
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
      next(error);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
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
      next(error);
    }
  }
};
