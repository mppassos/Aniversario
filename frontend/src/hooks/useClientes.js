import { useCallback, useEffect, useState } from "react";
import { listarClientes } from "../services/api";

export function useClientes() {
  const [clientes, setClientes] = useState([]);
  const [paginacao, setPaginacao] = useState({
    pagina: 1,
    limite: 50,
    total: 0,
    totalPaginas: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState("");

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listarClientes(pagina, 50, busca);
      setClientes(Array.isArray(data.clientes) ? data.clientes : []);
      setPaginacao(
        data.paginacao || {
          pagina: 1,
          limite: 50,
          total: 0,
          totalPaginas: 0,
        },
      );
    } catch (err) {
      console.error("[useClientes] Erro:", err);
      setError(err?.friendlyMessage || "Erro ao carregar clientes.");
      setClientes([]);
    } finally {
      setLoading(false);
    }
  }, [pagina, busca]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const proximaPagina = () => {
    if (paginacao.pagina < paginacao.totalPaginas) {
      setPagina((p) => p + 1);
    }
  };

  const paginaAnterior = () => {
    if (paginacao.pagina > 1) {
      setPagina((p) => p - 1);
    }
  };

  return {
    clientes,
    paginacao,
    loading,
    error,
    recarregar: carregar,
    pagina,
    setPagina,
    busca,
    setBusca,
    proximaPagina,
    paginaAnterior,
  };
}
