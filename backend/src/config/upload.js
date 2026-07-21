import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from "multer";

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

const storage = new CloudinaryStorage({
    cloudinary,
    params : {
        folder:'ml-hive/events',
        allowed_formats:['jpg','jpeg','png','webp'],
    },
});

const avatarStorage = new CloudinaryStorage({
    cloudinary,
    params : {
        folder:'ml-hive/avatars',
        allowed_formats:['jpg','jpeg','png','webp'],
    },
});

export const upload = multer({storage});
export const avatarUpload = multer({storage: avatarStorage});