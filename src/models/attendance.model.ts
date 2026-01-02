import mongoose, { Schema, Types } from "mongoose";

const attendanceSchema = new Schema({
  classId: { type: Types.ObjectId, ref: "Class", required: true },
  studentId: { type: Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["present", "absent"], required: true }
}, { timestamps: true });

export default mongoose.model("Attendance", attendanceSchema);
