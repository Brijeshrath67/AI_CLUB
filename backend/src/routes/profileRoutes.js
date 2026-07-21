import express from 'express';
import { getProfile,updateProfile,deleteProfile,uploadAvatar } from '../controllers/profile.controllers.js';
import { authenticate_token } from '../middleware/auth.js';
import { avatarUpload } from "../config/upload.js"

const router = express.Router();

router.get('/',authenticate_token,getProfile);
router.put('/',authenticate_token,updateProfile);
router.delete('/',authenticate_token,deleteProfile);
router.post("/avatar", authenticate_token, avatarUpload.single("avatar"), uploadAvatar)

export default router;