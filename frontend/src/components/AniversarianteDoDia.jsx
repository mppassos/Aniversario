import { differenceInYears, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';

function calcularIdade(dataNascimento) {
  if (!dataNascimento) return null;
  try {
    const part = String(dataNascimento).split('T')[0];
    const [yr, mo, dy] = part.split('-').map(Number);
    return differenceInYears(new Date(), new Date(yr, mo - 1, dy));
  } catch {
    return null;
  }
}

function AniversarianteDoDia({ cliente, onGerarMensagem, onJaEnviei }) {
  const [mostrarObs, setMostrarObs] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const idade = calcularIdade(cliente.dataNascimento);

  let diaFormatado = '';
  try {
    const part = String(cliente.dataNascimento || '').split('T')[0];
    const [yr, mo, dy] = part.split('-').map(Number);
    if (yr && mo && dy) {
      diaFormatado = format(new Date(yr, mo - 1, dy), "dd 'de' MMMM", { locale: ptBR });
    }
  } catch {
    diaFormatado = '';
  }

  const iniciais = cliente.nome
    .split(' ')
    .filter(p => p.length > 2)
    .slice(0, 2)
    .map(palavra => palavra[0])
    .join('')
    .toUpperCase();

  const partesNome = cliente.nome.trim().split(' ');
  const nomeExibicao = partesNome.length > 3
    ? `${partesNome[0]} ${partesNome[partesNome.length - 1]}`
    : cliente.nome;

  return (
    <>
      <div
        className="birthday-card"
        style={{
          position: 'relative',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
              {iniciais || <i className="bi bi-person-fill"></i>}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-[0.55rem]">🎂</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h6
              className="font-bold text-gray-800 text-sm leading-tight"
              title={cliente.nome}
            >
              {nomeExibicao}
            </h6>

            {nomeExibicao !== cliente.nome && (
              <p className="text-[0.6rem] text-gray-400 leading-tight truncate">
                {cliente.nome}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <i className="bi bi-calendar3 text-[0.65rem]"></i>
                {diaFormatado}
              </span>

              {idade !== null && (
                <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                  {idade} anos
                </span>
              )}
            </div>

            {cliente.telefone && (
              <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <i className="bi bi-whatsapp text-green-500 text-[0.7rem]"></i>
                {cliente.telefone}
              </span>
            )}
          </div>

          <span className="bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-[0.65rem] font-bold flex-shrink-0 flex items-center gap-1">
            <i className="bi bi-balloon-heart-fill text-[0.6rem]"></i>
            Hoje!
          </span>
        </div>

        {cliente.observacoes && (
          <div className="mb-2">
            <button
              type="button"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setMostrarObs(!mostrarObs)}
            >
              <i className={`bi bi-chevron-${mostrarObs ? 'down' : 'right'} mr-1`}></i>
              {mostrarObs ? 'Ocultar observações' : 'Ver observações'}
            </button>
            {mostrarObs && (
              <div className="mt-1 p-2.5 bg-gray-50 rounded-lg border-l-2 border-brand-500 text-xs text-gray-600">
                <i className="bi bi-pencil mr-1 text-gray-400"></i>
                {cliente.observacoes}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mt-2">
          <button
            type="button"
            className="btn-primary flex items-center justify-center gap-1.5 text-sm"
            onClick={() => onGerarMensagem(cliente)}
          >
            <i className="bi bi-stars text-yellow-300"></i>
            Gerar Mensagem
          </button>

          <button
            type="button"
            className="btn-success flex items-center justify-center gap-1.5 text-sm"
            onClick={() => setShowConfirmDialog(true)}
          >
            <i className="bi bi-check-circle-fill"></i>
            Já Enviei
          </button>
        </div>
      </div>

      {showConfirmDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setShowConfirmDialog(false)}
        >
          <div className="bg-white rounded-2xl max-w-sm w-full mx-4 overflow-hidden shadow-2xl">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                <i className="bi bi-check-circle-fill text-green-500 text-4xl"></i>
              </div>
              <h6 className="font-bold text-gray-800 mb-1">Confirmar envio</h6>
              <p className="text-gray-500 text-sm mb-4">
                Você confirma que já enviou a mensagem para{' '}
                <strong className="text-gray-700">{cliente.nome}</strong>?
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setShowConfirmDialog(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-success flex items-center justify-center gap-2"
                  onClick={() => {
                    setShowConfirmDialog(false);
                    onJaEnviei(cliente._id);
                  }}
                >
                  <i className="bi bi-check-lg"></i>
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AniversarianteDoDia;