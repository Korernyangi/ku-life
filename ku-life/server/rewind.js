import { randomUUID } from 'node:crypto';
import { supabaseClients } from './supabase.js';

const uuid = /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i;

export function rewindHandler(method, action) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'private, no-store');
    if (req.method !== method) {
      res.setHeader('Allow', method);
      return res.status(405).json({});
    }
    const token = req.headers.authorization?.match(/^Bearer (\S+)$/i)?.[1];
    if (!token) return res.status(401).json({});
    try {
      const { db, auth } = supabaseClients();
      const { data, error } = await auth.getUser(token);
      if (error && (!error.status || error.status >= 500)) throw error;
      if (error || !data?.user) return res.status(401).json({});
      const user = data.user;
      const nickname = user.user_metadata?.nickname;
      if (!user.email_confirmed_at || !/^[^@\s]+@korea\.ac\.kr$/i.test(user.email ?? '')
        || typeof nickname !== 'string' || !nickname.trim() || nickname.trim().length > 20) {
        return res.status(403).json({});
      }
      return await action(req, res, db, user.id);
    } catch (error) {
      console.error('[rewind] request failed', error.code ?? error.name);
      return res.status(503).json({ error: 'REWIND_UNAVAILABLE' });
    }
  };
}

export async function rewindRpc(db, name, args) {
  const { data, error } = await db.rpc(name, args);
  if (error) throw error;
  return data;
}

export const access = rewindHandler('GET', async (req, res, db, userId) => {
  const status = await rewindRpc(db, 'rewind_access', { p_user: userId });
  return res.status(200).json({ status });
});

export const start = rewindHandler('POST', async (req, res, db, userId) => {
  const { sourceId, semester, requestId } = req.body ?? {};
  if (typeof sourceId !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(sourceId)
    || typeof requestId !== 'string' || !uuid.test(requestId)
    || !Number.isInteger(semester) || semester < 1 || semester > 8) {
    return res.status(400).json({});
  }
  const result = await rewindRpc(db, 'rewind_start', {
    p_user: userId, p_source: sourceId, p_semester: semester, p_request: requestId,
  });
  return res.status(result.status === 'request_conflict' ? 409 : 200).json(result);
});

export const checkout = rewindHandler('POST', async (req, res, db, userId) => {
  const url = new URL(process.env.GROBLE_CHECKOUT_URL);
  const product = process.env.GROBLE_CONTENT_ID?.trim();
  const amount = Number(process.env.GROBLE_AMOUNT_KRW);
  if (url.protocol !== 'https:' || !['groble.im', 'www.groble.im'].includes(url.hostname)
    || url.username || url.password || !product || !Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error('Invalid Groble configuration');
  }

  const ref = randomUUID();
  const { error } = await db.from('rewind_orders').insert({
    ref, user_id: userId, content_id: product, amount,
  });
  if (error) throw error;
  url.searchParams.set('ref', ref);
  return res.status(200).json({ checkoutUrl: url.href });
});
