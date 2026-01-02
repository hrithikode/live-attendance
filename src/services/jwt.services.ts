import jwt from "jsonwebtoken";

export const sign = (payload: object) => 
    jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1d"});

export const verify = (token: string) =>
    jwt.verify(token, process.env.JWT_SECRET!) as any;