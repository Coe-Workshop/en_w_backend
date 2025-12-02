import { Router } from "express";
import {
  getYOURcomment,
  getTHIScategories,
  updateUser,
  deleteUser,
  createUser,
} from "../controllers/sampleController";
const router = Router();

router.get("/:id/messages", getYOURcomment);
router.get("/:id/categories", getTHIScategories);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);
router.post("/", createUser);

export default router;
