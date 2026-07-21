import express from 'express';
import crypto from 'crypto';
import prisma from '../config/psql.js';
import { emailQueue } from '../queues/emailQueue.js';
import { emitPaymentConfirmed } from '../sockets/emitters.js';

const router = express.Router();

// Razorpay webhook - raw body needed for signature verification
router.post('/razorpay', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn('RAZORPAY_WEBHOOK_SECRET not set, skipping webhook verification');
      return res.status(200).json({ ok: true });
    }

    const body = req.body.toString('utf8');
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Webhook signature mismatch');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(body);
    const eventType = event.event;

    if (eventType === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;
      const paymentId = payment.id;
      const webhookId = event.id;

      const existing = await prisma.Transaction.findFirst({
        where: { razorpayWebhookId: webhookId }
      });
      if (existing) {
        return res.status(200).json({ ok: true, message: 'Already processed' });
      }

      const transaction = await prisma.Transaction.update({
        where: { razorpayOrderId: orderId },
        data: {
          razorpayPaymentId: paymentId,
          razorpayWebhookId: webhookId,
          status: 'SUCCESS',
        },
        include: {
          user: { select: { email: true, name: true } },
          event: { select: { title: true, createdBy: true } },
          team: true,
        },
      });

      await emailQueue.add('sendConfirmation', {
        to: transaction.user.email,
        userName: transaction.user.name,
        eventName: transaction.event.title,
        amount: transaction.amount,
      });

      emitPaymentConfirmed(transaction.event.createdBy, {
        userName: transaction.user.name,
        amount: transaction.amount,
        eventName: transaction.event.title,
      });
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(200).json({ ok: true });
  }
});

export default router;
