import { Router } from "express";
import * as ctrl from "../controllers/attendance.controller";
import auth from "../middlewares/auth.middleware";
import validate from "../middlewares/validate.middleware";
import { startAttendanceSchema } from "../schemas/attendance.schema";

const router = Router();

router.post("/start", auth, validate(startAttendanceSchema), ctrl.startAttendance);
router.get("/class/:id/my-attendance", auth, ctrl.myAttendance);

export default router;
