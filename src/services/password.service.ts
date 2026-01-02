import bcrypt from "bcrypt";

export const hash = (pw: string) => bcrypt.hash(pw,10);
export const compare = (pw: string, hash: string) => bcrypt.compare(pw, hash);