import express from 'express';
import { createEvent,getPublicEvent,getEventById,updateEvent,deleteEvent,getMyEvents } from '../controllers/event.controllers.js';
import problemStatementRoutes from './problemStatementRoutes.js';

import { authenticate_token } from '../middleware/auth.js';
import { upload } from '../config/upload.js'

const router = express.Router()

router.post('/', authenticate_token, (req, res, next) => {
    console.log('content-type:', req.headers['content-type']);
    next();
}, upload.single('image'), createEvent);
router.get('/',getPublicEvent);
router.get('/my',authenticate_token,getMyEvents);
router.get('/:id',getEventById);
router.put('/:id',authenticate_token,upload.single('image'),updateEvent);
router.delete('/:id',authenticate_token,deleteEvent);

router.use('/:id/problem-statements', problemStatementRoutes);

export default router 