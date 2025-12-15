import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
        return res.json({
            success: false,
            authenticated: false,
            user: null,
        });
    }

    res.json({
        success: true,
        authenticated: true,
        user: {
            email: req.user!.email,
            isRegistered: req.user!.isRegistered,
        },
    });
});

export default router;