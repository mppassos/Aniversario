const cron = require("node-cron");
const Cliente = require("../models/Cliente");
const NodeCache = require("node-cache");

const TIMEZONE = process.env.APP_TIMEZONE || "America/Sao_Paulo";
const birthdayCache = new NodeCache({ stdTTL: 300 });

function getHojeNoFusoBrasil() {
  const agora = new Date();
  // Converte para o horário de Brasília
  const emBrasil = new Date(
    agora.toLocaleString("en-US", { timeZone: TIMEZONE }),
  );
  return emBrasil;
}

function startOfToday() {
  const hoje = getHojeNoFusoBrasil();
  hoje.setHours(0, 0, 0, 0);
  return hoje;
}

function sameDayMonthExpression(date) {
  const diaLocal = date.getDate();
  const mesLocal = date.getMonth() + 1;

  return {
    $and: [
      { $eq: [{ $dayOfMonth: "$dataNascimento" }, diaLocal] },
      { $eq: [{ $month: "$dataNascimento" }, mesLocal] },
    ],
  };
}

async function getBirthdayClients(forceRefresh = false) {
  const hoje = getHojeNoFusoBrasil();

  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  const cacheKey = `${ano}-${mes}-${dia}`;

  if (!forceRefresh) {
    const cached = birthdayCache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const clientes = await Cliente.find({
    parabenizadoHoje: false,
    $expr: sameDayMonthExpression(hoje),
  })
    .sort({ nome: 1 })
    .lean();

  birthdayCache.set(cacheKey, clientes);
  return clientes;
}

async function invalidateBirthdayCache() {
  birthdayCache.flushAll();
}

async function processDailyBirthdays() {
  const aniversariantes = await getBirthdayClients(true);
  return aniversariantes.length;
}

async function resetParabenizadoFlag() {
  await Cliente.updateMany(
    { parabenizadoHoje: true },
    { $set: { parabenizadoHoje: false } },
  );
  await invalidateBirthdayCache();
}

function iniciarAgendamentos() {
  cron.schedule(
    "0 0 * * *",
    async () => {
      try {
        await resetParabenizadoFlag();
        console.log("[CRON] Flag parabenizadoHoje resetada.");
      } catch (err) {
        console.error("[CRON] Erro ao resetar flag:", err.message);
      }
    },
    { timezone: TIMEZONE },
  );

  cron.schedule(
    "0 8 * * *",
    async () => {
      try {
        const total = await processDailyBirthdays();
        console.log(`[CRON] ${total} aniversariantes encontrados.`);
      } catch (err) {
        console.error("[CRON] Erro na verificacao:", err.message);
      }
    },
    { timezone: TIMEZONE },
  );
}

module.exports = {
  iniciarAgendamentos,
  processDailyBirthdays,
  resetParabenizadoFlag,
  sameDayMonthExpression,
  startOfToday,
  getBirthdayClients,
  invalidateBirthdayCache,
};
