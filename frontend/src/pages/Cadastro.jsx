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
    clientes, loading, error, recarregar,
    busca, setBusca,
    pagina, paginacao, proximaPagina, paginaAnterior,
  } = useClientes();

  const [inputValue, setInputValue]   = useState(busca);
  const [isSearching, setIsSearching] = useState(false);
  const [deletingId, setDeletingId]   = useState(null);
  const timeoutRef = useRef(null);

  const handleBuscaChange = useCallback((e) => {
    const value = e.target.value;
    setInputValue(value);
    setIsSearching(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setBusca(value);
      setIsSearching(false);
    }, 600);
  }, [setBusca]);

  function limparBusca() {
    setInputValue('');
    setBusca('');
  }

  async function handleDeletar(id) {
    if (!window.confirm('Excluir este cliente permanentemente?')) return;
    setDeletingId(id);
    try {
      await deletarCliente(id);
      toast.success('Cliente excluído!');
      await recarregar();
    } catch {
      toast.error('Erro ao excluir. Tente novamente.');
    } finally {
      setDeletingId(null);
    }
  }

  const totalClientes = paginacao.total || clientes.length;

  return (
    <div className="animate-fade-in">

      {/* ── Header da página ───────────────────────────────────────────── */}
      <div className="section-header mb-4">
        <div>
          <h1 className="section-title text-base">
            <i className="bi bi-people-fill text-brand-600" />
            Clientes
          </h1>
          {totalClientes > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">
              {totalClientes} cadastrado{totalClientes !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* ── Busca ─────────────────────────────────────────────────────── */}
      <div className="card flex items-center gap-2 px-3 mb-4">
        <i className={`bi ${isSearching ? 'bi-hourglass-split animate-spin' : 'bi-search'} text-gray-400 flex-shrink-0`} />
        <input
          type="search"
          className="flex-1 py-3 bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
          placeholder="Buscar por nome ou telefone..."
          value={inputValue}
          onChange={handleBuscaChange}
          autoComplete="off"
        />
        {inputValue && (
          <button
            type="button"
            className="btn-icon btn-ghost w-8 h-8 min-h-0 text-gray-400"
            onClick={limparBusca}
            aria-label="Limpar busca"
          >
            <i className="bi bi-x-lg text-sm" />
          </button>
        )}
      </div>

      {/* Tag de filtro ativo */}
      {busca && (
        <div className="flex items-center gap-2 mb-3">
          <span className="badge-blue text-xs">
            <i className="bi bi-funnel-fill" />
            {busca}
          </span>
          <button
            type="button"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            onClick={limparBusca}
          >
            Limpar
          </button>
        </div>
      )}

      {/* ── Erro ──────────────────────────────────────────────────────── */}
      {error && (
        <div className="card border-red-100 bg-red-50 flex items-start gap-3 p-4 mb-4">
          <i className="bi bi-exclamation-triangle-fill text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-700">Erro ao carregar</p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
          </div>
          <button
            type="button"
            className="btn-icon btn-ghost text-red-500 w-8 h-8 min-h-0"
            onClick={recarregar}
          >
            <i className="bi bi-arrow-clockwise" />
          </button>
        </div>
      )}

      {/* ── Lista ─────────────────────────────────────────────────────── */}
      {loading ? (
        <LoadingSpinner texto="Carregando clientes..." />
      ) : (
        <ListaClientes
          clientes={clientes}
          onEdit={(cliente) => navigate(`/cliente/${cliente._id}`)}
          onDelete={handleDeletar}
          deletingId={deletingId}
        />
      )}

      {/* ── Paginação ─────────────────────────────────────────────────── */}
      {paginacao.totalPaginas > 1 && (
        <div className="flex items-center justify-between mt-4 gap-2">
          <button
            className="btn btn-outline py-2 px-4 text-xs"
            onClick={paginaAnterior}
            disabled={pagina <= 1}
          >
            <i className="bi bi-chevron-left" />
            Anterior
          </button>

          <span className="badge-gray text-xs px-3 py-1.5 rounded-full">
            {paginacao.pagina} / {paginacao.totalPaginas}
          </span>

          <button
            className="btn btn-outline py-2 px-4 text-xs"
            onClick={proximaPagina}
            disabled={pagina >= paginacao.totalPaginas}
          >
            Próxima
            <i className="bi bi-chevron-right" />
          </button>
        </div>
      )}

      {/* ── FAB ───────────────────────────────────────────────────────── */}
      <button
        type="button"
        className="fab"
        onClick={() => navigate('/cliente/novo')}
        aria-label="Adicionar novo cliente"
      >
        <i className="bi bi-plus-lg" />
      </button>
    </div>
  );
}

export default Cadastro;