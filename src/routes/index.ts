import { type Application } from "express";
import fs from "fs";
import path from "path";
import type BaseRoutesConfig from "@/routes/baseRoutes";


export const loadRoutes = (app: Application): void => {
    const routesDir = __dirname;

    fs.readdirSync(routesDir)
        .filter(file => file !== "baseRoutes.ts" && file !== "index.ts")
        .forEach(file => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const routeModule = require(path.join(routesDir, file));

            const RouteClass = routeModule.default;

            // ✅ Type guard: ensure the default export is a constructor
            if (typeof RouteClass === "function") {
                const instance: BaseRoutesConfig = new RouteClass(app);
                console.log(`✔ Loaded routes: ${instance.getName()}`);
            } else {
                throw new Error(
                    `Route file ${file} does not export a valid BaseRoutesConfig class`
                );
            }
        });
};
