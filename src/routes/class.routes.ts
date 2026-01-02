import { Router } from "express";
import * as ctrl from "../controllers/class.controller";
import auth from "../middlewares/auth.middleware";
import validate from "../middlewares/validate.middleware";
import { createClassSchema, addStudentSchema } from "../schemas/class.schema";

const router = Router();

router.post("/", auth, validate(createClassSchema), ctrl.createClass);
router.post("/:id/add-student", auth, validate(addStudentSchema), ctrl.addStudent);
router.get("/:id", auth, ctrl.getClass);
router.get("/students", auth, ctrl.getStudents);

export default router;
