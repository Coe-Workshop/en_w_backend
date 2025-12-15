import { Router, Request, Response } from 'express';
import passport from '../config/passport';
import { userDB } from '../db/users';
import { GoogleUser } from '../types/user';

const router = Router();

router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
    })
);

router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: process.env.FRONTEND_URL || 'http://localhost:3000',
    }),
    (req: Request, res: Response) => {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const user = req.user as GoogleUser;
        if (user && !user.isRegistered) {
            return res.redirect(`${frontendUrl}/register`);
        }

        res.redirect(frontendUrl);
    }
);

router.post('/logout', (req: Request, res: Response) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                error: 'Logout failed'
            });
        }

        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    error: 'Session destroy failed'
                });
            }

            res.json({
                success: true,
                message: 'Logged out successfully'
            });
        });
    });
});

router.post('/register', (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            success: false,
            error: 'Not authenticated',
        });
    }

    const { firstName, lastName } = req.body;

    if (!firstName || !lastName) {
        return res.status(400).json({
            success: false,
            error: 'First name and last name are required',
        });
    }

    const user = req.user as GoogleUser;
    const email = user.email;

    if (userDB.exists(email)) {
        return res.status(400).json({
            success: false,
            error: 'User already registered',
        });
    }

    try {
        const userProfile = userDB.create(email, firstName, lastName);
        user.isRegistered = true;

        res.json({
            success: true,
            message: 'Registration successful',
            user: userProfile,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

export default router;