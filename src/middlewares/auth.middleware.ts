import { Request, Response, NextFunction } from "express";
import * as jwtService from "../services/jwt.services";
import User from "../models/user.model";
import { error } from "../utils/response";

export default async function auth(req: Request & { user?: any }, res: Response, next: NextFunction) {

  const token = req.headers.authorization;

  if (!token) 
    return error(res, "Unauthorized, token missing or invalid", 401);

  try {
    const decoded = jwtService.verify(token);

    const user = await User.findById(decoded.userId).select("-password");
    
    if (!user) 
        return error(res, "User not found", 404);

    req.user = user;
    
    next();

  } catch {
    error(res, "Unauthorized, token missing or invalid", 401);
  }
}
