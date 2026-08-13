import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import systemRouter from './routes/system.routes.js';
import userRouter from './routes/user.routes.js';
import sectorRouter from './routes/sector.routes.js';
import professionalRouter from './routes/professional.routes.js';
import manifestationRouter from './routes/manifestation.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));

// Modularized API Routes
app.use('/api', systemRouter);
app.use('/api/users', userRouter);
app.use('/api/sectors', sectorRouter);
app.use('/api/professionals', professionalRouter);
app.use('/api/manifestations', manifestationRouter);

// Global Error Handler Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Ouvidoria UPA API rodando na porta ${PORT}`);
});
