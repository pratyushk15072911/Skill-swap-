import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Socket.io for WebRTC signaling
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      const otherUsers = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
        .filter(id => id !== socket.id);
      
      socket.emit("all-users", otherUsers);
    });

    socket.on("sending-signal", (payload) => {
      io.to(payload.userToSignal).emit("user-joined", {
        signal: payload.signal,
        callerID: payload.callerID
      });
    });

    socket.on("returning-signal", (payload) => {
      io.to(payload.callerID).emit("receiving-returned-signal", {
        signal: payload.signal,
        id: socket.id
      });
    });

    socket.on("hand-raise", (roomId, isRaised) => {
      socket.to(roomId).emit("user-hand-raise", { userId: socket.id, isRaised });
    });

    socket.on("send-room-message", (roomId, message) => {
      io.to(roomId).emit("receive-room-message", { 
        id: message.id,
        userId: socket.id, 
        userName: message.userName,
        text: message.text,
        timestamp: new Date().toISOString()
      });
    });

    socket.on("mute-user", (roomId, userId) => {
      io.to(userId).emit("mute-remote");
    });

    socket.on("mute-all", (roomId) => {
      socket.to(roomId).emit("mute-remote");
    });

    socket.on("kick-user", (roomId, userId) => {
      io.to(userId).emit("kick-remote");
    });

    socket.on("highlight-message", (roomId, messageId) => {
      io.to(roomId).emit("message-highlighted", messageId);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
