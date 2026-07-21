import { useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ListaClientes from '../components/ListaClientes';
import LoadingSpinner from '../components/LoadingSpinner';
import { useClientes } from '../hooks/useClientes';
import { deletarCliente } from '../services/api';

function Cadastro() {
  const navigate = useNavigate();
  const {
    clientes,
    loading,
    error,
    recarregar,
    busca,
    setBusca,
    pagina,
    paginacao,
    proximaPagina,
    paginaAnterior,
  } = useClientes();

  const [inputValue, setInputValue] = useState(busca);
  const [isSearching, setIsSearching] = useState(false);
  const timeoutRef = useRef(null);

  const handleBuscaChange = useCallback((e) => {
    const value = e.target.value;
    setInputValue(value);
    setIsSearching(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setBusca(value);
      setIsSearching(false);
    }, 1000);
  }, [setBusca]);

  async function handleDeletar(id) {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;
    try {
      await deletarCliente(id);
      toast.success('Cliente excluido com sucesso!');
      await recarregar();
    } catch {
      toast.error('Erro ao excluir cliente. Tente novamente.');
    }
  }

  if (loading) return <LoadingSpinner texto="Carregando clientes..." />;

  return (
    <div>
      <h5 className="font-bold text-brand-600 mb-3 flex items-center gap-2">
        <i className="bi bi-people-fill"></i>
        Clientes Cadastrados
      </h5>

      {/* Busca */}
      <div className="mb-3">
        <div className="flex items-center bg-white rounded-xl border border-gray-200 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200 transition-all duration-200 overflow-hidden">
          <span className="pl-3 text-gray-400">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="flex-1 py-2.5 px-2 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
            placeholder="Buscar cliente..."
            value={inputValue}
            onChange={handleBuscaChange}
          />
          {isSearching && (
            <span className="pr-3">
              <span className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin inline-block"></span>
            </span>
          )}
          {inputValue && !isSearching && (
            <button
              className="pr-3 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => {
                setInputValue('');
                setBusca('');
              }}
              type="button"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>
        {busca && (
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <i className="bi bi-search"></i>
            Resultados para: <strong>{busca}</strong>
          </p>
        )}
      </div>

      {/* Erro */}
      {error && (
        <div className="bg-red-50 text-red-700 rounded-xl p-3 flex items-center gap-2 text-sm mb-3">
          <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Lista */}
      <ListaClientes
        clientes={clientes}
        onEdit={(cliente) => navigate(`/cliente/${cliente._id}`)}
        onDelete={handleDeletar}
      />

      {/* Paginação */}
      {paginacao.totalPaginas > 1 && (
        <div className="flex items-center justify-between mt-3 gap-2">
          <button
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={paginaAnterior}
            disabled={pagina <= 1}
          >
            <i className="bi bi-chevron-left mr-1"></i> Anterior
          </button>
          <span className="text-xs text-gray-500">
            Página {paginacao.pagina} de {paginacao.totalPaginas}
          </span>
          <button
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={proximaPagina}
            disabled={pagina >= paginacao.totalPaginas}
          >
            Próxima <i className="bi bi-chevron-right ml-1"></i>
          </button>
        </div>
      )}

      {/* FAB */}
      <button
        className="fab-btn"
        onClick={() => navigate('/cliente/novo')}
        title="Adicionar novo cliente"
        type="button"
      >
        <i className="bi bi-plus-lg"></i>
      </button>
    </div>
  );
}

export default Cadastro;