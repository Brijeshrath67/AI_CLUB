import prisma from "../config/psql.js";
import bcrypt from "bcryptjs";

export async function getProfileServices(userId) {
    return await prisma.users.findUnique({
        where: {id : userId},
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            is_verified: true,
            avatar: true,
            created_at: true,
        },
    });
}

export async function updateProfileServices(userId,data){
    const updateData = {};

    if(data.name) updateData.name = data.name;

    if(data.password){
        updateData.password = await bcrypt.hash(data.password,Number(process.env.SALT));
    }

    return await prisma.users.update({
        where: {id : userId},
        data : updateData,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            is_verified: true,
            avatar: true,
            created_at: true,
        },
    });

}

export async function updateAvatarService(userId, avatarUrl) {
  return await prisma.users.update({
    where: { id: userId },
    data: { avatar: avatarUrl },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      is_verified: true,
      avatar: true,
      created_at: true
    }
  })
}

export async function deleteAccountService(userId) {
    return await prisma.users.delete({
        where : {id : userId},
    })
}
