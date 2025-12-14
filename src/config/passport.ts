import "dotenv/config";
import passport from "passport";
import { GoogleUser } from "../types/user";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { userDB } from "../db/users";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_CALLBACK_URL = "/auth/callback";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    (
      _accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done: VerifyCallback,
    ) => {
      const email = profile.emails?.[0].value || "";
      const isRegistered = userDB.exists(email);
      const user: GoogleUser = {
        googleId: profile.id,
        email: email,
        isRegistered: isRegistered,
      };

      console.log(`User logged in: ${email} (Registered: ${isRegistered})`);
      return done(null, user);
    },
  ),
);

passport.serializeUser((user: Express.User, done) => {
  const googleUser = user as GoogleUser;
  done(null, {
    googleId: googleUser.googleId,
    email: googleUser.email,
    isRegistered: googleUser.isRegistered,
  });
});

passport.deserializeUser((sessionUser: any, done) => {
  const isRegistered = userDB.exists(sessionUser.email);

  const user: GoogleUser = {
    googleId: sessionUser.googleId,
    email: sessionUser.email,
    isRegistered: isRegistered,
  };

  done(null, user);
});

export default passport;
