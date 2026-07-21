import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import prisma from "./psql.js"

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value
    const name = profile.displayName
    const googleId = profile.id
    const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null

    let user = await prisma.users.findUnique({ where: { email } })

    if (!user) {
      user = await prisma.users.create({
        data: {
          name,
          email,
          googleId,
          avatar,
          is_verified: true,
          role: "student"
        }
      })
    } else if (!user.googleId) {
      // existing email/password user — link google to their account
      user = await prisma.users.update({
        where: { email },
        data: { googleId, avatar, is_verified: true }
      })
    }

    return done(null, user)
  } catch (err) {
    return done(err, null)
  }
}))

export default passport