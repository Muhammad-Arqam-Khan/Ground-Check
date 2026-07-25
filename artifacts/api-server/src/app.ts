import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
// Lock CORS to the configured origin(s). CORS_ORIGIN accepts a comma-separated
// list of allowed origins. Unset in dev → allows all (Replit preview proxy).
const rawCorsOrigin = process.env.CORS_ORIGIN;
app.use(
  cors(
    rawCorsOrigin
      ? {
          origin: rawCorsOrigin.split(',').map(o => o.trim()),
          credentials: true,
        }
      : undefined, // undefined → cors() defaults to * (dev permissive)
  ),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
