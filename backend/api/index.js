require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDatabase = require("../src/config/database");
const clientesRoutes = require("../src/routes/clientes");
const aniversarioRoutes = require("../src/routes/aniversario");
const iaRoutes = require("../src/routes/ia");
const { iniciarAgendamentos } = require("../src/services/agendamentoService");
const whatsappRoutes = require("../src/routes/whatsapp");
const mongoose = require("mongoose");

const app = express();

app.use(express.json({ limit: "10mb" }));

const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};
app.use(cors(corsOptions));

app.use("/api/clientes", clientesRoutes);
app.use("/api/aniversario", aniversarioRoutes);
app.use("/api/ia", iaRoutes);
app.use("/api/whatsapp", whatsappRoutes);

const DB_STATE = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

app.get("/health", (_req, res) => {
  const state = mongoose.connection.readyState;
  res.json({
    status: "ok",
    database: DB_STATE[state] || "unknown",
    timestamp: new Date().toISOString(),
  });
});

app.use((_req, res) => {
  res.status(404).json({ message: "Rota nao encontrada." });
});

app.use((err, _req, res, _next) => {
  console.error("[Erro global]", err);
  res.status(err.status || 500).json({
    message: "Erro interno do servidor. Tente novamente.",
  });
});

module.exports = app;
