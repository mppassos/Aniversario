const Cliente = require("../models/Cliente");
const { invalidateBirthdayCache } = require("../services/agendamentoService");

function parseDateOnly(dateStr) {
  const [year, month, day] = String(dateStr).split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

function validarDataNascimento(dataStr) {
  const [year, month, day] = dataStr.split("-").map(Number);
  const data = new Date(year, month - 1, day);

  if (
    data.getDate() !== day ||
    data.getMonth() !== month - 1 ||
    data.getFullYear() !== year
  ) {
    return { valida: false, mensagem: "Data de nascimento invalida." };
  }

  const hoje = new Date();
  let idade = hoje.getFullYear() - year;
  if (
    hoje.getMonth() < month - 1 ||
    (hoje.getMonth() === month - 1 && hoje.getDate() < day)
  ) {
    idade--;
  }

  if (idade > 130) {
    return {
      valida: false,
      mensagem: "Data de nascimento invalida. Idade superior a 120 anos.",
    };
  }

  if (idade < 18) {
    return { valida: false, mensagem: "Idade inferior a 18 anos." };
  }

  return { valida: true, idade };
}

async function listarClientes(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    const filter = search ? { nome: { $regex: search, $options: "i" } } : {};

    const [clientes, total] = await Promise.all([
      Cliente.find(filter).sort({ nome: 1 }).skip(skip).limit(limit).lean(),
      Cliente.countDocuments(filter),
    ]);

    res.json({
      clientes,
      paginacao: {
        pagina: page,
        limite: limit,
        total,
        totalPaginas: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[clientesController] listarClientes:", error.message);
    res.status(500).json({ message: "Erro ao buscar clientes." });
  }
}

async function buscarClientePorId(req, res) {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findById(id);
    if (!cliente) {
      return res.status(404).json({ message: "Cliente nao encontrado." });
    }
    return res.json(cliente);
  } catch (error) {
    console.error("[clientesController] buscarClientePorId:", error.message);
    return res.status(500).json({ message: "Erro ao buscar cliente." });
  }
}

async function criarCliente(req, res) {
  try {
    const { nome, dataNascimento, telefone, observacoes } = req.body;

    if (!nome || typeof nome !== "string" || !nome.trim()) {
      return res.status(400).json({ message: "Nome e obrigatorio." });
    }

    if (!dataNascimento) {
      return res
        .status(400)
        .json({ message: "Data de nascimento e obrigatoria." });
    }

    const dataValida = parseDateOnly(dataNascimento);
    if (!dataValida || isNaN(dataValida.getTime())) {
      return res.status(400).json({ message: "Data de nascimento invalida." });
    }

    const validacao = validarDataNascimento(dataNascimento);
    if (!validacao.valida) {
      return res.status(400).json({ message: validacao.mensagem });
    }

    if (!telefone || !String(telefone).trim()) {
      return res.status(400).json({ message: "Telefone e obrigatorio." });
    }

    const cliente = await Cliente.create({
      nome: nome.trim(),
      dataNascimento: dataValida,
      telefone: String(telefone).trim(),
      observacoes: observacoes ? String(observacoes).trim() : "",
    });

    if (typeof invalidateBirthdayCache === "function") {
      await invalidateBirthdayCache();
    }

    return res.status(201).json(cliente);
  } catch (error) {
    console.error("[clientesController] criarCliente:", error.message);
    return res.status(500).json({ message: "Erro ao criar cliente." });
  }
}

async function atualizarCliente(req, res) {
  try {
    const { id } = req.params;
    const { nome, dataNascimento, telefone, observacoes } = req.body;

    if (nome !== undefined && (!nome || !String(nome).trim())) {
      return res
        .status(400)
        .json({ message: "O campo 'nome' nao pode ser vazio." });
    }

    const update = {};
    if (nome) update.nome = String(nome).trim();

    if (dataNascimento) {
      const dataValida = parseDateOnly(dataNascimento);
      if (!dataValida || isNaN(dataValida.getTime())) {
        return res
          .status(400)
          .json({ message: "Data de nascimento invalida." });
      }

      const validacao = validarDataNascimento(dataNascimento);
      if (!validacao.valida) {
        return res.status(400).json({ message: validacao.mensagem });
      }

      update.dataNascimento = dataValida;
    }

    if (telefone !== undefined) {
      if (!String(telefone).trim()) {
        return res.status(400).json({ message: "Telefone e obrigatorio." });
      }
      update.telefone = String(telefone).trim();
    }

    if (observacoes !== undefined) {
      update.observacoes = String(observacoes).trim();
    }

    const cliente = await Cliente.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!cliente) {
      return res.status(404).json({ message: "Cliente nao encontrado." });
    }

    if (typeof invalidateBirthdayCache === "function") {
      await invalidateBirthdayCache();
    }

    return res.json(cliente);
  } catch (error) {
    console.error("[clientesController] atualizarCliente:", error.message);
    return res.status(500).json({ message: "Erro ao atualizar cliente." });
  }
}

async function deletarCliente(req, res) {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findByIdAndDelete(id);

    if (!cliente) {
      return res.status(404).json({ message: "Cliente nao encontrado." });
    }

    if (typeof invalidateBirthdayCache === "function") {
      await invalidateBirthdayCache();
    }

    return res.status(204).send();
  } catch (error) {
    console.error("[clientesController] deletarCliente:", error.message);
    return res.status(500).json({ message: "Erro ao excluir cliente." });
  }
}

module.exports = {
  listarClientes,
  buscarClientePorId,
  criarCliente,
  atualizarCliente,
  deletarCliente,
};
