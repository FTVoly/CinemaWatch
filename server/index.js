const express = require('express');
const app = express();
const http = require('http');
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // ETOILE = Tout le monde est accepté (plus simple pour commencer)
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`Connexion socket : ${socket.id}`);

  // Modifié : On reçoit maintenant roomId ET userId (l'ID vocal)
  socket.on("join_room", (roomId, userId) => {
    socket.join(roomId);
    console.log(`Utilisateur ${userId} a rejoint la salle ${roomId}`);
    
    // On prévient les autres qu'une nouvelle voix est là
    socket.to(roomId).emit("user-connected", userId);

    socket.on("disconnect", () => {
        console.log("Utilisateur parti :", userId);
        socket.to(roomId).emit("user-disconnected", userId);
    });
  });

  socket.on("video_action", (data) => {
    socket.to(data.roomId).emit("receive_action", data);
  });

  socket.on("send_message", (data) => {
    socket.to(data.roomId).emit("receive_message", data);
  });
});

// On utilise le port donné par l'hébergeur OU 3001 si on est en local
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✅ LE SERVEUR TOURNE SUR LE PORT ${PORT}`);
});