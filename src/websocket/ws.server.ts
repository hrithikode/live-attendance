import { WebSocketServer,WebSocket } from "ws";
import http from "http";
import * as jwtService from "../services/jwt.services";
import { activeSession, ActiveSession } from "./activeSession";
import Attendance from "../models/attendance.model";
import Class from "../models/class.model";

interface WS extends WebSocket {
  user?: { userId: string; role: "teacher" | "student" };
}

export default function initWebSocket(server: http.Server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", async (ws: WS, req) => {
    try {
      const url = new URL(req.url!, "http://localhost");
      const token = url.searchParams.get("token");

      if (!token) throw new Error("Missing token");

      const decoded = jwtService.verify(token);
      ws.user = { userId: decoded.userId, role: decoded.role };
    } catch {
      ws.send(JSON.stringify({ event: "ERROR", data: { message: "Unauthorized or invalid token" } }));
      ws.close();
      return;
    }

    ws.on("message", async (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        const { event, data } = msg;

        if (event === "ATTENDANCE_MARKED") {
          if (ws.user!.role !== "teacher") throw "Forbidden, teacher event only";
          if (!activeSession) throw "No active attendance session";

          activeSession.attendance[data.studentId] = data.status;
          broadcast(wss, { event, data });
        }

        if (event === "TODAY_SUMMARY") {
          if (ws.user!.role !== "teacher") throw "Forbidden, teacher event only";
          if (!activeSession) throw "No active attendance session";

          const values = Object.values(activeSession.attendance);
          const present = values.filter(v => v === "present").length;
          const absent = values.filter(v => v === "absent").length;

          broadcast(wss, {
            event: "TODAY_SUMMARY",
            data: { present, absent, total: present + absent }
          });
        }

        if (event === "MY_ATTENDANCE") {
          if (ws.user!.role !== "student") throw "Forbidden, student event only";
          if (!activeSession) throw "No active attendance session";

          const status = activeSession.attendance[ws.user!.userId] || "not yet updated";
          ws.send(JSON.stringify({ event: "MY_ATTENDANCE", data: { status } }));
        }

        if (event === "DONE") {
          if (ws.user!.role !== "teacher") throw "Forbidden, teacher event only";
          if (!activeSession) throw "No active attendance session";

          const cls = await Class.findById(activeSession.classId);
          if (!cls) throw "Class not found";

          const allStudents = cls.studentIds.map(id => id.toString());

          for (const studentId of allStudents) {
            if (!activeSession.attendance[studentId]) {
              activeSession.attendance[studentId] = "absent";
            }
          }

          if (!activeSession) throw "No active attendance session";

            const session = activeSession;

            const records = Object.entries(session.attendance).map(
            ([studentId, status]) => ({
                classId: session.classId,
                studentId,
                status
            })
            );


          await Attendance.insertMany(records);

          const values = Object.values(activeSession.attendance);
          const present = values.filter(v => v === "present").length;
          const absent = values.filter(v => v === "absent").length;

          broadcast(wss, {
            event: "DONE",
            data: {
              message: "Attendance persisted",
              present,
              absent,
              total: present + absent
            }
          });

          (activeSession as any) = null;
        }
      } catch (err: any) {
        ws.send(JSON.stringify({ event: "ERROR", data: { message: err.toString() } }));
      }
    });
  });
}

function broadcast(wss: WebSocketServer, message: any) {
  const payload = JSON.stringify(message);
  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) client.send(payload);
  });
}
