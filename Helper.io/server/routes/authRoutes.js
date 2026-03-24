import express from "express";
import { userAdd, userVerify, getDoc } from "../controller/authController.js";
import { limiter } from "../middleware/rateLimiters.js";

const authRouter = express.Router();

authRouter.post("/sign-up",limiter, userAdd);
authRouter.get("/sign-in",limiter,userVerify);
authRouter.get("/notes-docs/:topic/:file", async (req, res) => {
  try {
    const { topic, file } = req.params;

    const markdown = await getDoc(topic, file);

    res.send(markdown);

  } catch (err) {
    res.status(404).json({ error: "Document not found" });
  }
});




export default authRouter;
