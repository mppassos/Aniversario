import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { enviarMensagemWhatsApp, gerarMensagensIA } from '../services/api';

const ESTILOS = {
  equilibrada: { 
    icon: 'bi-stars', 
    label: 'Equilibrada', 
    cor: 'text-brand-600',
    bg: 'bg-brand-50',
    descricao: 'Profissional e acolhedor'
  },
  formal: { 
    icon: 'bi-briefcase-fill', 
    label: 'Mais Formal', 
    cor: 'text-gray-600',
    bg: 'bg-gray-50',
    descricao: 'Respeitoso e tradicional'
  },
  proxima: { 
    icon: 'bi-heart-fill', 
    label: 'Mais Proxima', 
    cor: 'text-green-600',
    bg: 'bg-green-50',
    descricao: 'Leve e pessoal'
  },
};

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
      if (e.key === 'Escape' && !loading && !enviando) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [loading, enviando, onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
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
        nomeCorretor: nomeCorretor,
      });      
      const mensagensComEstilo = (response.mensagens || []).map((msg, index) => {
        const estilosPossiveis = ['equilibrada', 'formal', 'proxima'];
        const estilo = msg.estilo?.toLowerCase() || estilosPossiveis[index] || 'personalizado';
        return { ...msg, estilo };
      });
      
      setMensagens(mensagensComEstilo);
      toast.success(`${mensagensComEstilo.length} mensagens geradas com sucesso!`);
    } catch (err) {
      console.error('Erro ao gerar mensagens:', err);
      const msg = err?.response?.data?.message || 
                   err?.message ||
                   'A IA esta indisponivel no momento. Tente novamente em alguns minutos.';
      setErro(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleEnviarWhatsApp(mensagem, estilo, index) {
    if (!cliente.telefone) {
      toast.error('Cliente nao possui telefone cadastrado.');
      return;
    }

    setEnviando(true);
    
    try {
      const payload = {
        clienteId: cliente._id,
        mensagem: mensagem
      };
      const response = await enviarMensagemWhatsApp(payload);

      if (response.success && response.link) {
        window.open(response.link, '_blank');
        setMensagemEnviadaId(index);
        toast.success('WhatsApp aberto para envio!');
      } else {
        toast.error(response?.message || 'Erro ao abrir WhatsApp.');
      }
    } catch (err) {
      console.error('[WhatsApp] Erro completo:', err);
      
      const msg = err?.response?.data?.message || 
                   err?.message || 
                   'Erro ao abrir WhatsApp. Tente novamente.';
      toast.error(msg);
    } finally {
      setEnviando(false);
    }
  }

  async function handleCopiarMensagem(mensagem, index) {
    try {
      await navigator.clipboard.writeText(mensagem);
      setMensagemCopiadaId(index);
      toast.success('Mensagem copiada para area de transferencia!');
      
      setTimeout(() => {
        setMensagemCopiadaId(null);
      }, 3000);
    } catch (error) {
      toast.error('Erro ao copiar mensagem.');
    }
  }

  function handleClose() {
    if (!loading && !enviando) {
      onClose();
    }
  }

  function getFontSize(mensagem) {
    if (!mensagem) return 'text-sm';
    if (mensagem.length > 500) return 'text-xs';
    if (mensagem.length > 300) return 'text-sm';
    return 'text-sm';
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      role="dialog"
      aria-modal="true"
      ref={modalRef}
    >
      <div className="bg-white rounded-2xl max-w-sm w-full mx-4 max-h-[90vh] overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-brand-800 to-brand-600 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-bold text-white text-sm flex items-center gap-2">
                <i className="bi bi-sparkles"></i>
                Mensagens com IA
              </h5>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-white/70 text-xs flex items-center gap-1">
                  <i className="bi bi-person"></i>
                  {cliente.nome}
                </span>
                {cliente.telefone && (
                  <span className="text-white/50 text-xs flex items-center gap-1">
                    <i className="bi bi-whatsapp"></i>
                    {cliente.telefone}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              className="text-white/70 hover:text-white transition-colors"
              onClick={handleClose}
              aria-label="Fechar"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 max-h-[60vh] overflow-y-auto bg-gray-50">
          
          {/* Botão Gerar */}
          <button
            type="button"
            className="w-full bg-gradient-to-br from-brand-600 to-purple-600 text-white rounded-xl py-3.5 font-semibold text-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-3"
            onClick={handleGerar}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Gerando mensagens...
              </>
            ) : (
              <>
                <i className="bi bi-cpu"></i>
                {mensagens.length > 0 ? 'Gerar Novamente' : 'Gerar Mensagens com IA'}
              </>
            )}
          </button>

          {/* Erro */}
          {erro && (
            <div className="bg-red-50 text-red-700 rounded-xl p-3 flex items-center gap-2 text-sm mb-3">
              <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
              <span>{erro}</span>
            </div>
          )}

          {/* Aviso sem telefone */}
          {!cliente.telefone && mensagens.length > 0 && (
            <div className="bg-yellow-50 text-yellow-800 rounded-xl p-3 flex items-center gap-2 text-sm mb-3">
              <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
              <span>Cliente sem telefone. Adicione para enviar via WhatsApp.</span>
            </div>
          )}

          {/* Lista de mensagens */}
          {mensagens.map((item, index) => {
            const key = item.estilo?.toLowerCase() || 'personalizado';
            const estilo = ESTILOS[key] || {
              icon: 'bi-chat-text-fill',
              label: item.estilo || 'Personalizado',
              cor: 'text-gray-600',
              bg: 'bg-gray-50',
              descricao: ''
            };
            const isEnviando = enviando && mensagemEnviadaId === index;
            const isCopiada = mensagemCopiadaId === index;

            return (
              <div 
                key={index} 
                className="bg-white rounded-xl shadow-sm border border-gray-100/80 mb-3 overflow-hidden animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Card header */}
                <div className={`${estilo.bg} px-4 py-2.5 flex items-center justify-between border-b border-gray-100/50`}>
                  <div className="flex items-center gap-2">
                    <i className={`bi ${estilo.icon} ${estilo.cor}`}></i>
                    <span className={`font-semibold text-sm ${estilo.cor}`}>
                      {estilo.label}
                    </span>
                    {estilo.descricao && (
                      <span className="text-xs text-gray-400 hidden sm:inline">
                        • {estilo.descricao}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[0.6rem] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {index + 1}/{mensagens.length}
                    </span>
                    {isCopiada && (
                      <span className="text-[0.6rem] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <i className="bi bi-check-circle-fill"></i>
                        Copiada
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Card body */}
                <div className="p-4">
                  <p
                    className={`${getFontSize(item.mensagem)} text-gray-700 whitespace-pre-line leading-relaxed min-h-[60px]`}
                  >
                    {item.mensagem}
                  </p>
                  
                  {/* Ações */}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <button
                      type="button"
                      className={`flex-1 min-w-[100px] ${cliente.telefone ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 cursor-not-allowed'} text-white rounded-lg py-2 px-3 text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1.5`}
                      onClick={() => handleEnviarWhatsApp(item.mensagem, key, index)}
                      disabled={!cliente.telefone || enviando}
                    >
                      {isEnviando ? (
                        <>
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Abrindo...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-whatsapp"></i>
                          Enviar WhatsApp
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      className={`flex-1 min-w-[80px] ${isCopiada ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} rounded-lg py-2 px-3 text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1.5`}
                      onClick={() => handleCopiarMensagem(item.mensagem, index)}
                    >
                      <i className={`bi ${isCopiada ? 'bi-check-circle-fill' : 'bi-clipboard'}`}></i>
                      {isCopiada ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Estado vazio */}
          {mensagens.length === 0 && !loading && !erro && (
            <div className="text-center py-8 text-gray-400">
              <i className="bi bi-chat-dots text-4xl block mb-3"></i>
              <p className="text-sm">
                Clique em "Gerar Mensagens com IA"<br />
                para criar mensagens personalizadas
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <button
            type="button"
            className="w-full bg-green-500 text-white rounded-xl py-3 font-semibold text-sm hover:bg-green-600 transition-all duration-200 flex items-center justify-center gap-2"
            onClick={() => {
              onJaEnviei(cliente._id);
              onClose();
            }}
          >
            <i className="bi bi-check-circle-fill"></i>
            Ja Enviei
          </button>
        </div>
      </div>
    </div>
  );
}

export default GeradorMensagem;