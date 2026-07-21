import { getProblemStatementsService, createProblemStatementService, deleteProblemStatementService, updateProblemStatementService } from '../services/problemStatement.service.js';

export async function getProblemStatements(req, res) {
  try {
    const statements = await getProblemStatementsService(req.params.id);
    res.status(200).json({ success: true, problemStatements: statements });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch problem statements' });
  }
}

export async function createProblemStatement(req, res) {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    const statement = await createProblemStatementService(req.params.id, req.user.userId, { title, description });
    res.status(201).json({ success: true, problemStatement: statement });
  } catch (err) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'Event not found' });
    if (err.message === 'UNAUTHORIZED') return res.status(403).json({ error: 'Not authorized' });
    res.status(500).json({ error: 'Failed to create problem statement' });
  }
}

export async function deleteProblemStatement(req, res) {
  try {
    await deleteProblemStatementService(req.params.id, req.params.psId, req.user.userId);
    res.status(200).json({ success: true, message: 'Problem statement deleted' });
  } catch (err) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'Not found' });
    if (err.message === 'UNAUTHORIZED') return res.status(403).json({ error: 'Not authorized' });
    res.status(500).json({ error: 'Failed to delete problem statement' });
  }
}

export async function updateProblemStatement(req, res) {
  try {
    const statement = await updateProblemStatementService(req.params.id, req.params.psId, req.user.userId, req.body);
    res.status(200).json({ success: true, problemStatement: statement });
  } catch (err) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'Not found' });
    if (err.message === 'UNAUTHORIZED') return res.status(403).json({ error: 'Not authorized' });
    res.status(500).json({ error: 'Failed to update problem statement' });
  }
}
