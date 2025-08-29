import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { getStore } from '../store/datastore.js';

export const historyRouter = Router();

historyRouter.get('/', async (req: AuthRequest, res: Response) => {
  const store = getStore();
  const items = await store.listHistory(req.user!.id);
  res.json({ items });
});

historyRouter.delete('/', async (req: AuthRequest & { body: any }, res: Response) => {
  const ids: string[] = req.body.ids || [];
  const store = getStore();
  await store.deleteHistory(req.user!.id, ids);
  res.json({ ok: true });
});
