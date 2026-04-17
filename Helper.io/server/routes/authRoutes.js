import express from "express";
import { userAdd, userVerify, getDoc, getSummarize, getQuiz, getDoubt } from "../controller/authController.js";
import { uploadNote, getNotes, getNoteContent, deleteNote, getUserSummarize, getUserQuiz, getUserDoubt } from "../controller/notesController.js";
import { limiter } from "../middleware/rateLimiters.js";

const authRouter = express.Router();

authRouter.post("/sign-up", limiter, userAdd);
authRouter.get("/sign-in", limiter, userVerify);
authRouter.get("/notes-docs/:topic/:file", getDoc);
authRouter.post("/ai/summarize",getSummarize);
authRouter.post("/ai/quiz",getQuiz);
authRouter.post("/ai/doubt",getDoubt);

// Personal Notes routes
authRouter.post("/notes/upload", uploadNote);
authRouter.get("/notes/list", getNotes);
authRouter.get("/notes/content", getNoteContent);
authRouter.delete("/notes/delete", deleteNote);
authRouter.post("/notes/ai/summarize", getUserSummarize);
authRouter.post("/notes/ai/quiz", getUserQuiz);
authRouter.post("/notes/ai/doubt", getUserDoubt);

export default authRouter;
