import express from "express";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import sql from "./configs/db.js";
const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.json("Hello from Server!");
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await sql`SELECT NOW()`;
    res.json({
      success: true,
      message: "Database connection successful!",
      server_time: result[0].now,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

app.use("/api", authRoutes);

app.listen(5000, () => {
  console.log("Server running on PORT: 5000");
});
