import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { assistantMode, demoReply, liveReply } from '../services/assistant';

export const assistantRouter = Router();
assistantRouter.use(rateLimit({ windowMs: 60 * 1000, limit: 20 }));

assistantRouter.get('/status', (_req, res) => res.json({ mode: assistantMode() }));

assistantRouter.post('/', async (req, res) => {
  const message = req.body?.message;
  if (typeof message !== 'string' || !message.trim() || message.length > 1000)
    return res.status(400).json({ error: 'message must be 1-1000 characters' });
  if (assistantMode() === 'demo') return res.json({ mode: 'demo', reply: demoReply(message) });
  try { res.json({ mode: 'live', reply: await liveReply(message) }); }
  catch (e) { res.json({ mode: 'demo', reply: demoReply(message), note: `Live AI unavailable (${(e as Error).message}); showing demo answer.` }); }
});
