require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

let connectDatabase = null;
let clientesRoutes = null;
let aniversarioRoutes = null;
let iaRoutes = null;
let whatsappRoutes = null;
let iniciarAgendamentos = () => {};

try {
  connectDatabase = require("../src/config/database");
} catch (e) {
  console.error("[Import] database:", e.message);
}

try {
  clientesRoutes = require("../src/routes/clientes");
} catch (e) {
  console.error("[Import] clientes:", e.message);
  clientesRoutes = express.Router().get("/", (_req, res) => res.json([]));
}

try {
  aniversarioRoutes = require("../src/routes/aniversario");
} catch (e) {
  console.error("[Import] aniversario:", e.message);
  aniversarioRoutes = express.Router();
}

try {
  iaRoutes = require("../src/routes/ia");
} catch (e) {
  console.error("[Import] ia:", e.message);
  iaRoutes = express.Router();
}

try {
  whatsappRoutes = require("../src/routes/whatsapp");
} catch (e) {
  console.error("[Import] whatsapp:", e.message);
  whatsappRoutes = express.Router();
}

try {
  ({ iniciarAgendamentos } = require("../src/services/agendamentoService"));
} catch (e) {
  console.error("[Import] agendamentoService:", e.message);
}

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
  }),
);

app.options("*", cors());

const DB_STATE = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

function healthHandler(_req, res) {
  const state = mongoose.connection.readyState;
  res.json({
    status: "ok",
    database: DB_STATE[state] || "unknown",
    mongoUriSet: !!process.env.MONGODB_URI,
    timestamp: new Date().toISOString(),
  });
}

app.get("/", (_req, res) =>
  res.json({
    message: "API Aniversário rodando",
    endpoints: ["/health", "/api/health", "/api/clientes"],
  }),
);

app.get("/health", healthHandler);
app.get("/api/health", healthHandler);

app.get("/api", (_req, res) =>
  res.json({ message: "API online", health: "/api/health" }),
);

app.use("/api/clientes", clientesRoutes);
app.use("/api/aniversario", aniversarioRoutes);
app.use("/api/ia", iaRoutes);
app.use("/api/whatsapp", whatsappRoutes);

app.use("/clientes", clientesRoutes);
app.use("/aniversario", aniversarioRoutes);
app.use("/ia", iaRoutes);
app.use("/whatsapp", whatsappRoutes);

app.use((_req, res) => {
  res.status(404).json({
    message: "Rota nao encontrada.",
    path: _req.path,
    method: _req.method,
    available: [
      "/health",
      "/api/health",
      "/api/clientes",
      "/api/aniversario",
      "/api/ia",
      "/api/whatsapp",
    ],
  });
});

app.use((err, _req, res, _next) => {
  console.error("[Erro global]", err);
  res.status(err.status || 500).json({
    message: "Erro interno do servidor.",
    error: process.env.NODE_ENV !== "production" ? err.message : undefined,
  });
});

let startupPromise = null;

async function initializeApp() {
  if (startupPromise) return startupPromise;

  startupPromise = (async () => {
    if (!process.env.MONGODB_URI) {
      console.error("[MongoDB] MONGODB_URI não definida!");
      return;
    }
    if (!connectDatabase) {
      console.error("[MongoDB] Módulo database não carregado!");
      return;
    }
    try {
      await connectDatabase();
      console.log("[MongoDB] Conectado com sucesso");
      try {
        iniciarAgendamentos();
      } catch (e) {
        console.error("[Agendamento]", e.message);
      }
    } catch (err) {
      console.error("[MongoDB] Falha ao conectar:", err.message);
    }
  })();

  return startupPromise;
}

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  initializeApp().then(() => {
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  });
}

module.exports = async function handler(req, res) {
  await initializeApp();
  return app(req, res);
};

module.exports.default = module.exports;
