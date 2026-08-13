import { Router } from 'express';
import { professionalController } from '../controllers/professional.controller.js';

export const professionalRouter = Router();

professionalRouter.get('/', professionalController.getAll);
professionalRouter.post('/', professionalController.create);
professionalRouter.put('/:id', professionalController.update);

export default professionalRouter;
