import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import CalendarioMensal from '../components/CalendarioMensal';
import LoadingSpinner from '../components/LoadingSpinner';
import PullToRefreshIndicator from '../components/PullToRefreshIndicator';
import { useAniversariantes } from '../hooks/useAniversariantes';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { marcarComoEnviado } from '../services/api';

function Home() {
  const location = useLocation();
  const { aniversariantes, loading, error, recarregar } = useAniversariantes();
  const [isVisible, setIsVisible] = useState(false);

  const lista     = Array.isArray(aniversariantes) ? aniversariantes : [];
  const anoAtual  = new Date().getFullYear();

  const totalHoje       = lista.length;
  const totalParabenizados = lista.filter(
    c => c.anoParabenizado === anoAtual
  ).length;
  const totalPendentes  = totalHoje - totalParabenizados;

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const id = setInterval(recarregar, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [recarregar]);

  const { pullProgress, isRefreshing } = usePullToRefresh({
    onRefresh: recarregar,
    threshold: 80,
  });

  async function handleJaEnviei(clienteId) {
    try {
      await marcarComoEnviado(clienteId);
      toast.success('Marcado como enviado.');
      await recarregar();
    } catch {
      toast.error('Erro ao marcar. Tente novamente.');
    }
  }

  if (loading) return <LoadingSpinner texto="Carregando aniversariantes..." />;

  if (error) return (
    <div className="animate-fade-in space-y-3">
      <div className="card border-red-100 bg-red-50 flex items-start gap-3 p-4">
        <i className="bi bi-exclamation-triangle-fill text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-700">Erro ao carregar</p>
          <p className="text-xs text-red-600 mt-0.5">{error}</p>
        </div>
      </div>
      <button className="btn btn-primary w-full" onClick={recarregar}>
        <i className="bi bi-arrow-clockwise" />
        Tentar novamente
      </button>
    </div>
  );

  return (
    <div
      className="animate-fade-in"
      style={{
        opacity:    isVisible ? 1 : 0,
        transform:  isVisible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
    >
      <PullToRefreshIndicator
        progress={pullProgress}
        isRefreshing={isRefreshing}
      />

      {/* ── Header com contadores ──────────────────────────────────────── */}
      <div className="card px-4 py-3 mb-4">

        {/* Linha 1 — titulo + total */}
        <div className="flex items-center justify-between">
          <h2 className="section-title">
            <i className="bi bi-calendar-heart text-brand-600" />
            Aniversariantes de Hoje
          </h2>
          {totalHoje > 0 ? (
            <span className="section-count">{totalHoje}</span>
          ) : (
            <span className="badge-gray">0</span>
          )}
        </div>

        {/* Linha 2 — parabenizados (so aparece se tem alguem hoje) */}
        {totalHoje > 0 && (
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <i className="bi bi-check-circle-fill text-green-500 text-sm" />
              Parabenizados
            </span>

            <div className="flex items-center gap-2">
              {/* Barra de progresso */}
              <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-500"
                  style={{
                    width: totalHoje > 0
                      ? `${(totalParabenizados / totalHoje) * 100}%`
                      : '0%',
                  }}
                />
              </div>

              {/* Contador x/total */}
              <span className="text-xs font-bold text-gray-600 tabular-nums">
                {totalParabenizados}
                <span className="text-gray-400 font-normal">
                  /{totalHoje}
                </span>
              </span>

              {/* Badge quando todos parabenizados */}
              {totalParabenizados === totalHoje && totalHoje > 0 && (
                <span className="badge-green text-[0.6rem]">
                  <i className="bi bi-trophy-fill" />
                  Todos!
                </span>
              )}
            </div>
          </div>
        )}

        {/* Linha 3 — pendentes (so aparece se tem pendente) */}
        {totalPendentes > 0 && (
          <div className="flex items-center justify-between mt-1.5">
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <i className="bi bi-clock text-amber-400 text-sm" />
              Pendentes
            </span>
            <span className="badge-yellow text-[0.6rem]">
              {totalPendentes}
            </span>
          </div>
        )}
      </div>

      {/* ── Calendario ────────────────────────────────────────────────── */}
      <CalendarioMensal
        onJaEnviei={handleJaEnviei}
        onRecarregar={recarregar}
      />
    </div>
  );
}

export default Home;