import prisma from "../config/psql.js";
import razorpay from "../config/razorpay.js";
import crypto from 'crypto';
import { emailQueue } from "../queues/emailQueue.js";
import { emitPaymentConfirmed } from '../sockets/emitters.js'

export async function createOrderServices({ eventId, userId }) {
  try {
    console.log('Looking for eventId:', eventId, typeof eventId);
    const event = await prisma.Event.findUnique({ where: { id: eventId } });
    console.log('Event found:', event);
    if (!event) throw new Error('NOT_FOUND');

    console.log('Creating Razorpay order...');
    const order = await razorpay.orders.create({
      amount: event.price * 100,
      currency: 'INR',
      receipt: `rcpt_${userId.slice(0, 8)}`,
    });
    console.log('Razorpay order created:', order);

    const transaction = await prisma.Transaction.create({
      data: {
        eventId,
        userId,
        amount: event.price,
        status: 'PENDING',
        razorpayOrderId: order.id,
      },
    });

    return { order, transaction };
  } catch (err) {
    console.error('createOrderService error:', err);
    throw err;
  }
}

export async function verifyOrderServices({razorpayOrderId , razorpayPaymentId,razorpaySignature }){
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

    if(razorpaySignature !== expectedSignature)throw new Error("INVALID SIGNATURE");

    const transaction = await prisma.Transaction.update({
      where: { razorpayOrderId },
      data: {
        razorpayPaymentId,
        status: 'SUCCESS'
      },
      include: {
        user: { select: { email: true, name: true } },
        event: { select: { title: true, createdBy: true } },
        team: true,
      }
    })

    await emailQueue.add('sendConfirmation',{
      to: transaction.user.email,
      userName: transaction.user.name,
      eventName: transaction.event.title,
      amount: transaction.amount
    })

    emitPaymentConfirmed(transaction.event.createdBy, {
      userName: transaction.user.name,
      amount: transaction.amount,
      eventName: transaction.event.title
    })

    return transaction;
}

export async function getUserTransactionService({userId}){
    return await prisma.Transaction.findMany({
        where: { userId },
        include: {
        event: { select: { id: true, title: true, date: true, location: true } },
        team: { select: { id: true, name: true, registrationId: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
}

//For admin get All transactions
export async function getAllTransactionsService(){
     return await prisma.Transaction.findMany({
        include: {
        event: { select: { id: true, title: true, date: true, location: true } },
        user: { select: { id: true, name: true, email: true } },
        team: { select: { id: true, name: true, registrationId: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
}