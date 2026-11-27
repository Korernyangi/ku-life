import { createHmac, timingSafeEqual } from 'node:crypto';
import { rewindRpc } from '../server/rewind.js';
import { supabaseClients } from '../server/supabase.js';

function validSignature(secret, signature, timestamp, body) {
  if (!secret || !/^[0-9a-f]{64}$/i.test(signature ?? '')) return false;
  const expected = createHmac('sha256', secret).update(timestamp + '.').update(body).digest();
  return timingSafeEqual(expected, Buffer.from(signature, 'hex'));
}

function identifier(value) {
  return typeof value === 'string' && value.length > 0 && value.length <= 256;
}

function amount(value) {
  return Number.isInteger(value) && value > 0 && value <= 2147483647;
}

function date(value) {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

export default {
  async fetch(request) {
    if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
    const secret = process.env.GROBLE_WEBHOOK_SECRET;
    if (!secret) return new Response(null, { status: 503 });

    const timestamp = request.headers.get('X-Groble-Timestamp');
    if (!/^\d{10}$/.test(timestamp ?? '') || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
      return new Response(null, { status: 401 });
    }
    const body = Buffer.from(await request.arrayBuffer());
    const signed = validSignature(secret, request.headers.get('X-Groble-Signature'), timestamp, body)
      || validSignature(process.env.GROBLE_WEBHOOK_PREVIOUS_SECRET,
        request.headers.get('X-Groble-Signature-Previous'), timestamp, body);
    if (!signed) return new Response(null, { status: 401 });

    let event;
    try {
      event = JSON.parse(body.toString('utf8'));
    } catch {
      return new Response(null, { status: 400 });
    }
    const refunded = event?.type === 'payment.refunded';
    if (!refunded && event?.type !== 'payment.completed') return new Response(null, { status: 204 });

    const delivery = request.headers.get('X-Groble-Idempotency-Key');
    const payment = event.data?.object;
    const product = payment?.content?.id;
    const price = payment?.pricing?.finalAmount;
    if (!identifier(event.id) || !identifier(delivery) || !identifier(payment?.merchantUid)
      || !identifier(product) || !date(event.occurredAt)) {
      return new Response(null, { status: 400 });
    }
    if (payment.content.paymentType !== 'ONE_TIME' || payment.pricing?.currency !== 'KRW' || !amount(price)) {
      return new Response(null, { status: 204 });
    }

    const ref = payment.sellerReference;
    const refund = payment.refund;
    if (!refunded && (typeof ref !== 'string' || !/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(ref))) {
      if (product === process.env.GROBLE_CONTENT_ID) console.warn('[groble] payment missing KU-LIFE order reference');
      return new Response(null, { status: 204 });
    }
    if (refunded && (!date(refund?.refundedAt) || !amount(refund?.amount)
      || refund.currency !== 'KRW' || typeof refund.partialRefund !== 'boolean')) {
      return new Response(null, { status: 400 });
    }

    try {
      const { db } = supabaseClients(false);
      const result = await rewindRpc(db, 'rewind_groble_event', {
        p_event: event.id,
        p_delivery: delivery,
        p_merchant: payment.merchantUid,
        p_content: product,
        p_occurred_at: event.occurredAt,
        p_ref: refunded ? null : ref,
        p_amount: price,
        p_refund: refunded ? refund.amount : null,
        p_full: refunded && !refund.partialRefund,
        p_refunded_at: refunded ? refund.refundedAt : null,
      });
      if (result === 'unmatched' && product === process.env.GROBLE_CONTENT_ID) {
        console.warn('[groble] payment did not match a KU-LIFE order');
      }
      return new Response(null, { status: 204 });
    } catch (error) {
      console.error('[groble] event storage failed', error.code ?? error.name);
      return new Response(null, { status: 503 });
    }
  },
};
