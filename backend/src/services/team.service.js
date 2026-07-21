import prisma from "../config/psql.js";

function generateRegistrationId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'HACK-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function registerTeamService({ eventId, userId, teamName, members, problemStatementId }) {
  const event = await prisma.Event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error('EVENT_NOT_FOUND');
  if (!event.isHackathon) throw new Error('NOT_HACKATHON');

  const memberCount = members.length;
  const min = event.minTeamSize || 1;
  const max = event.maxTeamSize || 5;

  if (memberCount < min || memberCount > max) {
    throw new Error(`TEAM_SIZE_INVALID: Team must have ${min}-${max} members`);
  }

  const hasFemale = members.some(m => m.gender && m.gender.toLowerCase() === 'female');
  if (!hasFemale) throw new Error('NO_FEMALE_MEMBER');

  const registeredCount = await prisma.Team.count({ where: { eventId } });
  if (registeredCount >= event.capacity) throw new Error('EVENT_FULL');

  const existingTeam = await prisma.Team.findFirst({
    where: { eventId, leaderId: userId }
  });
  if (existingTeam) throw new Error('ALREADY_REGISTERED');

  if (problemStatementId) {
    const ps = await prisma.ProblemStatement.findUnique({ where: { id: problemStatementId } });
    if (!ps || ps.eventId !== eventId) throw new Error('INVALID_PROBLEM_STATEMENT');
  }

  const registrationId = generateRegistrationId();

  const team = await prisma.Team.create({
    data: {
      name: teamName,
      eventId,
      leaderId: userId,
      members,
      registrationId,
      problemStatementId: problemStatementId || null,
    },
    include: {
      leader: { select: { id: true, name: true, email: true } },
      event: { select: { id: true, title: true, date: true, location: true } },
      problemStatement: { select: { id: true, title: true } },
    },
  });

  return team;
}

export async function getMyTeamsService(userId) {
  return await prisma.Team.findMany({
    where: { leaderId: userId },
    include: {
      event: { select: { id: true, title: true, date: true, location: true, isHackathon: true } },
      transaction: { select: { id: true, amount: true, status: true, createdAt: true } },
      problemStatement: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getEventTeamsService(eventId, userId) {
  const event = await prisma.Event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error('EVENT_NOT_FOUND');
  if (event.createdBy !== userId) throw new Error('UNAUTHORIZED');

  return await prisma.Team.findMany({
    where: { eventId },
    include: {
      leader: { select: { id: true, name: true, email: true, avatar: true, phone: true } },
      transaction: { select: { id: true, amount: true, status: true, razorpayOrderId: true, razorpayPaymentId: true, createdAt: true } },
      problemStatement: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getTeamByIdService(teamId) {
  return await prisma.Team.findUnique({
    where: { id: teamId },
    include: {
      leader: { select: { id: true, name: true, email: true, avatar: true } },
      event: { select: { id: true, title: true, date: true, location: true, isHackathon: true, price: true } },
      transaction: { select: { id: true, amount: true, status: true, razorpayOrderId: true, razorpayPaymentId: true, createdAt: true } },
      problemStatement: { select: { id: true, title: true, description: true } },
    },
  });
}

export async function getHackathonStatsService(eventId, userId) {
  const event = await prisma.Event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error('EVENT_NOT_FOUND');
  if (event.createdBy !== userId) throw new Error('UNAUTHORIZED');

  const teams = await prisma.Team.findMany({
    where: { eventId },
    include: {
      transaction: { select: { amount: true, status: true } },
      problemStatement: { select: { id: true, title: true } },
    },
  });

  const totalTeams = teams.length;
  const totalMembers = teams.reduce((sum, t) => {
    const members = typeof t.members === 'string' ? JSON.parse(t.members) : t.members;
    return sum + members.length;
  }, 0);

  const paidTeams = teams.filter(t => t.transaction?.status === 'SUCCESS');
  const pendingTeams = teams.filter(t => !t.transaction || t.transaction?.status === 'PENDING');
  const failedTeams = teams.filter(t => t.transaction?.status === 'FAILED');

  const totalCollection = paidTeams.reduce((sum, t) => sum + (t.transaction?.amount || 0), 0);
  const expectedCollection = totalTeams * (event.price || 0);

  const genderBreakdown = { male: 0, female: 0, other: 0 };
  teams.forEach(t => {
    const members = typeof t.members === 'string' ? JSON.parse(t.members) : t.members;
    members.forEach(m => {
      const g = (m.gender || '').toLowerCase();
      if (g === 'male') genderBreakdown.male++;
      else if (g === 'female') genderBreakdown.female++;
      else genderBreakdown.other++;
    });
  });

  const problemStatementBreakdown = {};
  teams.forEach(t => {
    const psTitle = t.problemStatement?.title || 'Unassigned';
    problemStatementBreakdown[psTitle] = (problemStatementBreakdown[psTitle] || 0) + 1;
  });

  const avgTeamSize = totalTeams > 0 ? (totalMembers / totalTeams).toFixed(1) : 0;

  return {
    totalTeams,
    totalMembers,
    avgTeamSize: parseFloat(avgTeamSize),
    paidTeams: paidTeams.length,
    pendingTeams: pendingTeams.length,
    failedTeams: failedTeams.length,
    totalCollection,
    expectedCollection,
    genderBreakdown,
    problemStatementBreakdown,
    recentTeams: teams.slice(-5).reverse().map(t => ({
      id: t.id,
      name: t.name,
      createdAt: t.createdAt,
      paymentStatus: t.transaction?.status || 'NONE',
    })),
  };
}
