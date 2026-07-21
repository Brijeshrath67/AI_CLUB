import prisma from "../config/psql.js"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { generateAccessToken, generateRefreshToken } from "../utils/tokens.js"

//Hash refresh token before storing
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex")

export const registerUser = async ({ name , email , password , role }) => {
    try{
        const existing = await prisma.users.findUnique({
            where : { email }
        })
        if(existing){
            throw { status: 409, message: "Email already registered" }
        }
        const hashPassword = await bcrypt.hash(password, Number(process.env.SALT))
        
        const user = await prisma.users.create({
            data: {
                name,
                email,
                password:hashPassword,
                role:role || "student"
            },
            select:{
                id:true,
                name:true,
                email:true,
                role:true,
                is_verified:true,
                created_at:true
            }
        })
        return user;
    }
    catch(err){
        console.log(err);
        throw err.status ? err : { status: 500, message: "Server error" }
    }
}

export const loginUser = async ({ email, password, requiredRole }) => {
    try{
        const user = await prisma.users.findUnique({
            where:{email}
        })


        if(!user){
            throw { status: 401, message: "Invalid email or password" }
        }

        if (!user.password) {
          throw { status: 400, message: 'This account uses Google login. Please sign in with Google.' }
        }

        const match = await bcrypt.compare(password,user.password)
        if(!match){
            throw { status: 401, message: "Incorrect password" }
        }

        // Role-based portal access enforcement
        // Treat null/undefined role as 'student' (default)
        const effectiveRole = user.role || 'student';
        if (requiredRole && effectiveRole !== requiredRole) {
            if (requiredRole === 'organiser') {
                throw { status: 403, message: "Access denied. This account is not registered as an organiser. Please use the student portal." }
            } else {
                throw { status: 403, message: "Access denied. This account is not registered as a student. Please use the organiser portal." }
            }
        }

        const accessToken  = generateAccessToken(user.id, user.email, user.role)
        const refreshToken = generateRefreshToken(user.id, user.email, user.role)

       await prisma.refresh_tokens.deleteMany({
            where: { user_id: user.id }
        })

        await prisma.refresh_tokens.create({
            data: {
                user_id: user.id,
                token_hash: hashToken(refreshToken),
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        })
        const safeUser = {
            id:          user.id,
            name:        user.name,
            email:       user.email,
            role:        user.role,
            is_verified: user.is_verified,
            avatar:      user.avatar,
            created_at:  user.created_at
        }

        return { accessToken, refreshToken, user: safeUser }

    }
    catch(err){
        console.log(err);
        throw err.status ? err : { status: 500, message: "Server error" }
    }
}

export const refreshUserToken = async (oldToken) => {
  try {
    if (!oldToken) {
      throw { status: 401, message: "No refresh token" }
    }

    const tokenhash = hashToken(oldToken);

    const stored = await prisma.refresh_tokens.findUnique({
      where: { token_hash: tokenhash },
      include: { users: true }
    });

    if (!stored || stored.expires_at < new Date()) {
      throw { status: 401, message: "Token expired or revoked" }
    }

    const newAccessToken = generateAccessToken(
      stored.users.id,
      stored.users.email,
      stored.users.role
    );
    const newRefreshToken = generateRefreshToken(
      stored.users.id,
      stored.users.email,
      stored.users.role
    );

    // ✅ atomic — delete old and create new in one transaction
    await prisma.$transaction([
    prisma.refresh_tokens.deleteMany({
        where: { token_hash: tokenhash }  // soft — won't throw if missing
    }),
    prisma.refresh_tokens.upsert({
        where: { token_hash: hashToken(newRefreshToken) },
        update: {
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        create: {
        user_id: stored.users.id,
        token_hash: hashToken(newRefreshToken),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
    })
    ]);

    return { newAccessToken, newRefreshToken };

  } catch (err) {
    console.log(err);
    throw err.status ? err : { status: 500, message: "Server error" }
  }
}

export const logoutUser = async (token) => {
  if (!token){
    throw { status: 401, message: "No refresh token" }
    }

  await prisma.refresh_tokens.deleteMany({
    where: { token_hash: hashToken(token) }
  })
}

export const getMe = async (userId) => {
    try{
        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: {
            id:          true,
            name:        true,
            email:       true,
            role:        true,
            is_verified: true,
            avatar:      true,
            created_at:  true
            }
        })

        if (!user) {
            throw { status: 404, message: "User not found" }
        }

        return user;
    }
    catch(err){
        console.log(err); 
        throw err.status ? err : { status: 500, message: "Server error" }
    }
}

export const loginWithGoogle = async (user) => {
  try {
    const accessToken = generateAccessToken(user.id, user.email, user.role)
    const refreshToken = generateRefreshToken(user.id, user.email, user.role)

    await prisma.refresh_tokens.deleteMany({
      where: { user_id: user.id }
    })

    await prisma.refresh_tokens.create({
      data: {
        user_id: user.id,
        token_hash: hashToken(refreshToken),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })

    return { accessToken, refreshToken }
  } catch (err) {
    console.log(err)
    throw err.status ? err : { status: 500, message: "Server error" }
  }
}