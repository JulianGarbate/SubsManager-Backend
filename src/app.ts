import express from "express";
import dotenv from "dotenv";
import subscripcionRouter from "./routes/subscripciones.router";
import healthRouter from "./routes/health";
import authRouter from "./routes/auth.router";

dotenv.config();

const app = express();

// CORS middleware
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://subscription-of-services.vercel.app",
    process.env.CORS_ORIGIN,
  ].filter(Boolean);

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin as string)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  
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
