import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  PORT: z.string().transform(Number).default(3001),
  NODE_ENV: z.enum(["development", "production", "combined"]),

  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API: z.string(),
  CLOUDINARY_SECRET: z.string(),

  NOTIFICATION_EMAIL: z.string(),

  DB_HOST: z.string(),
  DB_USER: z.string(),
  DB_PASS: z.string(),
  DB_DATABASE: z.string(),

  JWT_SECRET: z.string(),
  JWT_ADMIN_SECRET: z.string(),
  JWT_EXPIRES: z.string().default("30m"),
  JWT_REFRESH_TOKEN_KEY: z.string(),
  JWT_REFRESH_EXPIRES: z.string().default("120m"),

  LOG_FOLDER: z.string(),
  LOG_FILE: z.string(),
  LOG_LEVEL: z.string(),

  ENCRYPTION_KEY: z.string(),

  DOMAIN_NAME: z.string().default("MyBackend"),
});

type EnvVars = z.infer<typeof envSchema>;

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(
    `Cannot Start Server:- Config Validation Error: ${parsedEnv.error.message}`
  );
}

const envVar: EnvVars = parsedEnv.data;

export const config = {
  logConfig: {
    logFolder: envVar.LOG_FOLDER,
    logFile: envVar.LOG_FILE,
    logLevel: envVar.LOG_LEVEL,
  },
  jwt: {
    secret: envVar.JWT_SECRET,
    adminSecret: envVar.JWT_ADMIN_SECRET,
    expiresIn: envVar.JWT_EXPIRES,
    refreshTokenKey: envVar.JWT_REFRESH_TOKEN_KEY,
    refreshTokenExpiresIn: envVar.JWT_REFRESH_EXPIRES,
  },
  database: {
    host: envVar.DB_HOST,
    user: envVar.DB_USER,
    pass: envVar.DB_PASS,
    database: envVar.DB_DATABASE,
  },
  cloudinary: {
    cloud_name: envVar.CLOUDINARY_CLOUD_NAME,
    api_key: envVar.CLOUDINARY_API,
    api_secret: envVar.CLOUDINARY_SECRET,
  },
  app: {
    domain: envVar.DOMAIN_NAME,
    isDevelopment: envVar.NODE_ENV !== "production",
  },
  notifyEmail: envVar.NOTIFICATION_EMAIL,
  port: envVar.PORT,
  serverEnv: envVar.NODE_ENV,
  cipherKey: envVar.ENCRYPTION_KEY,
};

// 🔑 Generate a Config type directly from the object
export type Config = typeof config;
