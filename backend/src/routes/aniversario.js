const express = require("express");
const {
  listarAniversariantesHoje,
  marcarJaEnviou,
  executarVerificacaoManual,
} = require("../controllers/aniversarioController");

const router = express.Router();

router.get("/hoje", listarAniversariantesHoje);
router.post("/marcar-enviado/:clienteId", marcarJaEnviou);
router.post("/executar-agora", executarVerificacaoManual);

module.exports = router;
