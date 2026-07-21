import express from "express"
import authRoutes from "./authroutes.js"
import eventRoutes from "./eventRoutes.js";
import transactionRoutes from "./transactionsRoutes.js"
import dashboardRoutes from './dashbooardRoutes.js'
import profileRoutes from './profileRoutes.js'
import teamRoutes from './teamRoutes.js'

const router = express.Router()

// Group routes
router.use("/auth", authRoutes);
router.use("/events",eventRoutes);
router.use("/transactions",transactionRoutes);
router.use('/dashboard',dashboardRoutes);
router.use('/profile',profileRoutes);
router.use('/teams',teamRoutes);

export default router