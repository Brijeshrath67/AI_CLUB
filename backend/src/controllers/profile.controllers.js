import { getProfileServices,updateProfileServices,deleteAccountService,updateAvatarService } from "../services/profile.service.js";

export async function getProfile(req,res){
    try {
        const profile = await getProfileServices(req.user.userId);
        res.status(200).json({success : true , profile})
    } catch (err) {
        res.status(500).json({ error : "Failed to get profile"});
    }
}

export async function updateProfile(req,res){
    try {
        const profile = await updateProfileServices(req.user.userId,req.body);
        res.status(200).json({ success : true , profile});
    } catch (err) {
        console.log(err.message);
        res.status(500).json({
            error: "Failed to update profile"
        });
    }
}

export async function uploadAvatar(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    const avatarUrl = req.file.path  

    const profile = await updateAvatarService(req.user.userId, avatarUrl)

    res.status(200).json({ success: true, profile })
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ error: "Failed to upload avatar" })
  }
}

export async function deleteProfile(req,res){
    try {
        await deleteAccountService(req.user.userId);
        res.clearCookie('refresh_token');
        res.status(200).json({ success: true, message: 'Account Deleted' });    
    } 
    catch (err) {
        res.status(500).json({ error : "Failed to delete profile "});
    }
}