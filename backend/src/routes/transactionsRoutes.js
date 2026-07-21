import express from 'express';
import { createOrder,verifyOrder,getUserTransaction,getAllTransaction } from '../controllers/transactions.controllers.js'
import { authenticate_token, authorise } from '../middleware/auth.js';

const router = express.Router();

router.post('/order',authenticate_token,createOrder);
router.post('/verify',authenticate_token,verifyOrder);
router.get('/my',authenticate_token,getUserTransaction);
router.get('/all',authenticate_token,authorise('admin'),getAllTransaction);

export default router;