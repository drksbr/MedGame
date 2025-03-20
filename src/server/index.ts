// src/server/index.ts
import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import fs from "fs";
import mapRoutes from "./routes/mapRoutes";

// Inicialização do servidor
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware para JSON
app.use(express.json({ limit: "50mb" }));

// Criar diretórios necessários
const dataDir = path.join(__dirname, "../../data");
const mapsDir = path.join(dataDir, "maps");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(mapsDir)) {
  fs.mkdirSync(mapsDir, { recursive: true });
}

// Configuração de rotas
app.use("/api/maps", mapRoutes);

// Servir arquivos estáticos do cliente
app.use(express.static(path.join(__dirname, "../../dist/client")));

// Rota para servir o editor de mapa
app.get("/editor", (req, res) => {
  res.sendFile(path.join(__dirname, "../../dist/tools/index.html"));
});

// Configuração do Socket.io
io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  // Desconexão
  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });

  // Eventos específicos do jogo serão adicionados aqui
});

app.use("/editor", express.static(path.join(__dirname, "../../dist/tools")));

// Rota base para o editor (redirecionamento)
app.get("/editor", (req, res) => {
  res.sendFile(path.join(__dirname, "../../dist/tools/index.html"));
});

// Rota específica para arquivos estáticos do editor
app.get("/editor/*", (req, res) => {
  const filePath = req.path.replace("/editor/", "");
  res.sendFile(path.join(__dirname, "../../dist/tools", filePath));
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Editor de mapa disponível em: http://localhost:${PORT}/editor`);
});
