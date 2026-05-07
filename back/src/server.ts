import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import router from "./routes";
import morgan from "morgan";
import { AppDataSource } from "./config/dataSource";

const app = express();

app.set("trust proxy", 1);

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", async (_req: Request, res: Response) => {
  try {
    if (!AppDataSource.isInitialized) {
      res.status(503).json({
        ok: false,
        postgres: false,
        message: "Datasource aun no lista",
      });
      return;
    }
    await AppDataSource.query("SELECT 1");
    res.json({ ok: true, postgres: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(503).json({ ok: false, postgres: false, message });
  }
});

app.use(router);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.statusCode || 500).send({
    statusCode: err.statusCode || 500,
    message: err.message || "Internal Server Error",
  });
});

export default app;
