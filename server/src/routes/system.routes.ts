import { Router } from 'express';
import { systemController } from '../controllers/system.controller.js';

export const systemRouter = Router();

// Health
systemRouter.get('/health', systemController.health);

// Settings
systemRouter.get('/settings', systemController.getSettings);
systemRouter.put('/settings', systemController.updateSettings);

// Notifications
systemRouter.get('/notifications', systemController.getNotifications);
systemRouter.post('/notifications', systemController.createNotification);
systemRouter.put('/notifications/:id/read', systemController.markNotificationRead);
systemRouter.delete('/notifications/clear', systemController.clearNotifications);

// Audit Logs
systemRouter.get('/audit-logs', systemController.getAuditLogs);
systemRouter.post('/audit-logs', systemController.createAuditLog);

// Response Templates
systemRouter.get('/templates', systemController.getTemplates);
systemRouter.post('/templates', systemController.createTemplate);
systemRouter.delete('/templates/:id', systemController.deleteTemplate);

// Backup & Restore
systemRouter.get('/backup/export', systemController.exportBackup);
systemRouter.post('/backup/restore', systemController.restoreBackup);

export default systemRouter;
