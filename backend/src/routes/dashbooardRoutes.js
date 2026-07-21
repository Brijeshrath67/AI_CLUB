import express from "express";
import { getDashboardStats,getMyStats } from "../controllers/dashboard.controllers.js";
import { authenticate_token, authorise } from "../middleware/auth.js";

const router = express.Router();

router.get('/stats',authenticate_token,getDashboardStats);
router.get('/my-stats',authenticate_token,getMyStats);

export default router;