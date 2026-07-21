const express = require("express");
const {
  listarClientes,
  buscarClientePorId,
  criarCliente,
  atualizarCliente,
  deletarCliente,
} = require("../controllers/clientesController");

const router = express.Router();

router.get("/", listarClientes);
router.get("/:id", buscarClientePorId);
router.post("/", criarCliente);
router.put("/:id", atualizarCliente);
router.delete("/:id", deletarCliente);

module.exports = router;
