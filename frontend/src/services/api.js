import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:3001/api" : "/api");

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[API] Response error:", error);
    const friendlyMessage =
      error?.response?.data?.message ||
      (error.code === "ECONNABORTED"
        ? "Tempo esgotado. Verifique sua conexão."
        : "Erro de comunicação com o servidor.");
    return Promise.reject({ ...error, friendlyMessage });
  },
);

export async function listarClientes(page = 1, limit = 50, search = "") {
  const { data } = await api.get("/clientes", {
    params: {
      page,
      limit,
      search,
      _t: Date.now(),
    },
  });
  return data;
}

export async function buscarClientePorId(id) {
  const { data } = await api.get(`/clientes/${id}`, {
    params: { _t: Date.now() },
  });
  return data;
}

export async function criarCliente(payload) {
  const { data } = await api.post("/clientes", payload);
  return data;
}

export async function atualizarCliente(id, payload) {
  const { data } = await api.put(`/clientes/${id}`, payload);
  return data;
}

export async function deletarCliente(id) {
  await api.delete(`/clientes/${id}`);
}

export async function listarAniversariantesHoje() {
  const { data } = await api.get("/aniversario/hoje", {
    params: { _t: Date.now() },
  });
  return data;
}

export async function marcarComoEnviado(clienteId) {
  const { data } = await api.post(`/aniversario/marcar-enviado/${clienteId}`);
  return data;
}

export async function gerarMensagensIA(payload) {
  const { data } = await api.post("/ia/gerar-mensagens", payload);
  return data;
}

export async function enviarMensagemWhatsApp(payload) {
  const { data } = await api.post("/whatsapp/enviar", payload);
  return data;
}

export async function salvarMensagemHistorico(payload) {
  const { data } = await api.post("/historico/mensagem", payload);
  return data;
}

export async function buscarHistoricoCliente(clienteId) {
  const { data } = await api.get(`/historico/cliente/${clienteId}`, {
    params: { _t: Date.now() },
  });
  return data;
}

export default api;
