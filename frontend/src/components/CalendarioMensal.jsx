import { format, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useCalendario } from '../hooks/useCalendario';
import { useGeradorIA } from '../hooks/useGeradorIA';
import {
  calcularIdade,
  clienteParabenizadoEsteAno,
  formatarDataNascimento,
  getIniciais,
  getNomeCompacto,
  isDiaHoje,
} from '../utils/dateUtils';

const ESTILOS_IA = {
  equilibrada: { icon: 'bi-stars',          label: 'Equilibrada', cor: 'text-brand-600', bg: 'bg-brand-50' },
  formal:      { icon: 'bi-briefcase-fill', label: 'Formal',      cor: 'text-gray-600',  bg: 'bg-gray-50'  },
  proxima:     { icon: 'bi-heart-fill',     label: 'Proxima',     cor: 'text-green-600', bg: 'bg-green-50' },
};

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

const NOME_CORRETOR = import.meta.env.VITE_NOME_CORRETOR || 'Corretor de Seguros';

function Spinner({ className = 'w-6 h-6' }) {
  return (
    <div className={`${className} border-2 border-brand-600 border-t-transparent rounded-full animate-spin`} />
  );
}

function ConfirmacaoInline({ mensagem, icone, corBg, corBorda, corTexto, onConfirmar, onCancelar, labelConfirmar, classeConfirmar }) {
  return (
    <div className={`${corBg} ${corBorda} border rounded-xl p-3 mb-2`}>
      <p className={`text-xs font-semibold ${corTexto} mb-2 flex items-center gap-1.5`}>
        <i className={`bi ${icone} flex-shrink-0`} />
        {mensagem}
      </p>
      <div className="flex gap-2">
        <button type="button" className="btn btn-outline flex-1 py-2 text-xs" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="button" className={`btn flex-1 py-2 text-xs ${classeConfirmar}`} onClick={onConfirmar}>
          {labelConfirmar}
        </button>
      </div>
    </div>
  );
}

function Avatar({ nome, parabenizado, tamanho = 'md' }) {
  const iniciais = getIniciais(nome);
  const cls      = tamanho === 'md' ? 'avatar-md' : 'avatar-sm';
  return (
    <div className="relative flex-shrink-0">
      <div className={`${cls} ${parabenizado ? 'opacity-60' : ''}`}>
        {iniciais || <i className="bi bi-person-fill text-xl" />}
      </div>
      {parabenizado && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
          <i className="bi bi-check-lg text-white text-[0.55rem] font-bold" />
        </div>
      )}
    </div>
  );
}

function CardAniversariante({ cliente, onGerarMensagem, onJaEnviei, onEdit }) {
  const [confirmandoEnvio, setConfirmandoEnvio] = useState(false);

  const jaParabenizado = clienteParabenizadoEsteAno(cliente);
  const nomeComp       = getNomeCompacto(cliente.nome);
  const idade          = calcularIdade(cliente.dataNascimento);
  const dataLocal      = formatarDataNascimento(cliente.dataNascimento);
  const diaFormatado   = dataLocal
    ? format(dataLocal, "dd 'de' MMMM", { locale: ptBR })
    : '';

  return (
    <div className={`card p-3 mb-3 last:mb-0 transition-all duration-200 ${jaParabenizado ? 'opacity-75 bg-gray-50' : 'bg-white'}`}>

      <div className="flex items-start gap-3">
        <Avatar nome={cliente.nome} parabenizado={jaParabenizado} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className={`font-bold text-sm leading-tight truncate ${jaParabenizado ? 'text-gray-500' : 'text-gray-800'}`}
              title={cliente.nome}
            >
              {nomeComp}
            </p>
            {jaParabenizado ? (
              <span className="badge-green text-[0.6rem] flex-shrink-0">
                <i className="bi bi-check-circle-fill" /> Parabenizado
              </span>
            ) : (
              <span className="badge-yellow text-[0.6rem] flex-shrink-0">
                <i className="bi bi-clock" /> Pendente
              </span>
            )}
          </div>

          {nomeComp !== cliente.nome && (
            <p className="text-[0.6rem] text-gray-400 truncate leading-tight mt-0.5">
              {cliente.nome}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <i className="bi bi-cake2 text-[0.65rem]" />
              {diaFormatado}
            </span>
            {idade !== null && <span className="badge-blue">{idade} anos</span>}
          </div>

          {cliente.telefone ? (
            <div className="flex items-center gap-1.5 mt-1.5">
              <i className="bi bi-telephone text-green-500 text-sm flex-shrink-0" />
              <span className="text-xs font-medium text-gray-600 truncate">{cliente.telefone}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-1.5">
              <i className="bi bi-telephone-slash text-gray-300 text-sm flex-shrink-0" />
              <span className="text-xs text-gray-400">Sem telefone</span>
            </div>
          )}
        </div>

        <button
          type="button"
          className="btn-icon btn-ghost text-brand-600 hover:bg-brand-50 w-8 h-8 min-h-0 flex-shrink-0"
          onClick={() => onEdit(cliente._id)}
          aria-label="Editar cliente"
        >
          <i className="bi bi-pencil-fill text-xs" />
        </button>
      </div>

      <div className="border-t border-gray-100 my-3" />

      {confirmandoEnvio && (
        <ConfirmacaoInline
          mensagem={`Confirmar envio para ${nomeComp}?`}
          icone="bi-question-circle-fill"
          corBg="bg-green-50"
          corBorda="border-green-100"
          corTexto="text-green-800"
          labelConfirmar={<><i className="bi bi-check-lg" /> Confirmar</>}
          classeConfirmar="btn-success"
          onConfirmar={() => { setConfirmandoEnvio(false); onJaEnviei(cliente._id); }}
          onCancelar={() => setConfirmandoEnvio(false)}
        />
      )}

      {!confirmandoEnvio && (
        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-primary flex-1 py-2.5 text-xs"
            onClick={() => onGerarMensagem(cliente)}
          >
            <i className="bi bi-stars flex-shrink-0" />
            Gerar Mensagem
          </button>
          {!jaParabenizado && (
            <button
              type="button"
              className="btn btn-success flex-1 py-2.5 text-xs"
              onClick={() => setConfirmandoEnvio(true)}
            >
              <i className="bi bi-check-circle-fill flex-shrink-0" />
              Ja Enviei
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function CardMensagem({ item, index, total, cliente, onEnviar, onCopiar, enviando, enviadoId, copiadoId }) {
  const key    = item.estilo?.toLowerCase() || 'personalizado';
  const estilo = ESTILOS_IA[key] || { icon: 'bi-chat-text-fill', label: key, cor: 'text-gray-600', bg: 'bg-gray-50' };
  const isEnviando = enviando && enviadoId === index;
  const isCopiada  = copiadoId === index;

  return (
    <div className="card mb-3 overflow-hidden">
      <div className={`${estilo.bg} px-3 py-2 flex items-center justify-between border-b border-gray-100`}>
        <div className="flex items-center gap-2">
          <i className={`bi ${estilo.icon} ${estilo.cor} text-sm`} />
          <span className={`font-semibold text-xs ${estilo.cor}`}>{estilo.label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="badge-gray text-[0.6rem]">{index + 1}/{total}</span>
          {isCopiada && (
            <span className="badge-green text-[0.6rem]">
              <i className="bi bi-check-circle-fill" /> Copiada
            </span>
          )}
        </div>
      </div>

      <div className="p-3">
        <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed">
          {item.mensagem}
        </p>
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            className={`btn flex-1 py-2 text-xs rounded-xl ${
              cliente.telefone
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
            }`}
            onClick={() => onEnviar(item.mensagem, index)}
            disabled={!cliente.telefone || enviando}
          >
            {isEnviando ? (
              <><Spinner className="w-3 h-3" /> Abrindo...</>
            ) : (
              <><i className="bi bi-whatsapp flex-shrink-0" /> WhatsApp</>
            )}
          </button>
          <button
            type="button"
            className={`btn flex-1 py-2 text-xs rounded-xl ${isCopiada ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            onClick={() => onCopiar(item.mensagem, index)}
          >
            <i className={`bi ${isCopiada ? 'bi-check-circle-fill' : 'bi-clipboard'} flex-shrink-0`} />
            {isCopiada ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ViewGerador({ cliente, onVoltar, onJaEnviei }) {
  const [confirmandoEnvio, setConfirmandoEnvio] = useState(false);
  const nomeComp = getNomeCompacto(cliente.nome);

  const {
    loading, mensagens, erro,
    enviando, mensagemEnviadaId, mensagemCopiadaId,
    gerar, enviarWhatsApp, copiar,
  } = useGeradorIA({ cliente, nomeCorretor: NOME_CORRETOR });

  return (
    <>
      <div className="modal-header">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="btn-icon btn-ghost w-8 h-8 min-h-0 text-gray-500 flex-shrink-0"
            onClick={onVoltar}
            aria-label="Voltar"
          >
            <i className="bi bi-arrow-left text-base" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
              <i className="bi bi-stars text-brand-600" />
              Mensagens com IA
            </h2>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-gray-500 truncate" title={cliente.nome}>
                {nomeComp}
              </span>
              {cliente.telefone && (
                <span className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                  <i className="bi bi-telephone text-green-500 text-xs" />
                  {cliente.telefone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="modal-body">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-brand-100" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-600 animate-spin" />
            </div>
            <p className="text-sm font-medium text-gray-500">Gerando mensagens...</p>
            <p className="text-xs text-gray-400">A IA esta trabalhando para voce</p>
          </div>
        )}

        {!loading && erro && (
          <div className="space-y-3">
            <div className="card border-red-100 bg-red-50 flex items-start gap-2 p-3">
              <i className="bi bi-exclamation-triangle-fill text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-red-700">{erro}</span>
            </div>
            <button type="button" className="btn btn-primary w-full" onClick={gerar}>
              <i className="bi bi-arrow-clockwise flex-shrink-0" />
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !erro && !cliente.telefone && mensagens.length > 0 && (
          <div className="card border-yellow-100 bg-yellow-50 flex items-start gap-2 p-3 mb-3">
            <i className="bi bi-exclamation-triangle-fill text-yellow-600 flex-shrink-0 mt-0.5" />
            <span className="text-xs text-yellow-800">
              Cliente sem telefone. Cadastre para enviar via WhatsApp.
            </span>
          </div>
        )}

        {!loading && !erro && mensagens.length > 0 && (
          <button type="button" className="btn btn-outline w-full mb-4 text-xs" onClick={gerar}>
            <i className="bi bi-arrow-clockwise flex-shrink-0" />
            Gerar Novamente
          </button>
        )}

        {!loading && mensagens.map((item, index) => (
          <CardMensagem
            key={index}
            item={item}
            index={index}
            total={mensagens.length}
            cliente={cliente}
            onEnviar={enviarWhatsApp}
            onCopiar={copiar}
            enviando={enviando}
            enviadoId={mensagemEnviadaId}
            copiadoId={mensagemCopiadaId}
          />
        ))}
      </div>

      <div className="modal-footer">
        {!confirmandoEnvio ? (
          <button
            type="button"
            className="btn btn-success w-full"
            onClick={() => setConfirmandoEnvio(true)}
            disabled={loading}
          >
            <i className="bi bi-check-circle-fill flex-shrink-0" />
            Ja Enviei
          </button>
        ) : (
          <ConfirmacaoInline
            mensagem={`Confirmar envio para ${nomeComp}?`}
            icone="bi-question-circle-fill"
            corBg="bg-green-50"
            corBorda="border-green-100"
            corTexto="text-green-800"
            labelConfirmar={<><i className="bi bi-check-lg" /> Confirmar</>}
            classeConfirmar="btn-success"
            onConfirmar={() => { setConfirmandoEnvio(false); onJaEnviei(cliente._id); }}
            onCancelar={() => setConfirmandoEnvio(false)}
          />
        )}
      </div>
    </>
  );
}

function ViewLista({ diaSelecionado, clientesDoDia, onGerarMensagem, onJaEnviei, onEdit, onFechar }) {
  return (
    <>
      <div className="modal-header">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <i className="bi bi-calendar-event text-brand-600" />
              {format(diaSelecionado, "dd 'de' MMMM", { locale: ptBR })}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
              {clientesDoDia.length} aniversariante{clientesDoDia.length !== 1 ? 's' : ''}
              {isDiaHoje(diaSelecionado) && <span className="badge-yellow">Hoje</span>}
            </p>
          </div>
          <button
            type="button"
            className="btn-icon btn-ghost w-8 h-8 min-h-0 text-gray-500"
            onClick={onFechar}
            aria-label="Fechar"
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>
      </div>

      <div className="modal-body">
        {clientesDoDia.map(cliente => (
          <CardAniversariante
            key={cliente._id}
            cliente={cliente}
            onGerarMensagem={onGerarMensagem}
            onJaEnviei={onJaEnviei}
            onEdit={onEdit}
          />
        ))}
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-outline w-full" onClick={onFechar}>
          Fechar
        </button>
      </div>
    </>
  );
}

function CelulaCalendario({ dia, aniversariantes, onClick }) {
  if (dia === null) return <div className="min-h-[40px]" />;

  const diaHoje = isDiaHoje(dia);
  const temAniv = aniversariantes.length > 0;

  let bg    = 'bg-transparent';
  let txt   = 'text-gray-800';
  let dot   = 'bg-brand-500';
  let ring  = '';
  const hover = temAniv ? 'hover:bg-brand-100 cursor-pointer active:scale-95' : 'cursor-default';

  if (diaHoje && temAniv) {
    bg = 'bg-gradient-to-br from-brand-600 to-purple-600'; txt = 'text-white'; dot = 'bg-yellow-400'; ring = 'ring-2 ring-yellow-400 ring-offset-1';
  } else if (diaHoje) {
    bg = 'bg-brand-600'; txt = 'text-white';
  } else if (temAniv) {
    bg = 'bg-brand-50'; txt = 'text-brand-700';
  }

  return (
    <div className="flex justify-center">
      <div
        className={`${bg} ${txt} ${ring} ${hover} rounded-lg transition-all duration-150 min-h-[40px] w-full mx-0.5 flex flex-col items-center justify-center select-none`}
        onClick={() => temAniv && onClick(dia)}
      >
        <span className="text-xs font-medium leading-none">{format(dia, 'd')}</span>
        {temAniv && (
          <div className="flex justify-center gap-0.5 mt-0.5">
            {aniversariantes.slice(0, 2).map((_, idx) => (
              <div key={idx} className={`${dot} rounded-full w-1 h-1`} />
            ))}
            {aniversariantes.length > 2 && (
              <span className={`text-[0.35rem] font-bold ${txt}`}>
                +{aniversariantes.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CalendarioMensal({ onJaEnviei, onRecarregar }) {
  const {
    loadingClientes,
    mesAtual,
    diaSelecionado,
    clientesDoDia,
    view,
    clienteGerador,
    semanas,
    getAniversariantesDoDia,
    handleDiaClick,
    fecharModal,
    abrirGerador,
    voltarParaLista,
    editarCliente,
    marcarEnviado,
    irParaMesAnterior,
    irParaProximoMes,
  } = useCalendario({ onJaEnviei, onRecarregar });

  const mesNome    = format(mesAtual, 'MMMM', { locale: ptBR });
  const modalAberto = diaSelecionado && clientesDoDia.length > 0;

  if (loadingClientes) {
    return (
      <div className="calendario-card flex justify-center py-6">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <div className="calendario-card">

        <div className="flex items-center justify-between px-3 pt-3 pb-1">
          <button
            type="button"
            className="btn-icon w-9 h-9 min-h-0 btn-ghost text-gray-600"
            onClick={irParaMesAnterior}
            aria-label="Mes anterior"
          >
            <i className="bi bi-chevron-left" />
          </button>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700 capitalize text-sm">{mesNome}</span>
              {isSameMonth(mesAtual, new Date()) && (
                <span className="badge-blue text-[0.5rem] animate-pulse">Atual</span>
              )}
            </div>
            <span className="text-[0.6rem] font-bold text-brand-600 bg-brand-50 px-3 py-0.5 rounded-full mt-0.5">
              {mesAtual.getFullYear()}
            </span>
          </div>

          <button
            type="button"
            className="btn-icon w-9 h-9 min-h-0 btn-ghost text-gray-600"
            onClick={irParaProximoMes}
            aria-label="Proximo mes"
          >
            <i className="bi bi-chevron-right" />
          </button>
        </div>

        <div className="px-2 pb-2">
          {/* Cabeçalho dias da semana */}
          <div className="grid grid-cols-7 mb-1">
            {DIAS_SEMANA.map(dia => (
              <div key={dia} className="text-center py-1">
                <span className="text-[0.6rem] font-medium text-gray-400">{dia}</span>
              </div>
            ))}
          </div>

          {semanas.map((semana, si) => (
            <div key={si} className="grid grid-cols-7 gap-0 mb-0.5">
              {semana.map((dia, di) => (
                <CelulaCalendario
                  key={dia ? format(dia, 'yyyy-MM-dd') : `vazio-${si}-${di}`}
                  dia={dia}
                  aniversariantes={dia ? getAniversariantesDoDia(dia) : []}
                  onClick={handleDiaClick}
                />
              ))}
            </div>
          ))}

          <div className="flex justify-center gap-4 pt-2 mt-1 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              <span className="text-[0.55rem] text-gray-500">Aniversariante</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              <span className="text-[0.55rem] text-gray-500">Hoje com aniversario</span>
            </div>
          </div>
        </div>
      </div>

      {modalAberto && createPortal(
        <div
          className="modal-overlay"
          onClick={e => e.target === e.currentTarget && fecharModal()}
        >
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />

            {view === 'lista' ? (
              <ViewLista
                diaSelecionado={diaSelecionado}
                clientesDoDia={clientesDoDia}
                onGerarMensagem={abrirGerador}
                onJaEnviei={marcarEnviado}
                onEdit={editarCliente}
                onFechar={fecharModal}
              />
            ) : (
              <ViewGerador
                cliente={clienteGerador}
                onVoltar={voltarParaLista}
                onJaEnviei={marcarEnviado}
              />
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default CalendarioMensal;