import { type RequestHandler } from "express";
import cors, { type CorsOptions } from "cors";

/** Open CORS config for development */
export const corsConfig: RequestHandler = cors({
    origin: "*", // allow all origins in dev
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
        "Origin",
        "Content-Type",
        "Accept",
        "Authorization",
        "X-Request-ID",
    ],
    exposedHeaders: ["Content-Length", "X-Request-ID"],
    credentials: true,
    maxAge: 300, // 5 minutes
});

/** Strict CORS config for production */
export const strictCorsConfig = (allowedOrigins: string[]): RequestHandler => {
    const options: CorsOptions = {
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: [
            "Origin",
            "Content-Type",
            "Accept",
            "Authorization",
            "X-Request-ID",
        ],
        exposedHeaders: ["Content-Length", "X-Request-ID"],
        credentials: true,
        maxAge: 300,
    };

    return cors(options);
};
