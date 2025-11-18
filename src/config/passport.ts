import 'dotenv/config';
import passport from "passport";
import {GoogleUser} from "../types/user";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_CALLBACK_URL=process.env.GOOGLE_CALLBACK_URL!;

passport.use(
    new GoogleStrategy(
        {
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: GOOGLE_CALLBACK_URL,
        },
        (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
            const user: GoogleUser = {
                googleId: profile.id,
                email: profile.emails?.[0]?.value || '',
                name: profile.displayName,
                picture: profile.photos?.[0]?.value || '',
            };

            console.log('User logged in:', user.email);
            return done(null, user);
        }
    )
);

passport.serializeUser((user, done) => {
    const googleUser = user as GoogleUser;
    done(null, googleUser.googleId);
});

passport.deserializeUser((id: string, done) => {
    // ต้อง query จาก database
    // ตอนนี้ส่งแค่ id กลับไป (แก้ทีหลัง)
    done(null, { googleId: id } as GoogleUser);
});

export default passport;