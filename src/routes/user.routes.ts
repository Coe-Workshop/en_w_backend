import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            success: false,
            authenticated: false,
            user: null,
        });
    }

    res.json({
        success: true,
        authenticated: true,
        user: req.user,
    });
});

export default router;