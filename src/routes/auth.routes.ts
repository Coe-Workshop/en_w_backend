import { Router, Request, Response } from 'express';
import passport from '../config/passport';

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

export default router;