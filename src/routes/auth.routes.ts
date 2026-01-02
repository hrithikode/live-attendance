import { Router } from "express";
import * as ctrl from "../controllers/auth.controller";
import auth from "../middlewares/auth.middleware";
import { loginSchema, signupSchema } from "../schemas/auth.schema";
import validate from "../middlewares/validate.middleware";

const router = Router();

router.post("/signup", validate(signupSchema), ctrl.signup);
router.post("/login", validate(loginSchema), ctrl.login);
router.get("/me", auth, ctrl.me);

export default router;
