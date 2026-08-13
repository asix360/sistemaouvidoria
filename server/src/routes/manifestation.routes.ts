import { Router } from 'express';
import { manifestationController } from '../controllers/manifestation.controller.js';

export const manifestationRouter = Router();

manifestationRouter.get('/', manifestationController.getAll);
manifestationRouter.post('/', manifestationController.create);
manifestationRouter.put('/:id', manifestationController.update);

export default manifestationRouter;
