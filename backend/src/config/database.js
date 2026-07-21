const mongoose = require("mongoose");

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

async function connectDatabase(attempt = 1) {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI não configurado no .env");
  }

  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(MONGODB_URI);
  } catch (error) {
    console.error(
      `[MongoDB] Falha na tentativa ${attempt}/${MAX_RETRIES}: ${error.message}`,
    );

    if (attempt < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connectDatabase(attempt + 1);
    }

    throw new Error(
      `Não foi possível conectar ao MongoDB após ${MAX_RETRIES} tentativas. Último erro: ${error.message}`,
    );
  }
}

module.exports = connectDatabase;
