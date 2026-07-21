const mongoose = require("mongoose");

const HistoricoSchema = new mongoose.Schema(
  {
    clienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cliente",
      required: true,
    },
    tipo: {
      type: String,
      enum: ["IA_GERADA", "ENVIADA_WHATSAPP", "PARABENIZADO", "COPIADA"],
      required: true,
    },
    estilo: {
      type: String,
      enum: ["equilibrada", "formal", "proxima", "personalizado"],
      default: "personalizado",
    },
    mensagem: {
      type: String,
      default: "",
    },
    dataReferencia: {
      type: Date,
      required: true,
    },
    enviado: {
      type: Boolean,
      default: false,
    },
    payload: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true },
);

// Índices
HistoricoSchema.index({ clienteId: 1, tipo: 1, createdAt: -1 });
HistoricoSchema.index({ clienteId: 1, estilo: 1, tipo: 1 });
HistoricoSchema.index({ clienteId: 1, createdAt: -1 });
HistoricoSchema.index({ dataReferencia: 1, tipo: 1 });

module.exports = mongoose.model("Historico", HistoricoSchema);
