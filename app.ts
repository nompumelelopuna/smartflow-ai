import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import helmet from 'helmet';
import path from 'path';
import { assistantRouter } from './routes/assistant';
import { authRouter } from './routes/auth';
import { ordersRouter } from './routes/orders';
import { reportsRouter } from './routes/reports';
import { suppliersRouter } from './routes/suppliers';
import { requireAuth } from './services/auth';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/auth', authRouter);
  app.use('/api', requireAuth); // everything below needs a logged-in user
  app.use('/api/orders', ordersRouter);
  app.use('/api/suppliers', suppliersRouter);
  app.use('/api/reports', reportsRouter);
  app.use('/api/assistant', assistantRouter);

  // Production: serve the built React app (client/dist) from the same origin.
  const dist = path.join(__dirname, '..', '..', 'client', 'dist');
  if (fs.existsSync(path.join(dist, 'index.html'))) {
    app.use(express.static(dist));
    app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
  }

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });
  return app;
}
