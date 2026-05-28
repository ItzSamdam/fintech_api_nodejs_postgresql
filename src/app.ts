import express, {
  type NextFunction,
  type Application,
  type Request,
  type Response,
} from "express";
import logger from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import { ErrorHandler, errorResponse, successResponse } from "@/shared/utils";
import { loadRoutes } from "@/routes";
import { config } from "@/shared/config";

dotenv.config();

export const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger('dev'));

// Load all routes
loadRoutes(app);

// Root welcome route
app.get('/', (_req: Request, res: Response) => {
  return successResponse(null, `Welcome to ${config.app.domain} Backend`, 200);
});

// block direct access to sensitive files
app.use((_req: Request, res: Response, next: NextFunction) => {
  if (_req.url.match(/^\/(\.env|\.git|config|src|server|app|laravel|public)/)) {
    return errorResponse("Access Forbidden", 403, null);
  }
  next();
});

// Error middleware
app.use(ErrorHandler);

// Catch-all route
app.use('*', (_req: Request, res: Response) => {
  res.status(404).send({ message: 'Page not found!', data: null });
});
