import { supabaseClients } from '../server/supabase.js';
import { AtlasGame } from '../src/atlas/game.js';
import { applyChallengeAction, challengeScore, createChallenge } from '../src/atlas/challenge.js';

const runFields = 'id,revision,state,score,public_nickname';
const schoolEmail = /^[^@\s]+@korea\.ac\.kr$/i;
const runId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function requireData(result) {
  if (result.error) throw result.error;
  return result.data;
}

function unavailable(res, reason, upstreamCode) {
  const code = typeof upstreamCode === 'string' && /^[a-zA-Z0-9_]{1,60}$/.test(upstreamCode)
    && !upstreamCode.startsWith('sb_') ? upstreamCode : undefined;
  console.error('[challenge]', { reason, code });
  return res.status(503).json({ error: reason });
}

function publicRun(row) {
  return row && { id: row.id, revision: row.revision, state: row.state, score: row.score, published: row.public_nickname != null };
}

export function challengeHandler(db, auth = db.auth) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'private, no-store');
    if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({});
    const token = req.headers.authorization?.match(/^Bearer (\S+)$/i)?.[1];
    if (!token) return res.status(401).json({ error: 'CHALLENGE_SESSION_INVALID' });
    try {
      const { data, error } = await auth.getUser(token);
      if (error && (!error.status || error.status >= 500)) {
        return unavailable(res, 'CHALLENGE_AUTH_UNAVAILABLE', error.code);
      }
      if (error || !data?.user) return res.status(401).json({ error: 'CHALLENGE_SESSION_INVALID' });
      const { user } = data;
      if (!user.email_confirmed_at || !schoolEmail.test(user.email ?? '')) {
        return res.status(403).json({ error: 'CHALLENGE_SCHOOL_EMAIL_REQUIRED' });
      }
      const nickname = typeof user.user_metadata?.nickname === 'string' ? user.user_metadata.nickname.trim() : '';
      if (!nickname || nickname.length > 20) return res.status(403).json({ error: 'CHALLENGE_NICKNAME_REQUIRED' });
      const runs = db.from('challenge_runs');
      const latest = async () => requireData(await runs.select(runFields)
        .eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle());

      if (req.method === 'GET') {
        if (req.query?.view === 'profile') {
          const result = await runs.select('score', { count: 'exact' })
            .eq('user_id', user.id).not('score', 'is', null).order('score', { ascending: false }).limit(1);
          const best = requireData(result)[0];
          return res.status(200).json({ completed: result.count, bestScore: best?.score ?? null });
        }
        if (req.query?.view === 'ranking') {
          const rows = requireData(await db.from('challenge_ranking')
            .select('rank,public_nickname,major_id,score').order('rank').order('completed_at').limit(50));
          return res.status(200).json({ rows });
        }
        return res.status(200).json({ run: publicRun(await latest()) });
      }
      const body = req.body;
      if (!body || typeof body !== 'object' || Array.isArray(body)) return res.status(400).json({});
      if (body.action === 'start') {
        const previous = await latest();
        if (previous && (previous.score == null || body.previousId !== previous.id)) {
          return res.status(200).json({ run: publicRun(previous) });
        }
        const { state } = createChallenge();
        const result = await runs.insert({ user_id: user.id, major_id: state.majorId, state }).select(runFields).single();
        if (result.error?.code === '23505') return res.status(200).json({ run: publicRun(await latest()) });
        return res.status(201).json({ run: publicRun(requireData(result)) });
      }

      if (typeof body.id !== 'string' || !runId.test(body.id) || !Number.isSafeInteger(body.revision)) {
        return res.status(400).json({});
      }
      const row = requireData(await runs.select(runFields).eq('id', body.id).eq('user_id', user.id).maybeSingle());
      if (!row) return res.status(404).json({});
      if (row.revision !== body.revision) return res.status(409).json({ run: publicRun(row) });

      let update;
      if (body.action === 'publish' && row.score != null) {
        if (row.public_nickname != null) return res.status(200).json({ run: publicRun(row) });
        update = { public_nickname: nickname };
      } else if (row.score == null) {
        const game = new AtlasGame(row.state);
        if (!applyChallengeAction(game, body)) return res.status(422).json({});
        const score = challengeScore(game);
        update = { state: game.state, score, completed_at: score == null ? null : new Date().toISOString() };
      } else {
        return res.status(422).json({});
      }

      const saved = requireData(await runs.update({ ...update, revision: row.revision + 1 })
        .eq('id', row.id).eq('user_id', user.id).eq('revision', row.revision).select(runFields).maybeSingle());
      if (!saved) return res.status(409).json({ run: publicRun(await latest()) });
      return res.status(200).json({ run: publicRun(saved) });
    } catch (error) {
      const code = error?.code;
      const reason = ['PGRST204', 'PGRST205', '42P01', '42703'].includes(code) ? 'CHALLENGE_SCHEMA_MISSING'
        : code === '42501' ? 'CHALLENGE_DATABASE_PERMISSION'
        : 'CHALLENGE_DATABASE_ERROR';
      return unavailable(res, reason, code);
    }
  };
}

export default function handler(req, res) {
  try {
    const { db, auth } = supabaseClients();
    return challengeHandler(db, auth)(req, res);
  } catch (error) {
    return unavailable(res, error.message === 'SUPABASE_CONFIGURATION_MISSING'
      ? 'CHALLENGE_CONFIGURATION_MISSING' : 'CHALLENGE_CONFIGURATION_INVALID');
  }
}
