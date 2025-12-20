import "dotenv/config";
import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { GoogleUser } from "@/pkg/models";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/v1/auth/callback",
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done: VerifyCallback,
    ) => {
      const email = profile.emails?.[0].value || "";

      const user: GoogleUser = {
        googleId: profile.id,
        email: email,
      };
      console.log(`User logged in: ${email}`);
      return done(null, user);
    },
  ),
);

passport.serializeUser((user: Express.User, done) => {
  const googleUser = user as GoogleUser;
  done(null, {
    googleId: googleUser.googleId,
    email: googleUser.email,
  });
});

passport.deserializeUser(async (sessionUser: any, done) => {
  const user: GoogleUser = {
    googleId: sessionUser.googleId,
    email: sessionUser.email,
  };

  done(null, user);
});

export default passport;
