const { getMistralClient } = require("../config/mistral");

function tryParseMistralResponse(rawText) {
  if (!rawText) return null;

  let cleaned = rawText
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) cleaned = jsonMatch[0];

  try {
    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed) && parsed.length >= 3) {
      const validos = parsed.filter((item) => item.estilo && item.mensagem);
      return validos.length >= 3 ? validos.slice(0, 3) : parsed.slice(0, 3);
    }

    if (parsed.mensagens && Array.isArray(parsed.mensagens)) {
      return parsed.mensagens.slice(0, 3);
    }

    return null;
  } catch {
    const regex = /"estilo"\s*:\s*"([^"]+)"\s*,\s*"mensagem"\s*:\s*"([^"]*)"/g;
    const matches = [];
    let match;
    while ((match = regex.exec(cleaned)) !== null) {
      matches.push({ estilo: match[1], mensagem: match[2] });
    }
    return matches.length >= 3 ? matches.slice(0, 3) : null;
  }
}

function formatarAssinatura(nomeCorretor) {
  const nome = nomeCorretor || process.env.NOME_CORRETOR;

  if (!nome) {
    return "Seu Corretor de Seguros";
  }

  return `*${nome}*\nSeu Corretor de Seguros`;
}

async function gerarMensagensMistral(req, res) {
  const { nomeCliente, nomeCorretor } = req.body;

  if (!nomeCliente) {
    return res.status(400).json({ message: "nomeCliente é obrigatório." });
  }

  // ✅ Prioriza o nome enviado pelo frontend, senão usa a variável de ambiente
  const nomeCorretorDisplay = nomeCorretor || process.env.NOME_CORRETOR;

  // ✅ Se não tiver nome, retorna erro claro
  if (!nomeCorretorDisplay) {
    return res.status(400).json({
      message:
        "Nome do corretor não configurado. Configure a variável NOME_CORRETOR no backend.",
    });
  }

  const assinatura = formatarAssinatura(nomeCorretorDisplay);

  try {
    const client = getMistralClient();

    const response = await client.chat.complete({
      model: "mistral-small-latest",
      messages: [
        {
          role: "system",
          content: `Voce e um assistente especializado em mensagens de aniversario para corretor de seguros.

REGRAS OBRIGATORIAS:
1. Use SEMPRE acentuacao correta (saude, atencao, voce, satisfacao, etc)
2. Responda APENAS com JSON
3. Use \\n para quebras de linha
4. A assinatura FINAL deve ser EXATAMENTE:
   *${nomeCorretorDisplay}*
   Seu Corretor de Seguros

   ATENCAO: A assinatura deve vir SEMPRE no final, com um espaco em branco antes, o nome entre asteriscos, pular uma linha, e "Seu Corretor de Seguros".`,
        },
        {
          role: "user",
          content: `Gere 3 mensagens de aniversario para "${nomeCliente}" do corretor ${nomeCorretorDisplay}:

1. EQUILIBRADA: Profissional e acolhedor
2. FORMAL: Respeitoso e tradicional  
3. PROXIMA: Leve e pessoal

REGRAS:
- Use acentuacao correta
- Cada mensagem: 4-6 paragrafos
- A assinatura final deve ser:
  *${nomeCorretorDisplay}*
  Seu Corretor de Seguros

JSON:
[
  {"estilo":"equilibrada","mensagem":"..."},
  {"estilo":"formal","mensagem":"..."},
  {"estilo":"proxima","mensagem":"..."}
]`,
        },
      ],
      temperature: 0.8,
      max_tokens: 800,
    });

    const responseText = response.choices[0]?.message?.content || "";

    let parsed = tryParseMistralResponse(responseText);

    if (!parsed || parsed.length < 3) {
      console.warn("[Mistral] Parse falhou, usando fallback");
      return gerarFallback(req, res);
    }

    const mensagens = parsed.map((item) => {
      let mensagem = item.mensagem || "";

      const assinaturaPattern = /\*[^*]+\*\s*Seu Corretor de Seguros/g;
      mensagem = mensagem.replace(assinaturaPattern, "").trim();

      mensagem = `${mensagem}\n\n${assinatura}`;

      return {
        estilo: item.estilo || "personalizado",
        mensagem: mensagem,
      };
    });

    const temAcentos = mensagens.some((m) => /[áéíóúãõâêîôû]/.test(m.mensagem));

    if (!temAcentos) {
      console.warn(
        "[Mistral] Mensagens sem acentos - usando fallback acentuado",
      );
      return gerarFallback(req, res);
    }

    return res.json({
      mensagens,
      provider: "mistral",
      model: "mistral-small-latest",
    });
  } catch (error) {
    console.error("[Mistral] Erro:", error.message);
    return gerarFallback(req, res);
  }
}

function gerarFallback(req, res) {
  const { nomeCliente, nomeCorretor } = req.body;

  const nome = nomeCorretor || process.env.NOME_CORRETOR;

  const assinatura = nome
    ? `*${nome}*\nSeu Corretor de Seguros`
    : "Seu Corretor de Seguros";

  return res.json({
    mensagens: [
      {
        estilo: "equilibrada",
        mensagem: `Olá, ${nomeCliente}!

Hoje é um dia especial, e não poderia deixar de registrar por aqui.

Desejo a você um feliz aniversário repleto de saúde, realizações e bons momentos ao lado de quem você ama. É uma satisfação poder fazer parte da sua jornada de proteção e tranquilidade.

Que este novo ciclo traga ainda mais conquistas!

Um forte abraço,

${assinatura}`,
      },
      {
        estilo: "formal",
        mensagem: `Prezado(a) ${nomeCliente},

Em nome da nossa corretora, venho lhe desejar um feliz aniversário. Que esta data seja celebrada com muita saúde, paz e prosperidade.

Agradeço a confiança depositada em nosso trabalho e reafirmo meu compromisso em continuar oferecendo a você o melhor em proteção e segurança.

Atenciosamente,

${assinatura}`,
      },
      {
        estilo: "proxima",
        mensagem: `${nomeCliente}, feliz aniversário!

Desejo que o seu novo ano de vida seja cheio de momentos incríveis, muita saúde e tranquilidade. Fico feliz em fazer parte do seu time e em poder cuidar do que é importante para você.

Aproveite o seu dia!

Grande abraço,

${assinatura}`,
      },
    ],
    provider: "fallback",
    message: "Usando mensagens pré-definidas com acentuação",
  });
}

module.exports = { gerarMensagensMistral };
