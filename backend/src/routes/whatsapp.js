const express = require("express");
const router = express.Router();
const { enviarWhatsApp } = require("../controllers/whatsappController");

router.post("/enviar", enviarWhatsApp);

module.exports = router;
