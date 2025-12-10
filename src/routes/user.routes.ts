import { Router, Request, Response } from "express";
import { createUser } from "../controllers/userController";

const router = Router();

// router.get('/', (req: Request, res: Response) => {
//     if (!req.isAuthenticated()) {
//         return res.json({
//             success: false,
//             authenticated: false,
//             user: null,
//         });
//     }
//
//     res.json({
//         success: true,
//         authenticated: true,
//         user: {
//             email: req.user!.email,
//             isRegistered: req.user!.isRegistered,
//         },
//     });
// });

router.post("/", createUser);

export default router;
