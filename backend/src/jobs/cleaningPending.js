import cron from 'node-cron'
import prisma from '../config/psql.js'

export const cleanPending = () => {
    cron.schedule('0 2 * * *',async () => {
        const before_today = new Date(Date.now() - 30 * 60 * 1000);

        try{
            const updated = await prisma.Transaction.updateMany({
                where: { status : 'PENDING',
                    createdAt: { lt : before_today }
                },
                data: {
                    status: 'FAILED'
                }
            })
            console.log(`[CRON] Marked ${updated.count} stale transactions as FAILED`)
        }
        catch(err){
            console.log(`Cron job error`)
        }
    })
}