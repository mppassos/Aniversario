import { useEffect, useRef, useState } from 'react';
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      role="dialog"
      aria-modal="true"
      ref={modalRef}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm overflow-hidden shadow-2xl flex flex-col"
        style={{
          maxHeight: '92dvh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-brand-800 to-brand-600 px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h5 className="font-bold text-white text-sm flex items-center gap-2">
                <i className="bi bi-sparkles"></i>
                Mensagens com IA
              </h5>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span
                  className="text-white/80 text-xs flex items-center gap-1 truncate"
                  title={cliente.nome}
                >
                  <i className="bi bi-person"></i>
                  {nomeCompacto}
                </span>
                {cliente.telefone && (
                  <span className="text-white/60 text-xs flex items-center gap-1 flex-shrink-0">
                    <i className="bi bi-whatsapp"></i>
                    {cliente.telefone}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              className="text-white/70 hover:text-white transition-colors p-1 flex-shrink-0"
              onClick={handleClose}
              aria-label="Fechar"
            >
              <i className="bi bi-x-lg text-lg"></i>
            </button>
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto bg-gray-50 p-4"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <button
            type="button"
            className="w-full bg-gradient-to-br from-brand-600 to-purple-600 text-white rounded-xl py-3.5 font-semibold text-sm hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
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
            <div className="bg-red-50 text-red-700 rounded-xl p-3 flex items-start gap-2 text-sm mb-3">
              <i className="bi bi-exclamation-triangle-fill flex-shrink-0 mt-0.5"></i>
              <span>{erro}</span>
            </div>
          )}

          {!cliente.telefone && mensagens.length > 0 && (
            <div className="bg-yellow-50 text-yellow-800 rounded-xl p-3 flex items-start gap-2 text-sm mb-3">
              <i className="bi bi-exclamation-triangle-fill flex-shrink-0 mt-0.5"></i>
              <span>Cliente sem telefone. Cadastre para enviar via WhatsApp.</span>
            </div>
          )}

          {mensagens.map((item, index) => {
            const key = item.estilo?.toLowerCase() || 'personalizado';
            const estilo = ESTILOS[key] || {
              icon: 'bi-chat-text-fill',
              label: item.estilo || 'Personalizado',
              cor: 'text-gray-600',
              bg: 'bg-gray-50',
              descricao: '',
            };
            const isEnviando = enviando && mensagemEnviadaId === index;
            const isCopiada = mensagemCopiadaId === index;

            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-100 mb-3 overflow-hidden"
              >
                <div className={`${estilo.bg} px-3 py-2 flex items-center justify-between border-b border-gray-100/50`}>
                  <div className="flex items-center gap-2">
                    <i className={`bi ${estilo.icon} ${estilo.cor} text-sm`}></i>
                    <span className={`font-semibold text-xs ${estilo.cor}`}>
                      {estilo.label}
                    </span>
                    <span className="text-[0.6rem] text-gray-400 hidden sm:inline">
                      • {estilo.descricao}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[0.6rem] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                      {index + 1}/{mensagens.length}
                    </span>
                    {isCopiada && (
                      <span className="text-[0.6rem] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <i className="bi bi-check-circle-fill"></i>
                        Copiada
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3">
                  <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed min-h-[60px]">
                    {item.mensagem}
                  </p>

                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      className={`flex-1 ${
                        cliente.telefone
                          ? 'bg-green-500 hover:bg-green-600 active:scale-95'
                          : 'bg-gray-200 cursor-not-allowed'
                      } text-white rounded-lg py-2.5 px-2 text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5`}
                      onClick={() => handleEnviarWhatsApp(item.mensagem, index)}
                      disabled={!cliente.telefone || enviando}
                    >
                      {isEnviando ? (
                        <>
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Abrindo...
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
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      } rounded-lg py-2.5 px-2 text-xs font-semibold transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5`}
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

          {mensagens.length === 0 && !loading && !erro && (
            <div className="text-center py-10 text-gray-400">
              <i className="bi bi-chat-dots text-5xl block mb-3 opacity-40"></i>
              <p className="text-sm font-medium text-gray-500">
                Clique em "Gerar Mensagens com IA"
              </p>
              <p className="text-xs text-gray-400 mt-1">
                para criar mensagens personalizadas para {nomeCompacto}
              </p>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-gray-100 bg-white flex-shrink-0">
          <button
            type="button"
            className="w-full bg-green-500 text-white rounded-xl py-3 font-semibold text-sm hover:bg-green-600 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
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
    </div>
  );
}

export default GeradorMensagem;