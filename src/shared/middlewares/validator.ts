import { type NextFunction, type Request, type Response } from 'express';
import { type ZodType } from 'zod';

export const validate =
    (schema: ZodType) =>
        async (req: Request, _res: Response, next: NextFunction) => {
            try {
                await schema.parseAsync({
                    body: req.body,
                    query: req.query,
                    params: req.params,
                });

                next();
            } catch (error) {
                next(error);
            }
        };