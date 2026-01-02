import { Request, Response, NextFunction } from "express";
import { ZodTypeAny } from "zod";
import { error } from "../utils/response";

export default function validate(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return error(res, "Invalid request schema", 400);
    }
    req.body = result.data;
    next();
  };
}

