import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { enviarMensagemWhatsApp, gerarMensagensIA } from "../services/api";

const ESTILOS_POSSIVEIS = ["equilibrada", "formal", "proxima"];

export function useGeradorIA({ cliente, nomeCorretor }) {
  const [loading, setLoading] = useState(true);
  const [mensagens, setMensagens] = useState([]);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensagemEnviadaId, setMensagemEnviadaId] = useState(null);
  const [mensagemCopiadaId, setMensagemCopiadaId] = useState(null);

  const gerar = useCallback(async () => {
    setLoading(true);
    setMensagens([]);
    setErro("");
    setMensagemEnviadaId(null);
    setMensagemCopiadaId(null);
    try {
      const response = await gerarMensagensIA({
        nomeCliente: cliente.nome,
        nomeCorretor,
      });
      const comEstilo = (response.mensagens || []).map((msg, i) => ({
        ...msg,
        estilo:
          msg.estilo?.toLowerCase() || ESTILOS_POSSIVEIS[i] || "personalizado",
      }));
      setMensagens(comEstilo);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "IA indisponivel no momento. Tente novamente.";
      setErro(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [cliente.nome, nomeCorretor]);

  useEffect(() => {
    gerar();
  }, [gerar]);

  async function enviarWhatsApp(mensagem, index) {
    if (!cliente.telefone) {
      toast.error("Cliente sem telefone cadastrado.");
      return;
    }
    setEnviando(true);
    try {
      const response = await enviarMensagemWhatsApp({
        clienteId: cliente._id,
        mensagem,
      });
      if (response.success && response.link) {
        window.open(response.link, "_blank");
        setMensagemEnviadaId(index);
        toast.success("WhatsApp aberto!");
      } else {
        toast.error(response?.message || "Erro ao abrir WhatsApp.");
      }
    } catch {
      toast.error("Erro ao abrir WhatsApp.");
    } finally {
      setEnviando(false);
    }
  }

  async function copiar(mensagem, index) {
    try {
      await navigator.clipboard.writeText(mensagem);
      setMensagemCopiadaId(index);
      toast.success("Mensagem copiada!");
      setTimeout(() => setMensagemCopiadaId(null), 3000);
    } catch {
      toast.error("Erro ao copiar.");
    }
  }

  return {
    loading,
    mensagens,
    erro,
    enviando,
    mensagemEnviadaId,
    mensagemCopiadaId,
    gerar,
    enviarWhatsApp,
    copiar,
  };
}
