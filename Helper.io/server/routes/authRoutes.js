import express from "express";
import { userAdd, userVerify, getDoc } from "../controller/authController.js";
import { limiter } from "../middleware/rateLimiters.js";

const authRouter = express.Router();

authRouter.post("/sign-up", limiter, userAdd);
authRouter.get("/sign-in", limiter, userVerify);
authRouter.get("/notes-docs/:topic/:file", getDoc);

export default authRouter;
