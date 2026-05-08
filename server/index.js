require("dotenv").config();

const axios = require("axios");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// in-memory store
const rooms = {};
const winners = {};

io.on("connection", (socket) => {
  console.log("🟢 Connected:", socket.id);

  // JOIN ROOM
  socket.on("join_room", ({ roomId, username }) => {
    if (!roomId) return;

    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

    const exists = rooms[roomId].find((p) => p.id === socket.id);

    if (!exists) {
      rooms[roomId].push({
        id: socket.id,
        username: username || "User",
      });
    }

    io.to(roomId).emit("room_update", rooms[roomId]);
  });

  // START MATCH
  socket.on("start_match", (roomId) => {
    io.to(roomId).emit("match_start");
  });

  // SUBMIT CODE (WINNER LOGIC)
  socket.on("submit_code", ({ roomId, username }) => {
    if (!winners[roomId]) {
      winners[roomId] = username;

      io.to(roomId).emit("match_result", {
        winner: username,
      });
    }

    socket.to(roomId).emit("opponent_submitted", username);
  });

  // RUN CODE
  socket.on("run_code", async ({ code, roomId }) => {
    if (!code) {
      socket.emit("code_result", "No code provided");
      return;
    }

    try {
      const response = await axios.post(
        "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
        {
          source_code: code,
          language_id: 71,
          stdin: "2 3",
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-RapidAPI-Key": process.env.fabfd63359msh97ac0fdf9bb1dbbp1cf383jsnb25dcdbf49a,
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          },
        }
      );

      const output =
        response.data.stdout ||
        response.data.stderr ||
        "No output";

      io.to(roomId).emit("code_result", output);
    } catch (err) {
      console.error(err.message);
      socket.emit("code_result", "Execution failed");
    }
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    for (let roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter(
        (p) => p.id !== socket.id
      );

      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
        delete winners[roomId];
      } else {
        io.to(roomId).emit("room_update", rooms[roomId]);
      }
    }
  });
});

app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

server.listen(5000, () => {
  console.log("🔥 Server running on http://localhost:5000");
});