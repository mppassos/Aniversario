import { eachDayOfInterval, endOfMonth, startOfMonth } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { notificarRecarregarAniversariantes } from "../hooks/useAniversariantes";
import { deletarCliente, listarClientes } from "../services/api";
import { getHojeLocal, ordenarPorParabenizado } from "../utils/dateUtils";

export function useCalendario({ onJaEnviei, onRecarregar }) {
  const navigate = useNavigate();
  const hoje = getHojeLocal();

  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [mesAtual, setMesAtual] = useState(
    new Date(hoje.getFullYear(), hoje.getMonth(), 1),
  );
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [clientesDoDia, setClientesDoDia] = useState([]);
  const [view, setView] = useState("lista");
  const [clienteGerador, setClienteGerador] = useState(null);

  const carregarClientes = useCallback(async () => {
    try {
      const data = await listarClientes(1, 999);
      setClientes(Array.isArray(data.clientes) ? data.clientes : []);
    } catch {
      setClientes([]);
    } finally {
      setLoadingClientes(false);
    }
  }, []);

  useEffect(() => {
    carregarClientes();

    const escutarRecarregar = () => {
      carregarClientes();
    };

    window.addEventListener("recarregar-aniversariantes", escutarRecarregar);

    return () => {
      window.removeEventListener(
        "recarregar-aniversariantes",
        escutarRecarregar,
      );
    };
  }, [carregarClientes]);

  function getAniversariantesDoDia(dia) {
    return clientes.filter((c) => {
      if (!c.dataNascimento) return false;
      const part = String(c.dataNascimento).split("T")[0];
      const [, m, d] = part.split("-").map(Number);
      return d === dia.getDate() && m === dia.getMonth() + 1;
    });
  }

  function irParaMesAnterior() {
    setMesAtual((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    fecharModal();
  }

  function irParaProximoMes() {
    setMesAtual((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    fecharModal();
  }

  function handleDiaClick(dia) {
    const aniversariantes = getAniversariantesDoDia(dia);
    if (!aniversariantes.length) return;
    setDiaSelecionado(dia);
    setClientesDoDia(ordenarPorParabenizado(aniversariantes));
    setView("lista");
    setClienteGerador(null);
  }

  function fecharModal() {
    setDiaSelecionado(null);
    setClientesDoDia([]);
    setView("lista");
    setClienteGerador(null);
  }

  function abrirGerador(cliente) {
    setClienteGerador(cliente);
    setView("gerador");
  }

  function voltarParaLista() {
    setView("lista");
    setClienteGerador(null);
  }

  function editarCliente(clienteId) {
    fecharModal();
    navigate(`/cliente/${clienteId}`);
  }

  async function excluirCliente(clienteId) {
    try {
      await deletarCliente(clienteId);
      toast.success("Cliente excluido.");

      setClientes((atual) => atual.filter((c) => c._id !== clienteId));

      const novos = clientesDoDia.filter((c) => c._id !== clienteId);
      if (novos.length === 0) {
        fecharModal();
      } else {
        setClientesDoDia(novos);
      }

      notificarRecarregarAniversariantes();
      onRecarregar?.();

      await carregarClientes();
    } catch {
      toast.error("Erro ao excluir. Tente novamente.");
    }
  }

  async function marcarEnviado(clienteId) {
    await onJaEnviei?.(clienteId);
    await carregarClientes();

    setClientes((atual) => {
      const aniversariantes = atual.filter((c) => {
        if (!c.dataNascimento || !diaSelecionado) return false;
        const part = String(c.dataNascimento).split("T")[0];
        const [, m, d] = part.split("-").map(Number);
        return (
          d === diaSelecionado.getDate() && m === diaSelecionado.getMonth() + 1
        );
      });

      const ordenados = ordenarPorParabenizado(aniversariantes);
      setClientesDoDia(ordenados);
      if (view === "gerador") voltarParaLista();
      return atual;
    });
  }

  const diasDoMes = eachDayOfInterval({
    start: startOfMonth(mesAtual),
    end: endOfMonth(mesAtual),
  });
  const primeiroDiaSemana = startOfMonth(mesAtual).getDay();
  const celulas = [...Array(primeiroDiaSemana).fill(null), ...diasDoMes];
  const semanas = [];
  for (let i = 0; i < celulas.length; i += 7) {
    semanas.push(celulas.slice(i, i + 7));
  }

  return {
    clientes,
    loadingClientes,
    mesAtual,
    diaSelecionado,
    clientesDoDia,
    view,
    clienteGerador,
    semanas,
    getAniversariantesDoDia,
    handleDiaClick,
    fecharModal,
    abrirGerador,
    voltarParaLista,
    editarCliente,
    excluirCliente,
    marcarEnviado,
    irParaMesAnterior,
    irParaProximoMes,
  };
}
