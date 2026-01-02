import "dotenv/config";
import http from "http";
import app from "./app";
import connectDB from "./config/db";
import initWebsocket from "./websocket/ws.server";
import "./models/attendance.model";

const server = http.createServer(app);

connectDB();
initWebsocket(server);

server.listen(3000, () => {
    console.log("server is running")
})