import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import AniversarianteDoDia from '../components/AniversarianteDoDia';
import CalendarioMensal from '../components/CalendarioMensal';
import GeradorMensagem from '../components/GeradorMensagem';
import LoadingSpinner from '../components/LoadingSpinner';
import PullToRefreshIndicator from '../components/PullToRefreshIndicator';
import { useAniversariantes } from '../hooks/useAniversariantes';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { marcarComoEnviado } from '../services/api';

function Home() {
  const location = useLocation();
  const { aniversariantes, loading, error, recarregar } = useAniversariantes();
  const [clienteModal, setClienteModal] = useState(null);
  const [isVisible, setIsVisible]       = useState(false);

  const nomeCorretor = import.meta.env.VITE_NOME_CORRETOR || 'Corretor de Seguros';
  const lista = Array.isArray(aniversariantes) ? aniversariantes : [];

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

  useEffect(() => {
    const clienteId = new URLSearchParams(location.search).get('clienteId');
    if (clienteId && lista.length) {
      const found = lista.find(a => a._id === clienteId);
      if (found) setClienteModal(found);
    }
  }, [location.search, lista]);

  async function handleJaEnviei(clienteId) {
    try {
      await marcarComoEnviado(clienteId);
      toast.success('Marcado como enviado! 🎉');
      setClienteModal(null);
      await recarregar();
    } catch {
      toast.error('Erro ao marcar. Tente novamente.');
    }
  }

  if (loading) return <LoadingSpinner texto="Carregando aniversariantes..." />;

  if (error) return (
    <div className="animate-fade-in">
      <div className="card border-red-100 bg-red-50 flex items-start gap-3 p-4 mb-4">
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
      className="transition-all duration-300"
      style={{
        opacity:    isVisible ? 1 : 0,
        transform:  isVisible ? 'translateY(0)' : 'translateY(8px)',
      }}
    >
      <PullToRefreshIndicator
        progress={pullProgress}
        isRefreshing={isRefreshing}
      />

      {/* Calendário */}
      <CalendarioMensal onSelectCliente={setClienteModal} />

      {/* Header da seção */}
      <div className="section-header">
        <h2 className="section-title">
          <i className="bi bi-calendar-heart text-brand-600" />
          Aniversariantes de Hoje
        </h2>
        {lista.length > 0 && (
          <span className="section-count">{lista.length}</span>
        )}
      </div>

      {/* Lista ou estado vazio */}
      {lista.length === 0 ? (
        <div className="card text-center py-10 px-6 animate-fade-in">
          <div className="text-5xl mb-3">🎉</div>
          <p className="font-semibold text-gray-600 text-sm">
            Nenhum aniversariante hoje
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Aproveite o dia tranquilo!
          </p>
        </div>
      ) : (
        <div className="space-y-0">
          {lista.map((cliente, idx) => (
            <div
              key={cliente._id}
              className="animate-slide-up"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <AniversarianteDoDia
                cliente={cliente}
                onGerarMensagem={setClienteModal}
                onJaEnviei={handleJaEnviei}
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal gerador */}
      <GeradorMensagem
        cliente={clienteModal}
        nomeCorretor={nomeCorretor}
        onClose={() => setClienteModal(null)}
        onJaEnviei={handleJaEnviei}
      />
    </div>
  );
}

export default Home;