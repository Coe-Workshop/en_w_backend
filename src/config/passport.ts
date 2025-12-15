import "dotenv/config";
import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { db } from "./drizzle";
import { GoogleUser } from "@/pkg/models";
import userRepository from "@/pkg/user/repository";
import userService from "@/pkg/user/service";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL!;
const userRepo = userRepository();
const userSvc = userService(db, userRepo);

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done: VerifyCallback,
    ) => {
      const email = profile.emails?.[0].value || "";
      let isRegistered = false;
      try {
        await userSvc.getUserByEmail(email);
        isRegistered = true;
      } catch {
        // do nothing
      }

      const user: GoogleUser = {
        googleId: profile.id,
        email: email,
        isRegistered,
      };
      console.log(`User logged in: ${email} (Registered: ${isRegistered})`);
      return done(null, user);
    },
  ),
);

// เก็บข้อมูล
passport.serializeUser((user: Express.User, done) => {
  const googleUser = user as GoogleUser;
  done(null, {
    googleId: googleUser.googleId,
    email: googleUser.email,
    isRegistered: googleUser.isRegistered,
  });
});

// ส่งข้อมูล
passport.deserializeUser(async (sessionUser: any, done) => {
  let user: GoogleUser = {
    googleId: sessionUser.googleId,
    email: sessionUser.email,
    isRegistered: false,
  };

  try {
    await userSvc.getUserByEmail(sessionUser.email);
    user = { ...user, isRegistered: true };
  } catch {
    // do nothing
  }

  done(null, user);
});

export default passport;
