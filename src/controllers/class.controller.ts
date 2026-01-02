import { Request, Response } from "express";
import Class from "../models/class.model";
import User from "../models/user.model";
import { success, error } from "../utils/response";

type AuthReq = Request & { user?: any };



export const createClass = async (req: AuthReq, res: Response) => {

  if (req.user.role !== "teacher") 
    return error(res, "Forbidden, teacher access required", 403);

  const cls = await Class.create({
    className: req.body.className,
    teacherId: req.user._id,
    studentIds: []
  });

  success(res, cls, 201);
};



export const addStudent = async (req: AuthReq, res: Response) => {

  const cls = await Class.findById(req.params.id);

  if (!cls) 
    return error(res, "Class not found", 404);

  if (!cls.teacherId.equals(req.user._id))
    return error(res, "Forbidden, not class teacher", 403);

  const student = await User.findById(req.body.studentId);
  if (!student || student.role !== "student")
    return error(res, "Student not found", 404);

  if (cls.studentIds.includes(student._id))
    return success(res, cls); // idempotent

  cls.studentIds.push(student._id);
  await cls.save();

  success(res, cls);
};



export const getClass = async (req: AuthReq, res: Response) => {
  const cls = await Class.findById(req.params.id)
    .populate("studentIds", "_id name email");

  if (!cls) return error(res, "Class not found", 404);

  const isTeacher = cls.teacherId.equals(req.user._id);
    const isStudent = cls.studentIds.some((student: any) =>
    student._id.equals(req.user._id)
    );


  if (!isTeacher && !isStudent)
    return error(res, "Forbidden", 403);

  success(res, {
    _id: cls._id,
    className: cls.className,
    teacherId: cls.teacherId,
    students: cls.studentIds
  });
};



export const getStudents = async (_req: AuthReq, res: Response) => {
  const students = await User.find({ role: "student" }).select("_id name email");
  success(res, students);
};
