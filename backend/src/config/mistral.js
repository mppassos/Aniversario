const { Mistral } = require("@mistralai/mistralai");

let mistralClient;

function getMistralClient() {
  if (mistralClient) {
    return mistralClient;
  }

  if (!process.env.MISTRAL_API_KEY) {
    throw new Error("MISTRAL_API_KEY não configurada");
  }

  mistralClient = new Mistral({
    apiKey: process.env.MISTRAL_API_KEY,
  });

  return mistralClient;
}

module.exports = { getMistralClient };
