import request from 'supertest';
import { createApp } from '../src/app';

export const newAgent = () => request.agent(createApp());
export const PASSWORD = 'correct-horse-battery';

export async function registerAgent(email = 'admin@example.com', name = 'Test User') {
  const agent = newAgent();
  const res = await agent.post('/api/auth/register').send({ name, email, password: PASSWORD });
  return { agent, res };
}
