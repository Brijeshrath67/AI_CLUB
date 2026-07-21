import { v4 as uuid } from 'uuid';
import prisma from "../config/psql.js";
import { sendEmail } from './mailer.service.js';

//Create event
export async function createEventService({ title, description, date, location, price, capacity, type, image, createdBy, creatorEmail, isHackathon, maxTeamSize, minTeamSize, problemStatements }) {
  const eventData = {
    title,
    description,
    date: new Date(date),
    location,
    price: parseFloat(price),
    capacity: parseInt(capacity),
    image: image || '',
    type: type === 'PRIVATE' ? 'PRIVATE' : 'PUBLIC',
    isHackathon: isHackathon === 'true' || isHackathon === true,
    maxTeamSize: maxTeamSize ? parseInt(maxTeamSize) : null,
    minTeamSize: minTeamSize ? parseInt(minTeamSize) : null,
    user: {
      connect: { id: createdBy }
    },
  };

  if (type === 'PRIVATE') {
    eventData.code = uuid().slice(0, 8).toUpperCase();
  }

  if (isHackathon && problemStatements) {
    const statements = typeof problemStatements === 'string' ? JSON.parse(problemStatements) : problemStatements;
    eventData.problemStatements = {
      create: statements.map(ps => ({ title: ps.title, description: ps.description }))
    };
  }

  const event = await prisma.Event.create({
    data: eventData,
    include: { problemStatements: true }
  });

  await sendEmail({
    to: creatorEmail,
    subject: `Your event "${title}" has been created!`,
    html: `
      <h2>Event Created Successfully</h2>
      <p>Your event <b>${title}</b> has been created.</p>
      <ul>
        <li>Date: ${new Date(date).toDateString()}</li>
        <li>Location: ${location}</li>
        <li>Price: Rs.${price}</li>
        <li>Capacity: ${capacity}</li>
        <li>Type: ${type}</li>
        ${eventData.isHackathon ? `<li>Hackathon: Yes (Team size: ${minTeamSize || 1}-${maxTeamSize || 5})</li>` : ''}
        ${eventData.code ? `<li>Private Code: <b>${eventData.code}</b></li>` : ''}
      </ul>
      <p>-- Fundo Team</p>
    `,
  });

  return event;
}

//Get public events
export async function getPublicEventsService() {
    return await prisma.Event.findMany({
        where: { type: 'PUBLIC' },
        include: {
            user: { select: { id : true , name : true , email : true, avatar: true } },
            _count : { select: { transactions: {
              where:{status : "SUCCESS"}
            }, teams: true }},
        },
        orderBy : { createdAt : "desc" },
    });
}

//Get private events - By primary uuid
export async function getEventByIdService(id){
    return await prisma.Event.findUnique({
        where: { id },
        include: {
            user: {select : { id: true , name: true , email : true, avatar: true }},
            _count: { select: {transactions : true, teams: true }},
            problemStatements: true,
            teams: {
              include: { leader: { select: { id: true, name: true, email: true } } }
            },
        },
    })
}

//Update event service
export async function updateEventService(id ,userid ,data ,imageUrl){
    const event = await prisma.Event.findUnique({ where : { id } });

    if(!event)throw new Error('NOT FOUND');
    if(event.createdBy !== userid) throw new Error('UNAUTHORIZED');

    return await prisma.Event.update({
        where: { id },
        data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.date && { date: new Date(data.date) }),
        ...(data.location && { location: data.location }),
        ...(data.price && { price: parseFloat(data.price) }),
        ...(data.capacity && { capacity: parseInt(data.capacity) }),
        ...(imageUrl && { image: imageUrl }),
        },
    });
}

//Delete event service
export async function deleteEventService(id,userId){
    const event = await prisma.Event.findUnique({ where : { id } });

    if(!event)throw new Error('NOT FOUND');
    if(event.createdBy !== userId)throw new Error('UNAUTHORIZED');

    return await prisma.Event.delete({
        where: { id },
    });
}

export async function getMyEventsService(userId){
    return await prisma.Event.findMany({
        where: { createdBy : userId },
        include:{
            _count : { select : { transactions : true, teams: true }},
            problemStatements: true,
        },
        orderBy: { createdAt : 'desc'},
    });
}

