import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './shared/errors/error-handler.js';
import { analysisRouter } from './modules/analysis/interfaces/http/analysis.routes.js';

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'code-insight-ai-backend'
  });
});

app.use('/api/v1', analysisRouter);

app.use(errorHandler);
