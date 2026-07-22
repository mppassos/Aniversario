const Cliente = require("../models/Cliente");
const Historico = require("../models/Historico");
const {
  getBirthdayClients,
  invalidateBirthdayCache,
  startOfToday,
  getHojeNoFusoBrasil,
} = require("../services/agendamentoService");

async function listarAniversariantesHoje(_req, res) {
  try {
    const aniversariantes = await getBirthdayClients();
    res.json(aniversariantes);
  } catch (error) {
    console.error(
      "[aniversarioController] listarAniversariantesHoje:",
      error.message,
    );
    res.status(500).json({ message: "Erro ao buscar aniversariantes." });
  }
}

async function marcarJaEnviou(req, res) {
  try {
    const { clienteId } = req.params;

    const cliente = await Cliente.findById(clienteId);
    if (!cliente) {
      return res.status(404).json({ message: "Cliente nao encontrado." });
    }

    const anoAtual = getHojeNoFusoBrasil().getFullYear();

    if (cliente.anoParabenizado === anoAtual) {
      return res.json({
        message: "Cliente ja foi parabenizado este ano.",
        anoParabenizado: anoAtual,
      });
    }

    cliente.parabenizadoHoje = true;
    cliente.ultimaDataParabenizacao = new Date();
    cliente.anoParabenizado = anoAtual;

    await cliente.save();
    await invalidateBirthdayCache();

    await Historico.create({
      clienteId: cliente._id,
      tipo: "PARABENIZADO",
      dataReferencia: startOfToday(),
      enviado: true,
    });

    return res.json({
      message: "Cliente marcado como parabenizado.",
      anoParabenizado: anoAtual,
    });
  } catch (error) {
    console.error("[aniversarioController] marcarJaEnviou:", error.message);
    return res
      .status(500)
      .json({ message: "Erro ao marcar cliente como parabenizado." });
  }
}

async function executarVerificacaoManual(_req, res) {
  try {
    await invalidateBirthdayCache();
    const aniversariantes = await getBirthdayClients(true);
    return res.json({
      message: "Verificacao executada.",
      total: aniversariantes.length,
    });
  } catch (error) {
    console.error(
      "[aniversarioController] executarVerificacaoManual:",
      error.message,
    );
    return res
      .status(500)
      .json({ message: "Erro ao executar verificacao manual." });
  }
}

module.exports = {
  listarAniversariantesHoje,
  marcarJaEnviou,
  executarVerificacaoManual,
};
