import prisma from "../config/psql.js";

export async function getProblemStatementsService(eventId) {
  return await prisma.ProblemStatement.findMany({
    where: { eventId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function createProblemStatementService(eventId, userId, { title, description }) {
  const event = await prisma.Event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error('NOT_FOUND');
  if (event.createdBy !== userId) throw new Error('UNAUTHORIZED');

  return await prisma.ProblemStatement.create({
    data: { eventId, title, description },
  });
}

export async function deleteProblemStatementService(eventId, psId, userId) {
  const event = await prisma.Event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error('NOT_FOUND');
  if (event.createdBy !== userId) throw new Error('UNAUTHORIZED');

  const ps = await prisma.ProblemStatement.findUnique({ where: { id: psId } });
  if (!ps || ps.eventId !== eventId) throw new Error('NOT_FOUND');

  return await prisma.ProblemStatement.delete({ where: { id: psId } });
}

export async function updateProblemStatementService(eventId, psId, userId, { title, description }) {
  const event = await prisma.Event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error('NOT_FOUND');
  if (event.createdBy !== userId) throw new Error('UNAUTHORIZED');

  const ps = await prisma.ProblemStatement.findUnique({ where: { id: psId } });
  if (!ps || ps.eventId !== eventId) throw new Error('NOT_FOUND');

  return await prisma.ProblemStatement.update({
    where: { id: psId },
    data: {
      ...(title && { title }),
      ...(description && { description }),
    },
  });
}
