import "dotenv/config";
import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import {
  Strategy as LocalStrategy,
} from "passport-local";
import { UserRole } from "@/pkg/models";
import makeUserService from "@/pkg/user/service";
import { db } from "./drizzle";
import makeUserRepository from "@/pkg/user/repository";
import makeAuthService from "@/pkg/auth/service";
import { TempUser } from "@/internal/validator/user.schema";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const userRepository = makeUserRepository();
const userService = makeUserService(db, userRepository);
const authService = makeAuthService(db, userRepository);

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
      const photo = profile.photos?.[0]?.value || undefined;

      let user: TempUser;

      try {
        const dbUser = await userService.getUserByEmail(email);
        user = {
          id: dbUser.id,
          email: dbUser.email,
          role: dbUser.role,
          photo: dbUser.photo ?? undefined,
        };
      } catch (err) {
        user = {
          email: email,
          role: UserRole.RESERVER,
          photo,
        };
      }

      console.log(`User logged in: ${email}`);
      return done(null, user);
    },
  ),
);

passport.use(new LocalStrategy(
 {usernameField:"email", passwordField:"password"},
  async (email, password, done) => {
    try {
      const user = await authService.loginEmailPassword({ email, password })
      return done(null, user)
    } catch (err) {
      return done(err)
    };
  }
));

passport.serializeUser((user: Express.User, done) => {
  done(null, user);
});

passport.deserializeUser(async (sessionUser: any, done) => {
  done(null, sessionUser);
});

export default passport;
