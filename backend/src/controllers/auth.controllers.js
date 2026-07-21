import {
  registerUser,
  loginUser,
  refreshUserToken,
  logoutUser,
  getMe
  ,loginWithGoogle
} from "../services/auth.service.js"
import redis from '../config/redis.js'
import prisma from '../config/psql.js'

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existing = await prisma.users.findUnique({
      where: { email }
    })
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered" })
    }

    const isVerified = await redis.get(`verified:${email}`)
    if (!isVerified) {
      return res.status(403).json({ error: 'Email not verified. Please complete OTP verification.' })
    }

    await redis.del(`verified:${email}`);

    const user = await registerUser(req.body)
    
    return res.status(201).json({
      success: true,
      user
    })
    
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message
    })
  }
}

export const login = async (req, res) => {
  try {
    const { requiredRole } = req.body;
    const { accessToken, refreshToken, user } =
      await loginUser({ ...req.body, requiredRole })

    // Set refresh token in cookie
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.json({
      success: true,
      access_token: accessToken,
      user
    })
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message
    })
  }
}

export const refresh = async (req, res) => {
  try {
    const oldToken = req.cookies.refresh_token

    const { newAccessToken, newRefreshToken } =
      await refreshUserToken(oldToken)

    // rotate cookie
    res.cookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.json({
      success: true,
      access_token: newAccessToken
    })
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message
    })
  }
}

export const logout = async (req, res) => {
  try {
    const token = req.cookies.refresh_token

    await logoutUser(token)

    res.clearCookie("refresh_token", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // ✅
      secure: process.env.NODE_ENV === "production", // ✅
      path: "/"
    })

    return res.json({
      success: true,
      message: "Logged out successfully"
    })
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message
    })
  }
}

export const me = async (req, res) => {
  try {
    const user = await getMe(req.user.userId);

    return res.json({
      success: true,
      user
    })
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message
    })
  }
}


export const googleCallback = async (req, res) => {
  try {
    const { accessToken, refreshToken } = await loginWithGoogle(req.user)

   res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  })

    // Set access token as a short-lived httpOnly cookie (not in URL)
    res.cookie("oauth_access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 60 * 1000, // 1 minute — just long enough for the redirect
      path: "/"
    })

    // Redirect without token in URL
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback`)
  } catch (err) {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`)
  }
}

// Exchange the short-lived oauth cookie for the access token (JSON response)
export const exchangeOAuthToken = (req, res) => {
  const token = req.cookies?.oauth_access_token

  // Clear the cookie immediately after reading
  res.clearCookie("oauth_access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/"
  })

  if (!token) {
    return res.status(401).json({ success: false, message: "No OAuth token found" })
  }

  return res.json({ success: true, access_token: token })
}