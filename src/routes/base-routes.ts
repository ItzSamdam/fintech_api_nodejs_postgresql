import { type Application } from "express";

/**
 * This is the abstract class and must not be instantiated
 */
abstract class BaseRoutesConfig {
    protected app: Application;
    protected name: string;

    constructor(app: Application, name: string) {
        this.app = app;
        this.name = name;
        this.configureRoutes();
    }

    getName(): string {
        return this.name;
    }

    abstract configureRoutes(): Application;
}

export default BaseRoutesConfig;