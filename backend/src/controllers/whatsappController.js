const Cliente = require("../models/Cliente");

function gerarLinkWhatsApp(telefone, mensagem) {
  const numeroLimpo = String(telefone).replace(/\D/g, "");

  let numeroFormatado = numeroLimpo;

  if (numeroFormatado.startsWith("55")) {
    const sem55 = numeroFormatado.substring(2);
    if (sem55.length === 11) {
      numeroFormatado = `55${sem55}`;
    } else if (sem55.length === 10) {
      numeroFormatado = `55${sem55[0]}9${sem55.substring(1)}`;
    }
  }
  const mensagemCodificada = encodeURIComponent(mensagem);

  return `https://wa.me/${numeroFormatado}?text=${mensagemCodificada}`;
}

async function enviarWhatsApp(req, res) {
  const { clienteId, mensagem } = req.body;

  if (!clienteId) {
    return res.status(400).json({
      success: false,
      message: "clienteId e obrigatorio.",
    });
  }

  if (!mensagem) {
    return res.status(400).json({
      success: false,
      message: "mensagem e obrigatoria.",
    });
  }

  try {
    const cliente = await Cliente.findById(clienteId);

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: "Cliente nao encontrado.",
      });
    }

    if (!cliente.telefone) {
      return res.status(400).json({
        success: false,
        message: "Cliente nao possui numero de telefone cadastrado.",
      });
    }
    if (!cliente.telefone || cliente.telefone.replace(/\D/g, "").length < 10) {
      return res.status(400).json({
        success: false,
        message: "Telefone invalido ou nao cadastrado.",
      });
    }
    const linkWhatsApp = gerarLinkWhatsApp(cliente.telefone, mensagem);

    return res.json({
      success: true,
      link: linkWhatsApp,
      telefone: cliente.telefone,
      message: "Link do WhatsApp gerado com sucesso.",
    });
  } catch (error) {
    console.error("[whatsappController] enviarWhatsApp:", error.message);
    return res.status(500).json({
      success: false,
      message: "Erro ao gerar link do WhatsApp.",
    });
  }
}

module.exports = { enviarWhatsApp };
