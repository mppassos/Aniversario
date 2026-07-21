const express = require("express");
const router = express.Router();
const { gerarMensagensMistral } = require("../controllers/iaMistralController");

router.post("/gerar-mensagens", gerarMensagensMistral);

module.exports = router;
