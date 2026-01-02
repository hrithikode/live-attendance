import mongoose, { Types } from "mongoose";

const classSchema = new mongoose.Schema({
  className: { type: String, required: true },
  teacherId: { type: Types.ObjectId, ref: "User", required: true },
  studentIds: [{ type: Types.ObjectId, ref: "User" }]
});

export default mongoose.model("Class", classSchema);
