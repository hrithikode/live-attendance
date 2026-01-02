import { Request, Response } from "express";
import User from "../models/user.model";
import * as passwordService from "../services/password.service";
import * as jwtService from "../services/jwt.services";
import { success, error } from "../utils/response";





export const signup = async (req: Request, res: Response) => {

  const exists = await User.findOne({ email: req.body.email });

  if (exists) 
    return error(res, "Email already exists", 400);

  const hashed = await passwordService.hash(req.body.password);

  const user = await User.create({ ...req.body, password: hashed });

  success(res, { _id: user._id, name: user.name, email: user.email, role: user.role }, 201);
};




export const login = async (req: Request, res: Response) => {

  const user = await User.findOne({ email: req.body.email });

  if (!user) 
    return error(res, "Invalid email or password");

  const ok = await passwordService.compare(req.body.password, user.password);

  if (!ok) 
    return error(res, "Invalid email or password");

  const token = jwtService.sign({ userId: user._id, role: user.role });
  success(res, { token });
};




export const me = async (req: Request & { user?: any }, res: Response) => {
  success(res, req.user);
};
