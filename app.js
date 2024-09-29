const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");

const app = express();
const PORT = 3001; // Safe port

app.use(cors()); // Enable CORS

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (change in production)
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("sender-join", (data) => {
    socket.join(data.uid);
  });

  socket.on("receiver-join", (data) => {
    socket.join(data.uid);
    socket.in(data.sender_uid).emit("init", data.uid);
  });

  socket.on("file-meta", (data) => {
    socket.in(data.uid).emit("fs-meta", data.metadata);
  });

  socket.on("fs-start", (data) => {
    socket.in(data.uid).emit("fs-share", {});
  });

  socket.on("file-raw", (data) => {
    socket.in(data.uid).emit("fs-share", data.buffer);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
