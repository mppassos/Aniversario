import { differenceInYears, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';

function calcularIdade(dataNascimento) {
  if (!dataNascimento) return null;
  try {
    const data = new Date(dataNascimento);
    return differenceInYears(new Date(), data);
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

  function handleConfirmarEnvio() {
    setShowConfirmDialog(true);
  }

  function handleConfirmar() {
    setShowConfirmDialog(false);
    onJaEnviei(cliente._id);
  }

  function handleCancelar() {
    setShowConfirmDialog(false);
  }

  const iniciais = cliente.nome
    .split(' ')
    .slice(0, 2)
    .map(palavra => palavra[0])
    .join('')
    .toUpperCase();

  function getFontSize(nome) {
    if (!nome) return 'text-base';
    if (nome.length > 35) return 'text-xs';
    if (nome.length > 25) return 'text-sm';
    return 'text-base';
  }

  return (
    <>
      <div 
        className="birthday-card"
        style={{
          position: 'relative',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
        }}
      >
        {/* Badge decorativo REMOVIDO */}

        <div className="flex items-center gap-3 mb-3">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
            {iniciais || <i className="bi bi-person-fill"></i>}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h6 className={`font-bold text-gray-800 ${getFontSize(cliente.nome)}`}>
                {cliente.nome}
              </h6>
              <span className="text-lg">🎂</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <i className="bi bi-calendar3"></i> {diaFormatado}
              </span>
              
              {idade !== null && (
                <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full">
                  {idade} anos
                </span>
              )}
              
              {cliente.telefone && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <i className="bi bi-whatsapp text-green-500"></i>
                  {cliente.telefone}
                </span>
              )}
            </div>
          </div>

          <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-900 px-3 py-1 rounded-full text-xs font-bold shadow-md animate-pulse-slow flex-shrink-0">
            <i className="bi bi-balloon-heart-fill mr-1"></i>
            Hoje!
          </span>
        </div>

        {cliente.observacoes && (
          <div className="mb-2">
            <button
              type="button"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors p-0"
              onClick={() => setMostrarObs(!mostrarObs)}
            >
              <i className={`bi bi-chevron-${mostrarObs ? 'down' : 'right'} mr-1`}></i>
              {mostrarObs ? 'Ocultar observacoes' : 'Ver observacoes'}
            </button>
            {mostrarObs && (
              <div className="mt-1 p-2.5 bg-gray-50 rounded-lg border-l-2 border-brand-500 text-sm text-gray-600">
                <i className="bi bi-pencil mr-1 text-gray-400"></i>
                {cliente.observacoes}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mt-2">
          <button
            type="button"
            className="btn-primary flex items-center justify-center gap-2"
            onClick={() => onGerarMensagem(cliente)}
          >
            <i className="bi bi-stars"></i>
            Gerar Mensagem
          </button>
          
          <button
            type="button"
            className="btn-success flex items-center justify-center gap-2"
            onClick={handleConfirmarEnvio}
          >
            <i className="bi bi-check-circle-fill"></i>
            Já Enviei
          </button>
        </div>
      </div>

      {showConfirmDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && handleCancelar()}
        >
          <div className="bg-white rounded-2xl max-w-sm w-full mx-4 overflow-hidden shadow-2xl">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                <i className="bi bi-check-circle-fill text-green-500 text-4xl"></i>
              </div>
              <h6 className="font-bold text-gray-800 mb-2">Confirmar envio</h6>
              <p className="text-gray-500 text-sm mb-4">
                Você confirma que já enviou a mensagem para <strong>{cliente.nome}</strong>?
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={handleCancelar}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-success flex items-center justify-center gap-2"
                  onClick={handleConfirmar}
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