import { differenceInYears } from 'date-fns';

function calcularIdade(dataNascimento) {
  if (!dataNascimento) return null;
  try {
    const part = String(dataNascimento).split('T')[0];
    const [y, m, d] = part.split('-').map(Number);
    return differenceInYears(new Date(), new Date(y, m - 1, d));
  } catch { return null; }
}

function diasParaAniversario(dataNascimento) {
  if (!dataNascimento) return null;
  try {
    const hoje = new Date();
    const part = String(dataNascimento).split('T')[0];
    const [, m, d] = part.split('-').map(Number);
    const prox = new Date(hoje.getFullYear(), m - 1, d);
    if (prox < hoje) prox.setFullYear(prox.getFullYear() + 1);
    return Math.ceil((prox - hoje) / 86400000);
  } catch { return null; }
}

function formatarData(dateStr) {
  if (!dateStr) return '';
  const part = String(dateStr).split('T')[0];
  const [y, m, d] = part.split('-');
  return d && m && y ? `${d}/${m}/${y}` : '';
}

function getNomeCompacto(nome) {
  const partes = (nome || '').trim().split(' ').filter(p => p.length > 2);
  if (partes.length <= 2) return nome;
  return `${partes[0]} ${partes[partes.length - 1]}`;
}

function getIniciais(nome) {
  return (nome || '')
    .split(' ')
    .filter(p => p.length > 2)
    .slice(0, 2)
    .map(p => p[0])
    .join('')
    .toUpperCase();
}

function AniversarioBadge({ dias }) {
  if (dias === null) return null;
  if (dias === 0) return (
    <span className="badge-yellow text-[0.6rem] px-2 py-0.5 rounded-full font-bold animate-pulse-slow">
      🎂 Hoje!
    </span>
  );
  if (dias <= 7) return (
    <span className="badge-yellow text-[0.6rem] px-2 py-0.5 rounded-full font-bold">
      🎈 {dias}d
    </span>
  );
  return null;
}

function ListaClientes({ clientes, onEdit, onDelete }) {
  if (!clientes || clientes.length === 0) {
    return (
      <div className="empty-state animate-fade-in">
        <i className="bi bi-people empty-state__icon" />
        <p className="empty-state__title">Nenhum cliente encontrado</p>
        <p className="empty-state__desc">
          Toque no <strong>+</strong> para adicionar o primeiro
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 animate-fade-in">
      {clientes.map((cliente, idx) => {
        const idade  = calcularIdade(cliente.dataNascimento);
        const dias   = diasParaAniversario(cliente.dataNascimento);
        const iniciais = getIniciais(cliente.nome);
        const nomeCompacto = getNomeCompacto(cliente.nome);
        const proximoAniversario = dias !== null && dias <= 7;

        return (
          <div
            key={cliente._id}
            className="card card--hover flex items-center gap-3 p-3"
            style={{
              animationDelay: `${idx * 30}ms`,
              borderLeft: proximoAniversario
                ? '3px solid #fbbf24'
                : '3px solid transparent',
            }}
          >
            {/* Avatar */}
            <div className="avatar-md flex-shrink-0 relative">
              {iniciais || <i className="bi bi-person-fill text-xl" />}
              {dias === 0 && (
                <span className="absolute -top-1 -right-1 text-sm">🎂</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="font-semibold text-gray-800 text-sm truncate"
                  title={cliente.nome}
                >
                  {nomeCompacto}
                </span>
                <AniversarioBadge dias={dias} />
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <i className="bi bi-cake2 text-[0.65rem]" />
                  {formatarData(cliente.dataNascimento)}
                </span>

                {idade !== null && (
                  <span className="badge-blue text-[0.6rem]">
                    {idade} anos
                  </span>
                )}

                {cliente.telefone && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <i className="bi bi-whatsapp text-green-500 text-[0.65rem]" />
                    <span className="hidden sm:inline">{cliente.telefone}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-1 flex-shrink-0">
              <button
                type="button"
                className="btn-icon btn-ghost text-brand-600 hover:bg-brand-50"
                onClick={() => onEdit(cliente)}
                aria-label="Editar"
              >
                <i className="bi bi-pencil-fill text-sm" />
              </button>
              {onDelete && (
                <button
                  type="button"
                  className="btn-icon btn-danger"
                  onClick={() => onDelete(cliente._id)}
                  aria-label="Excluir"
                >
                  <i className="bi bi-trash-fill text-sm" />
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