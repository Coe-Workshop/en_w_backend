import "dotenv/config";
import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { GoogleUser, TempUser, UserRole } from "@/pkg/models";
import makeUserService from "@/pkg/user/service";
import { db } from "./drizzle";
import makeUserRepository from "@/pkg/user/repository";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const userRepository = makeUserRepository();
const userService = makeUserService(db, userRepository);

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

      let user: TempUser;

      try {
	user = await userService.getUserByEmail(email);
      } catch (err) {
	user = {
	  email: email,
	  role: UserRole.RESERVER,
	};
      }

      console.log(`User logged in: ${email}`);
      return done(null, user);
    },
  ),
);

passport.serializeUser((user: Express.User, done) => {
  done(null, user);
});

passport.deserializeUser(async (sessionUser: any, done) => {
  done(null, sessionUser);
});

export default passport;
