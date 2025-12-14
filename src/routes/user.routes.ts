import { Router, Request, Response } from "express";
import { createUser ,updateUser ,deleteUser} from "../controllers/userController";
import { de } from "zod/v4/locales";

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
router.patch("/", updateUser);
router.delete("/", deleteUser);
export default router;
