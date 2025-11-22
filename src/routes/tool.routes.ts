import { Router } from "express";
import {
  createTool,
  updateTool,
  deleteTool,
} from "../controllers/toolController";

const router = Router();

router.post("/", createTool);
router.delete("/:id", deleteTool);
router.patch("/:id", updateTool);

export default router;
