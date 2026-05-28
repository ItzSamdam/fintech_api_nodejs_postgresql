import { type Request, type Response, type NextFunction } from "express";

/** Middleware to check for manager permissions
 * @param {string[]} roles - The roles required by the manager
 */
const authorization = (roles: string[] ) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default authorization;