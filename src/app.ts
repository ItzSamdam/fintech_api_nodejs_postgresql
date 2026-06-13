import express, {
  type NextFunction,
  type Application,
  type Request,
  type Response,
} from "express";
import logger from "morgan";
import dotenv from "dotenv";
import { corsConfig, strictCorsConfig } from "@/shared/middlewares";
import { ErrorHandler, errorResponse, successResponse } from "@/shared/utils";
import routesConfigs from '@/routes';
import endpoints from 'express-list-endpoints';
import { config } from "@/shared/config";

dotenv.config();

export const app: Application = express();

if (config.serverEnv === 'production') {
  const allowedOrigins = [
    'https://dashboard-v1-one.vercel.app',
    'https://test-dashboard-v1-one.vercel.app'
  ];
  app.use(strictCorsConfig(allowedOrigins));
} else {
  app.use(corsConfig);
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger('dev'));

// Load all routes
app.get('/health', (_req: Request, res: Response) => {
  const allEndpoints = endpoints(app);

  return res.json({
    status: true,
    message: 'Fintech Demo API is up and running',
    data: allEndpoints
  });
});

// eslint-disable-next-line new-cap
routesConfigs.forEach((routeConfig) => new routeConfig(app));

// Root welcome route
app.get('/', (_req: Request, res: Response) => {
  return res.status(200).json(
    successResponse(null, `Welcome to Fintech API`, 200)
  );
});

// block direct access to sensitive files
app.use((_req: Request, res: Response, next: NextFunction) => {
  if (_req.url.match(/^\/(\.env|\.git|config|src|server|app|laravel|public)/)) {
    return res.status(403).json(errorResponse('Access Forbidden!', 403, null));
  }
  next();
});

// Error middleware
app.use(ErrorHandler);

// Catch-all route
app.use('*', (_req: Request, res: Response) => {
  return res.status(404).json(errorResponse('api route not found!', 404, null));
});