import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";

import authRouter from "./routes/auth";
import logbookRouter from "./routes/logbook";
import reviewsRouter from "./routes/reviews";
import studentsRouter from "./routes/students";
import usersRouter from "./routes/users";
import dashboardRouter from "./routes/dashboard";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

// Ensure uploads directory exists
const uploadDir = path.resolve(process.env.UPLOAD_DIR ?? "./uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use("/uploads", express.static(uploadDir));

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/logbook", logbookRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/students", studentsRouter);
app.use("/api/users", usersRouter);
app.use("/api/dashboard", dashboardRouter);

// 404
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => console.log(`Logbook API running on http://localhost:${PORT}`));
