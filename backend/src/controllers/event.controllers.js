import { createEventService,getPublicEventsService,getEventByIdService,updateEventService,deleteEventService,getMyEventsService } from '../services/event.service.js';

export async function createEvent(req, res) {
  try {
    const image = req.file?.path;
    const event = await createEventService({
      ...req.body,
      image,
      createdBy: req.user.userId,
      creatorEmail: req.user.email,
    });
    res.status(201).json({ success: true, event });
    } 
    catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create event' });
  }
}

export async function getPublicEvent(req,res){
    try {
        const event = await getPublicEventsService();
        res.status(200).json({success : true , event});
    } catch (err) {
        res.status(500).json({ error : 'Failed to fetch all public event'});
    }
}

export async function getEventById(req,res){
    try{
        const event = await getEventByIdService(req.params.id);
        if(!event)return res.status(404).json({error :'Event is not found'});
        res.status(200).json({ success: true , event });
    }
    catch(err){
        res.status(500).json({ error : "Failed to fetch event "});
    }
}

export async function updateEvent(req,res){
    try {
        const event = await updateEventService(req.params.id,req.user.userId,req.body,req.file?.path);
        res.status(200).json({success : true , event });
    } 
    catch (err) {
        if (err.message === 'NOT FOUND') return res.status(404).json({ error: 'Event not found' });
        if (err.message === 'UNAUTHORIZED') return res.status(403).json({ error: 'Not authorized' });
        res.status(500).json({ error: 'Failed to update event' });
    }
}

export async function deleteEvent(req,res){
    try {
        const event = await deleteEventService(req.params.id,req.user.userId);
        res.status(200).json({ success: true, event });
    } catch (err) {
        if (err.message === 'NOT FOUND') return res.status(404).json({ error: 'Event not found' });
        if (err.message === 'UNAUTHORIZED') return res.status(403).json({ error: 'Not authorized' });
        res.status(500).json({ error: 'Failed to delete event' });
    }
}

export async function getMyEvents(req,res){
    try {
        const events = await getMyEventsService(req.user.userId);
        res.status(200).json({ success: true , events })    
    } 
    catch (err) {
        res.status(500).json({ error : "Failed to fetch your events "});
    }
}

