import express from "express";
import { userAdd, userVerify, getDoc, getSummarize, getQuiz, getDoubt } from "../controller/authController.js";
import { limiter } from "../middleware/rateLimiters.js";

const authRouter = express.Router();

authRouter.post("/sign-up", limiter, userAdd);
authRouter.get("/sign-in", limiter, userVerify);
authRouter.get("/notes-docs/:topic/:file", getDoc);
authRouter.post("/ai/summarize",getSummarize);
authRouter.post("/ai/quiz",getQuiz);
authRouter.post("/ai/doubt",getDoubt);

export default authRouter;
