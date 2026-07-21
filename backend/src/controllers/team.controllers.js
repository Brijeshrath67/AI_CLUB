import { registerTeamService, getMyTeamsService, getEventTeamsService, getTeamByIdService, getHackathonStatsService } from '../services/team.service.js';

export async function registerTeam(req, res) {
  try {
    const { eventId, teamName, members, problemStatementId } = req.body;
    if (!eventId || !teamName || !members || !Array.isArray(members)) {
      return res.status(400).json({ error: 'eventId, teamName, and members array are required' });
    }

    const team = await registerTeamService({
      eventId,
      userId: req.user.userId,
      teamName,
      members,
      problemStatementId,
    });

    res.status(201).json({ success: true, team });
  } catch (err) {
    if (err.message === 'EVENT_NOT_FOUND') return res.status(404).json({ error: 'Event not found' });
    if (err.message === 'NOT_HACKATHON') return res.status(400).json({ error: 'This event is not a hackathon' });
    if (err.message.startsWith('TEAM_SIZE_INVALID')) return res.status(400).json({ error: err.message.split(': ')[1] });
    if (err.message === 'NO_FEMALE_MEMBER') return res.status(400).json({ error: 'Team must have at least 1 female member' });
    if (err.message === 'EVENT_FULL') return res.status(400).json({ error: 'Event is at full capacity' });
    if (err.message === 'ALREADY_REGISTERED') return res.status(409).json({ error: 'You have already registered a team for this event' });
    if (err.message === 'INVALID_PROBLEM_STATEMENT') return res.status(400).json({ error: 'Invalid problem statement for this event' });
    console.error('registerTeam error:', err);
    res.status(500).json({ error: 'Failed to register team' });
  }
}

export async function getMyTeams(req, res) {
  try {
    const teams = await getMyTeamsService(req.user.userId);
    res.status(200).json({ success: true, teams });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
}

export async function getEventTeams(req, res) {
  try {
    const teams = await getEventTeamsService(req.params.eventId, req.user.userId);
    res.status(200).json({ success: true, teams });
  } catch (err) {
    if (err.message === 'EVENT_NOT_FOUND') return res.status(404).json({ error: 'Event not found' });
    if (err.message === 'UNAUTHORIZED') return res.status(403).json({ error: 'Not authorized' });
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
}

export async function getTeamById(req, res) {
  try {
    const team = await getTeamByIdService(req.params.teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.status(200).json({ success: true, team });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch team' });
  }
}

export async function getHackathonStats(req, res) {
  try {
    const stats = await getHackathonStatsService(req.params.eventId, req.user.userId);
    res.status(200).json({ success: true, stats });
  } catch (err) {
    if (err.message === 'EVENT_NOT_FOUND') return res.status(404).json({ error: 'Event not found' });
    if (err.message === 'UNAUTHORIZED') return res.status(403).json({ error: 'Not authorized' });
    res.status(500).json({ error: 'Failed to fetch hackathon stats' });
  }
}
