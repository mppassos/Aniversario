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
  const [isVisible, setIsVisible] = useState(false);
  const nomeCorretor = import.meta.env.VITE_NOME_CORRETOR || 'Corretor de Seguros';
  const aniversariantesList = Array.isArray(aniversariantes) ? aniversariantes : [];

  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      recarregar();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [recarregar]);

  const { pullProgress, isRefreshing } = usePullToRefresh({
    onRefresh: async () => {
      await recarregar();
    },
    threshold: 80,
  });

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const clienteId = query.get('clienteId');
    if (clienteId && aniversariantesList.length) {
      const cliente = aniversariantesList.find((a) => a._id === clienteId);
      if (cliente) setClienteModal(cliente);
    }
  }, [location.search, aniversariantesList]);

  async function handleJaEnviei(clienteId) {
    try {
      await marcarComoEnviado(clienteId);
      toast.success('Cliente marcado como enviado! 🎉');
      setClienteModal(null);
      await recarregar();
    } catch (err) {
      console.error('[Home] Erro ao marcar enviado:', err);
      toast.error('Erro ao marcar cliente. Tente novamente.');
    }
  }

  if (loading) {
    return <LoadingSpinner texto="Carregando aniversariantes..." />;
  }

  if (error) {
    return (
      <div>
        <div className="bg-red-50 text-red-700 rounded-xl p-3 flex items-center gap-2 text-sm mb-3">
          <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
          <span>{error}</span>
        </div>
        <button 
          className="btn-primary px-6 py-2 text-sm"
          onClick={() => window.location.reload()}
        >
          Recarregar
        </button>
      </div>
    );
  }

  const temAniversariantes = aniversariantesList.length > 0;

  return (
    <div 
      className="w-full h-full overflow-visible transition-all duration-300"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
      }}
    >
      <PullToRefreshIndicator progress={pullProgress} isRefreshing={isRefreshing} />
      
      <CalendarioMensal onSelectCliente={setClienteModal} />

      <div className="flex items-center justify-between mb-3">
        <h5 className="font-bold text-gray-800 flex items-center gap-2">
          <i className="bi bi-calendar-heart text-brand-600"></i>
          Aniversariantes de Hoje
        </h5>
        {temAniversariantes && (
          <span className="bg-gradient-to-br from-brand-600 to-purple-600 text-white px-3.5 py-1 rounded-full text-sm font-bold shadow-md">
            {aniversariantesList.length}
          </span>
        )}
      </div>

      {!temAniversariantes ? (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200/30 text-center p-8">
          <div className="text-5xl mb-3">🎉</div>
          <h6 className="font-semibold text-green-800">Nenhum aniversariante hoje</h6>
          <p className="text-xs text-green-600 mt-1">Aproveite o dia tranquilo!</p>
        </div>
      ) : (
          
        <div 
          className="space-y-3 pb-5 overflow-y-auto"
          style={{ 
            maxHeight: 'calc(100vh - 480px)',
            minHeight: '200px',
            WebkitOverflowScrolling: 'touch',
            paddingRight: '2px',
          }}
        >
          {aniversariantesList.map((cliente) => (
            <AniversarianteDoDia
              key={cliente._id}
              cliente={cliente}
              onGerarMensagem={setClienteModal}
              onJaEnviei={handleJaEnviei}
            />
          ))}
        </div>
      )}

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