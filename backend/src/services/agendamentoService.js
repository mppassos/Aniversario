const cron = require("node-cron");
const Cliente = require("../models/Cliente");
const NodeCache = require("node-cache");

const TIMEZONE = process.env.APP_TIMEZONE || "America/Sao_Paulo";
const birthdayCache = new NodeCache({ stdTTL: 300 });

function getHojeNoFusoBrasil() {
  const agora = new Date();
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
  return {
    $and: [
      { $eq: [{ $dayOfMonth: "$dataNascimento" }, date.getDate()] },
      { $eq: [{ $month: "$dataNascimento" }, date.getMonth() + 1] },
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
    if (cached) return cached;
  }

  const clientes = await Cliente.find({
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

async function resetParabenizadoHoje() {
  await Cliente.updateMany(
    { parabenizadoHoje: true },
    { $set: { parabenizadoHoje: false } },
  );
  await invalidateBirthdayCache();
  console.log("[CRON] Flag parabenizadoHoje resetada.");
}

async function resetAnual() {
  await Cliente.updateMany(
    { anoParabenizado: { $ne: null } },
    {
      $set: {
        anoParabenizado: null,
        parabenizadoHoje: false,
        ultimaDataParabenizacao: null,
      },
    },
  );
  await invalidateBirthdayCache();
  console.log("[CRON] Reset anual executado — todos os clientes resetados.");
}

function iniciarAgendamentos() {
  cron.schedule(
    "0 0 * * *",
    async () => {
      try {
        await resetParabenizadoHoje();
      } catch (err) {
        console.error("[CRON] Erro no reset diario:", err.message);
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

  cron.schedule(
    "0 0 31 12 *",
    async () => {
      try {
        await resetAnual();
      } catch (err) {
        console.error("[CRON] Erro no reset anual:", err.message);
      }
    },
    { timezone: TIMEZONE },
  );

  console.log("[CRON] Agendamentos iniciados.");
}

module.exports = {
  iniciarAgendamentos,
  processDailyBirthdays,
  resetParabenizadoHoje,
  resetAnual,
  sameDayMonthExpression,
  startOfToday,
  getBirthdayClients,
  invalidateBirthdayCache,
  getHojeNoFusoBrasil,
};
