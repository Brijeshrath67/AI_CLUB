import { getDashboardStatsService,getMyStatsService } from "../services/dashboard.service.js";

export async function getDashboardStats(req,res){
    try{
        const stats = await getDashboardStatsService();
        res.status(200).json({success: true, stats});
    }catch(err){
        res.status(500).json({ error : "Failed to fetch dashboard details"})
    }
}

export async function getMyStats(req,res){
    try {
        const stats = await getMyStatsService(req.user.userId);
        res.status(200).json({ success: true , stats });
    } 
    catch (err) {
        res.status(500).json({ error : "Failed to fetch your dashboard details"});
    }
}