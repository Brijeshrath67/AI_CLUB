import express from 'express';
import { registerTeam, getMyTeams, getEventTeams, getTeamById, getHackathonStats } from '../controllers/team.controllers.js';
import { authenticate_token } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', authenticate_token, registerTeam);
router.get('/my', authenticate_token, getMyTeams);
router.get('/event/:eventId', authenticate_token, getEventTeams);
router.get('/stats/:eventId', authenticate_token, getHackathonStats);
router.get('/:teamId', authenticate_token, getTeamById);

export default router;
