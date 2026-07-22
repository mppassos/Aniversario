import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { enviarMensagemWhatsApp, gerarMensagensIA } from '../services/api';

const ESTILOS = {
  equilibrada: {
    icon: 'bi-stars',
    label: 'Equilibrada',
    cor: 'text-brand-600',
    bg: 'bg-brand-50',
    descricao: 'Profissional e acolhedor',
  },
  formal: {
    icon: 'bi-briefcase-fill',
    label: 'Mais Formal',
    cor: 'text-gray-600',
    bg: 'bg-gray-50',
    descricao: 'Respeitoso e tradicional',
  },
  proxima: {
    icon: 'bi-heart-fill',
    label: 'Mais Próxima',
    cor: 'text-green-600',
    bg: 'bg-green-50',
    descricao: 'Leve e pessoal',
  },
};

function getNomeCompacto(nome) {
  if (!nome) return '';
  const partes = nome.trim().split(' ');
  if (partes.length <= 2) return nome;
  return `${partes[0]} ${partes[partes.length - 1]}`;
}

function GeradorMensagem({ cliente, nomeCorretor, onClose, onJaEnviei }) {
  const [loading, setLoading] = useState(false);
  const [mensagens, setMensagens] = useState([]);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensagemEnviadaId, setMensagemEnviadaId] = useState(null);
  const [mensagemCopiadaId, setMensagemCopiadaId] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && !loading && !enviando) onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [loading, enviando, onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev || '';
    };
  }, []);

  if (!cliente) return null;

  async function handleGerar() {
    setLoading(true);
    setMensagens([]);
    setErro('');
    setMensagemEnviadaId(null);
    setMensagemCopiadaId(null);

    try {
      const response = await gerarMensagensIA({
        nomeCliente: cliente.nome,
        nomeCorretor,
      });

      const estilosPossiveis = ['equilibrada', 'formal', 'proxima'];
      const mensagensComEstilo = (response.mensagens || []).map((msg, index) => ({
        ...msg,
        estilo: msg.estilo?.toLowerCase() || estilosPossiveis[index] || 'personalizado',
      }));

      setMensagens(mensagensComEstilo);
      toast.success(`${mensagensComEstilo.length} mensagens geradas!`);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'IA indisponível no momento. Tente novamente.';
      setErro(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleEnviarWhatsApp(mensagem, index) {
    if (!cliente.telefone) {
      toast.error('Cliente sem telefone cadastrado.');
      return;
    }
    setEnviando(true);
    try {
      const response = await enviarMensagemWhatsApp({
        clienteId: cliente._id,
        mensagem,
      });
      if (response.success && response.link) {
        window.open(response.link, '_blank');
        setMensagemEnviadaId(index);
        toast.success('WhatsApp aberto!');
      } else {
        toast.error(response?.message || 'Erro ao abrir WhatsApp.');
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || 'Erro ao abrir WhatsApp.'
      );
    } finally {
      setEnviando(false);
    }
  }

  async function handleCopiar(mensagem, index) {
    try {
      await navigator.clipboard.writeText(mensagem);
      setMensagemCopiadaId(index);
      toast.success('Mensagem copiada!');
      setTimeout(() => setMensagemCopiadaId(null), 3000);
    } catch {
      toast.error('Erro ao copiar mensagem.');
    }
  }

  function handleClose() {
    if (!loading && !enviando) onClose();
  }

  const nomeCompacto = getNomeCompacto(cliente.nome);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm px-0 sm:px-4 transition-opacity duration-300"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      role="dialog"
      aria-modal="true"
      ref={modalRef}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md overflow-hidden shadow-2xl flex flex-col transition-all duration-300 transform translate-y-0"
        style={{
          maxHeight: '90dvh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="bg-gradient-to-br from-brand-800 to-brand-600 px-5 py-4 flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h5 className="font-bold text-white text-base flex items-center gap-2">
                <i className="bi bi-sparkles text-amber-300"></i>
                Mensagens com IA
              </h5>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span
                  className="text-white/90 text-xs flex items-center gap-1.5 truncate font-medium"
                  title={cliente.nome}
                >
                  <i className="bi bi-person-fill"></i>
                  {nomeCompacto}
                </span>
                {cliente.telefone && (
                  <span className="text-white/70 text-xs flex items-center gap-1.5 flex-shrink-0">
                    <i className="bi bi-whatsapp"></i>
                    {cliente.telefone}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              className="text-white/70 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg flex-shrink-0"
              onClick={handleClose}
              aria-label="Fechar"
            >
              <i className="bi bi-x-lg text-base"></i>
            </button>
          </div>
        </div>

        {/* Scrollable Body - Área interna de geração */}
        <div
          className="flex-1 overflow-y-auto bg-slate-50 p-4"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* Botão de Ação Primária */}
          <button
            type="button"
            className="w-full bg-gradient-to-br from-brand-600 to-purple-600 text-white rounded-xl py-3.5 font-semibold text-sm hover:shadow-md hover:brightness-105 active:scale-[0.99] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
            onClick={handleGerar}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Gerando mensagens...
              </>
            ) : (
              <>
                <i className="bi bi-cpu"></i>
                {mensagens.length > 0 ? 'Gerar Novamente' : 'Gerar Mensagens com IA'}
              </>
            )}
          </button>

          {erro && (
            <div className="bg-red-50 text-red-700 rounded-xl p-3 flex items-start gap-2 text-xs mb-3 border border-red-100">
              <i className="bi bi-exclamation-triangle-fill text-red-500 flex-shrink-0 mt-0.5"></i>
              <span>{erro}</span>
            </div>
          )}

          {!cliente.telefone && mensagens.length > 0 && (
            <div className="bg-yellow-50 text-yellow-800 rounded-xl p-3 flex items-start gap-2 text-xs mb-3 border border-yellow-100">
              <i className="bi bi-exclamation-triangle text-yellow-600 flex-shrink-0 mt-0.5"></i>
              <span>Cliente sem telefone. Cadastre para enviar via WhatsApp.</span>
            </div>
          )}

          {/* Renderização das Opções Baseadas em Estilo */}
          {mensagens.map((item, index) => {
            const key = item.estilo?.toLowerCase() || 'personalizado';
            const estilo = ESTILOS[key] || {
              icon: 'bi-chat-text-fill',
              label: item.estilo || 'Personalizado',
              cor: 'text-slate-600',
              bg: 'bg-slate-50',
              descricao: '',
            };
            const isEnviando = enviando && mensagemEnviadaId === index;
            const isCopiada = mensagemCopiadaId === index;

            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-slate-200/60 mb-3 overflow-hidden"
              >
                {/* Header do Card Individual */}
                <div className={`${estilo.bg} px-3.5 py-2.5 flex items-center justify-between border-b border-slate-100`}>
                  <div className="flex items-center gap-2">
                    <i className={`bi ${estilo.icon} ${estilo.cor} text-sm`}></i>
                    <span className={`font-semibold text-xs ${estilo.cor}`}>
                      {estilo.label}
                    </span>
                    <span className="text-[0.65rem] text-slate-400 hidden sm:inline font-normal">
                      • {estilo.descricao}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[0.65rem] text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded-full font-medium">
                      {index + 1}/{mensagens.length}
                    </span>
                    {isCopiada && (
                      <span className="text-[0.65rem] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <i className="bi bi-check-circle-fill"></i>
                        Copiada
                      </span>
                    )}
                  </div>
                </div>

                {/* Texto e Ações do Card */}
                <div className="p-3.5">
                  <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed min-h-[60px] select-text">
                    {item.mensagem}
                  </p>

                  <div className="flex gap-2.5 mt-3.5">
                    <button
                      type="button"
                      className={`flex-1 ${
                        cliente.telefone
                          ? 'bg-green-500 hover:bg-green-600 active:scale-[0.98]'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      } text-white rounded-lg py-2.5 px-3 text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1.5`}
                      onClick={() => handleEnviarWhatsApp(item.mensagem, index)}
                      disabled={!cliente.telefone || enviando}
                    >
                      {isEnviando ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-whatsapp"></i>
                          WhatsApp
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className={`flex-1 ${
                        isCopiada
                          ? 'bg-green-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      } rounded-lg py-2.5 px-3 text-xs font-semibold transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-1.5`}
                      onClick={() => handleCopiar(item.mensagem, index)}
                    >
                      <i className={`bi ${isCopiada ? 'bi-check-circle-fill' : 'bi-clipboard'}`}></i>
                      {isCopiada ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Placeholder vazio */}
          {mensagens.length === 0 && !loading && !erro && (
            <div className="text-center py-12 px-4 text-slate-400">
              <i className="bi bi-chat-left-heart text-5xl block mb-3 opacity-30 text-brand-600"></i>
              <p className="text-sm font-semibold text-slate-600">
                Gere sugestões de mensagem
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-[240px] mx-auto">
                Clique no botão superior para criar mensagens exclusivas de aniversário com Inteligência Artificial.
              </p>
            </div>
          )}
        </div>

        {/* Footer do Modal */}
        <div className="p-4 border-t border-slate-100 bg-white flex-shrink-0">
          <button
            type="button"
            className="w-full bg-green-500 text-white rounded-xl py-3 font-semibold text-sm hover:bg-green-600 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2"
            onClick={() => {
              onJaEnviei(cliente._id);
              onClose();
            }}
          >
            <i className="bi bi-check-circle-fill"></i>
            Já Enviei
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default GeradorMensagem;