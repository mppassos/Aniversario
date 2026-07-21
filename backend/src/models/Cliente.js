const mongoose = require("mongoose");

const ClienteSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
    },
    dataNascimento: {
      type: Date,
      required: true,
    },
    telefone: {
      type: String,
      required: true,
      trim: true,
    },
    observacoes: {
      type: String,
      default: "",
    },
    parabenizadoHoje: {
      type: Boolean,
      default: false,
    },
    ultimaDataParabenizacao: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

ClienteSchema.index({ dataNascimento: 1 });
ClienteSchema.index({ parabenizadoHoje: 1, dataNascimento: 1 });
ClienteSchema.index({ nome: 1 });
ClienteSchema.index({ telefone: 1 }, { sparse: true });

module.exports = mongoose.model("Cliente", ClienteSchema);
