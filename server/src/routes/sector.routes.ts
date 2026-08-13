import { Router } from 'express';
import { sectorController } from '../controllers/sector.controller.js';

export const sectorRouter = Router();

sectorRouter.get('/', sectorController.getAll);
sectorRouter.post('/', sectorController.create);
sectorRouter.put('/:id', sectorController.update);

export default sectorRouter;
