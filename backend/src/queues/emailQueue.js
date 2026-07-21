import { Queue } from 'bullmq'
import { bullConnection } from '../config/bullmq.js'

export const emailQueue = new Queue('emailQueue', {
    connection: bullConnection
})