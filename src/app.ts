import express from "express";
import dotenv from "dotenv";
import subscripcionRouter from "./routes/subscripciones.router";
import healthRouter from "./routes/health";
import authRouter from "./routes/auth.router";

dotenv.config();

const app = express();

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  
  next();
});

app.use(express.json());

app.use("/auth", authRouter);
app.use("/subscripciones", subscripcionRouter);
app.use("/health", healthRouter);

export default app;
