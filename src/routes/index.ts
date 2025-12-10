import { newItemsHandler } from "../item/handler";
import express from "express";

const router = express.Router();

newItemsHandler(router);

export default router;
