import { useCallback, useEffect, useState } from "react";
import { listarAniversariantesHoje } from "../services/api";

export function useAniversariantes() {
  const [aniversariantes, setAniversariantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listarAniversariantesHoje();
      setAniversariantes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("[useAniversariantes] Erro:", err);
      setError(err?.friendlyMessage || "Erro ao carregar aniversariantes.");
      setAniversariantes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { aniversariantes, loading, error, recarregar: carregar };
}
