import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';

export const userRouter = Router();

userRouter.get('/', userController.getAll);
userRouter.post('/', userController.create);
userRouter.put('/:id', userController.update);
userRouter.put('/:id/change-password', userController.changePassword);
userRouter.put('/:id/reset-password', userController.resetPassword);

export default userRouter;
