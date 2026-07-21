import { differenceInYears } from 'date-fns';

function calcularIdade(dataNascimento) {
  if (!dataNascimento) return null;
  try {
    const data = new Date(dataNascimento);
    return differenceInYears(new Date(), data);
  } catch {
    return null;
  }
}

function estaProximoAniversario(dataNascimento) {
  if (!dataNascimento) return false;
  try {
    const hoje = new Date();
    const aniversario = new Date(dataNascimento);
    aniversario.setFullYear(hoje.getFullYear());
    
    const diffEmDias = Math.ceil((aniversario - hoje) / (1000 * 60 * 60 * 24));
    return diffEmDias > 0 && diffEmDias <= 7;
  } catch {
    return false;
  }
}

function formatarData(dateStr) {
  if (!dateStr) return '';
  const part = String(dateStr).split('T')[0];
  const [y, m, d] = part.split('-');
  return d && m && y ? `${d}/${m}/${y}` : '';
}

function getFontSize(nome) {
  if (!nome) return 'text-sm';
  if (nome.length > 35) return 'text-xs';
  if (nome.length > 25) return 'text-xs';
  return 'text-sm';
}

function ListaClientes({ clientes, onEdit, onDelete }) {
  if (!clientes || clientes.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 text-center p-8">
        <i className="bi bi-person-x text-5xl text-gray-300 block mb-3"></i>
        <h6 className="font-semibold text-gray-500 mb-1">Nenhum cliente cadastrado</h6>
        <p className="text-xs text-gray-400">Clique no botão + para adicionar</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {clientes.map((cliente) => {
        const idade = calcularIdade(cliente.dataNascimento);
        const proximoAniversario = estaProximoAniversario(cliente.dataNascimento);
        const iniciais = cliente.nome
          .split(' ')
          .slice(0, 2)
          .map(palavra => palavra[0])
          .join('')
          .toUpperCase();

        return (
          <div
            key={cliente._id}
            className="bg-white rounded-xl shadow-sm border border-gray-100/80 p-3 flex items-center gap-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            style={{
              borderLeft: proximoAniversario ? '4px solid #fbbf24' : '4px solid transparent',
            }}
          >
            {/* Avatar */}
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
              {iniciais || <i className="bi bi-person-fill"></i>}
            </div>

            {/* Informações */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span 
                  className={`font-semibold text-gray-800 ${getFontSize(cliente.nome)} line-clamp-2`}
                  title={cliente.nome}
                >
                  {cliente.nome}
                </span>
                {proximoAniversario && (
                  <span className="text-sm" title="Aniversário próximo!">🎈</span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <i className="bi bi-cake2"></i>
                  {formatarData(cliente.dataNascimento)}
                </span>
                {idade !== null && (
                  <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {idade} anos
                  </span>
                )}
                {cliente.telefone && (
                  <span className="flex items-center gap-1 text-xs">
                    <i className="bi bi-whatsapp text-green-500"></i>
                    <span className="hidden sm:inline">{cliente.telefone}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-1 flex-shrink-0">
              <button
                type="button"
                className="p-2 rounded-lg text-brand-600 hover:bg-brand-50 transition-colors"
                onClick={() => onEdit(cliente)}
                title="Editar"
              >
                <i className="bi bi-pencil-fill text-sm"></i>
              </button>
              {onDelete && (
                <button
                  type="button"
                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                  onClick={() => onDelete(cliente._id)}
                  title="Excluir"
                >
                  <i className="bi bi-trash-fill text-sm"></i>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ListaClientes;