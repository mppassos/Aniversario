const cron = require("node-cron");
const NodeCache = require("node-cache");
const Cliente = require("../models/Cliente");

const TIMEZONE = process.env.APP_TIMEZONE || "America/Sao_Paulo";

const CRON_EXPRESSIONS = {
  DAILY_MIDNIGHT: "0 0 * * *",
  ANNUAL_RESET: "0 0 1 1 *",
};

const cacheInstance = new NodeCache({ stdTTL: 300 });

const CacheManager = {
  get(key) {
    return cacheInstance.get(key);
  },
  set(key, value) {
    return cacheInstance.set(key, value);
  },
  flush() {
    return cacheInstance.flushAll();
  },
};

const DateHelper = {
  getHojeNoFusoBrasil() {
    const agora = new Date();
    return new Date(agora.toLocaleString("en-US", { timeZone: TIMEZONE }));
  },

  startOfToday() {
    const hoje = this.getHojeNoFusoBrasil();
    hoje.setHours(0, 0, 0, 0);
    return hoje;
  },

  getCacheKey(date) {
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const dia = String(date.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  },

  getMongoDBBirthdayExpression(date) {
    return {
      $and: [
        { $eq: [{ $dayOfMonth: "$dataNascimento" }, date.getDate()] },
        { $eq: [{ $month: "$dataNascimento" }, date.getMonth() + 1] },
      ],
    };
  },
};

const BirthdayService = {
  async getBirthdayClients(forceRefresh = false) {
    const hoje = DateHelper.getHojeNoFusoBrasil();
    const cacheKey = DateHelper.getCacheKey(hoje);

    if (!forceRefresh) {
      const cached = CacheManager.get(cacheKey);
      if (cached) return cached;
    }

    const clientes = await Cliente.find({
      $expr: DateHelper.getMongoDBBirthdayExpression(hoje),
    })
      .sort({ nome: 1 })
      .lean();

    CacheManager.set(cacheKey, clientes);
    return clientes;
  },

  async invalidateCache() {
    CacheManager.flush();
  },

  async processDailyBirthdays() {
    const aniversariantes = await this.getBirthdayClients(true);
    return aniversariantes.length;
  },

  async resetAnual() {
    await Cliente.updateMany(
      {
        $or: [
          { parabenizadoHoje: true },
          { anoParabenizado: { $ne: null } },
          { ultimaDataParabenizacao: { $ne: null } },
        ],
      },
      {
        $set: {
          parabenizadoHoje: false,
          anoParabenizado: null,
          ultimaDataParabenizacao: null,
        },
      },
    );
    await this.invalidateCache();
    console.log("[CRON] Reset anual executado com sucesso - Ciclo reiniciado.");
  },
};

const Jobs = [
  {
    name: "Verificação Diária (Meia-noite)",
    cronExpression: CRON_EXPRESSIONS.DAILY_MIDNIGHT,
    async execute() {
      const total = await BirthdayService.processDailyBirthdays();
      console.log(
        `[CRON] Verificação diária das 00:00 concluída: ${total} aniversariantes identificados e cache preparado.`,
      );
    },
  },
  {
    name: "Reset Anual de Ciclo (1º Jan)",
    cronExpression: CRON_EXPRESSIONS.ANNUAL_RESET,
    async execute() {
      await BirthdayService.resetAnual();
    },
  },
];

function iniciarAgendamentos() {
  console.log("[CRON] Inicializando agendamentos do sistema...");

  Jobs.forEach((job) => {
    cron.schedule(
      job.cronExpression,
      async () => {
        try {
          console.log(`[CRON] Executando tarefa: ${job.name}...`);
          await job.execute();
        } catch (err) {
          console.error(
            `[CRON] Erro crítico na tarefa [${job.name}]:`,
            err.message,
          );
        }
      },
      { timezone: TIMEZONE },
    );
  });

  console.log(
    `[CRON] Todos os agendamentos carregados com sucesso no fuso ${TIMEZONE}.`,
  );
}

module.exports = {
  iniciarAgendamentos,
  processDailyBirthdays: () => BirthdayService.processDailyBirthdays(),
  resetAnual: () => BirthdayService.resetAnual(),
  sameDayMonthExpression: DateHelper.getMongoDBBirthdayExpression,
  startOfToday: () => DateHelper.startOfToday(),
  getBirthdayClients: (force) => BirthdayService.getBirthdayClients(force),
  invalidateBirthdayCache: () => BirthdayService.invalidateCache(),
  getHojeNoFusoBrasil: () => DateHelper.getHojeNoFusoBrasil(),
};
