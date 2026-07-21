import prisma from "../config/psql.js";

export async function getDashboardStatsService() {
  const [totalUsers, totalEvents, totalTransactions, amountData] = await Promise.all([
    prisma.users.count(),
    prisma.Event.count(),
    prisma.Transaction.count({ where: { status: 'SUCCESS' } }),
    prisma.Transaction.aggregate({
      _sum: { amount: true },
      where: { status: 'SUCCESS' },
    }),
  ]);

  return {
    totalUsers,
    totalEvents,
    totalTransactions,
    totalAmountCollected: amountData._sum.amount || 0,
  };
}

export async function getMyStatsService(userId){
    const [ totalEvents,totalTransactions,successfulPayments,amountData ] = await Promise.all([
      prisma.Event.count({ where : {createdBy : userId }}),
      prisma.Transaction.count({ where : { userId }}),
      prisma.Transaction.count({ where : { userId,status : 'SUCCESS' }}),
      prisma.Transaction.aggregate({
        _sum: { amount: true },
        where: { userId,status:'SUCCESS' },
      }),
    ]);

    return {
      totalEvents,
      totalTransactions,
      successfulPayments,
      totalAmountSpent: amountData._sum.amount || 0,
    };
}

