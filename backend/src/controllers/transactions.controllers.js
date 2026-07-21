import { createOrderServices,verifyOrderServices,getUserTransactionService,getAllTransactionsService } from '../services/transactions.services.js';

export async function createOrder(req,res){
    try {
        const { eventId } = req.body;
        const userId = req.user.userId;
        const result = await createOrderServices({ eventId,userId });
        res.status(201).json({ success: true , ...result });
    } catch (err) {
        if(err.message === 'NO EVENT')return res.status(404).json({ error : "Event not found "});
        res.status(500).json({ error : "Failed to create order "});
    }
}

export async function verifyOrder(req,res){
    try {
        const transaction = await verifyOrderServices(req.body);
        res.status(200).json({ success: true , transaction }); 
    } catch (err) {
        if(err.message === 'INVALID SIGNATURE')return res.status(400).json({ error : "Payment verification failed "});
        res.status(500).json({ error : "Failed to verify payment" });
    }
}

export async function getUserTransaction(req,res){
    try{
        const transaction = await getUserTransactionService({userId:req.user.userId});
        res.status(200).json({ success  :true  , transaction });
    } catch(err){
        res.status(500).json({ error :"Failed to fetch user transacations "});
    }
}

export async function getAllTransaction(req,res){
    try{
        const transaction = await getAllTransactionsService();
        res.status(200).json({ success  :true  , transaction });
    } catch(err){
        res.status(500).json({ error :"Failed to fetch all transacations "});
    }
}

