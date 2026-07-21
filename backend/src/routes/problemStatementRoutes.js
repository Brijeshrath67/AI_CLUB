import express from 'express';
import { getProblemStatements, createProblemStatement, deleteProblemStatement, updateProblemStatement } from '../controllers/problemStatement.controllers.js';
import { authenticate_token } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.get('/', getProblemStatements);
router.post('/', authenticate_token, createProblemStatement);
router.put('/:psId', authenticate_token, updateProblemStatement);
router.delete('/:psId', authenticate_token, deleteProblemStatement);

export default router;
