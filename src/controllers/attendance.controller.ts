import { Request, Response } from "express";
import { activeSession } from "../websocket/activeSession";
import Attendance from "../models/attendance.model";
import Class from "../models/class.model";
import { success, error } from "../utils/response";

type AuthReq = Request & { user?: any };

export const startAttendance = async (req: AuthReq, res: Response) => {
  if (req.user.role !== "teacher")
    return error(res, "Forbidden, teacher access required", 403);

  const cls = await Class.findById(req.body.classId);
  
  if (!cls) 
    return error(res, "Class not found", 404);

  if (!cls.teacherId.equals(req.user._id))
    return error(res, "Forbidden, not class teacher", 403);

  const startedAt = new Date().toISOString();

  (activeSession as any) = {
    classId: req.body.classId,
    startedAt,
    attendance: {}
  };

  success(res, { classId: req.body.classId, startedAt });
};

export const myAttendance = async (req: AuthReq, res: Response) => {
  const record = await Attendance.findOne({
    classId: req.params.id,
    studentId: req.user._id
  });

  success(res, {
    classId: req.params.id,
    status: record ? record.status : null
  });
};
