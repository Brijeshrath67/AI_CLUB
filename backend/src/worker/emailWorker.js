import 'dotenv/config'; 
import { Worker } from 'bullmq'
import { bullConnection } from '../config/bullmq.js'
import { sendEmail } from '../services/mailer.service.js'

export const emailWorker = new Worker('emailQueue',async (job) =>{
    const { to,eventName,amount,userName } = job.data;

    await sendEmail({
        to,
        subject: `Payment Confirmed — ${eventName}`,
        text: `Hi ${userName}, your payment of ₹${amount} for ${eventName} is confirmed.`,
        html: `<p>Hi <b>${userName}</b>, your payment of <b>₹${amount}</b> for <b>${eventName}</b> is confirmed.</p>`
    })
},{ connection : bullConnection })

emailWorker.on('completed', (job) => {
  console.log(`[EMAIL] Job ${job.id} sent successfully`)
})

emailWorker.on('failed', (job, err) => {
  console.error(`[EMAIL] Job ${job.id} failed:`, err.message)
})