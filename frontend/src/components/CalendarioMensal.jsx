import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { listarClientes } from '../services/api';

function CalendarioMensal({ onSelectCliente }) {
  const [clientes, setClientes] = useState([]);
  const anoAtual = new Date().getFullYear();
  const hoje = new Date();
  const [mesAtual, setMesAtual] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
  const [loading, setLoading] = useState(true);
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [clientesDoDia, setClientesDoDia] = useState([]);

  useEffect(() => {
    carregarClientes();
  }, []);

  async function carregarClientes() {
    try {
      const data = await listarClientes(1, 999);
      setClientes(Array.isArray(data.clientes) ? data.clientes : []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  }

  function getAniversariantesDoDia(dia) {
    if (!Array.isArray(clientes)) return [];
    
    return clientes.filter(cliente => {
      if (!cliente.dataNascimento) return false;
      const data = new Date(cliente.dataNascimento);
      return data.getDate() === dia.getDate() && 
             data.getMonth() === dia.getMonth();
    });
  }

  function handleDiaClick(dia) {
    const aniversariantes = getAniversariantesDoDia(dia);
    if (aniversariantes.length === 0) return;
    
    setDiaSelecionado(dia);
    setClientesDoDia(aniversariantes);
  }

  function fecharModal() {
    setDiaSelecionado(null);
    setClientesDoDia([]);
  }

  function irParaMesAnterior() {
    const novoMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1);
    
    if (novoMes.getFullYear() !== anoAtual) {
      return;
    }
    
    setMesAtual(novoMes);
    setDiaSelecionado(null);
    setClientesDoDia([]);
  }

  function irParaProximoMes() {
    const novoMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1);
    
    if (novoMes.getFullYear() !== anoAtual) {
      return;
    }
    
    setMesAtual(novoMes);
    setDiaSelecionado(null);
    setClientesDoDia([]);
  }

  const inicioMes = startOfMonth(mesAtual);
  const fimMes = endOfMonth(mesAtual);
  const inicioCalendario = startOfWeek(inicioMes, { weekStartsOn: 0 });
  const fimCalendario = endOfWeek(fimMes, { weekStartsOn: 0 });
  const diasCalendario = eachDayOfInterval({
    start: inicioCalendario,
    end: fimCalendario
  });

  const semanas = [];
  for (let i = 0; i < diasCalendario.length; i += 7) {
    semanas.push(diasCalendario.slice(i, i + 7));
  }

  const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

  function calcularIdade(dataNascimento) {
    if (!dataNascimento) return null;
    try {
      const data = new Date(dataNascimento);
      const hoje = new Date();
      let idade = hoje.getFullYear() - data.getFullYear();
      const mes = hoje.getMonth() - data.getMonth();
      if (mes < 0 || (mes === 0 && hoje.getDate() < data.getDate())) {
        idade--;
      }
      return idade;
    } catch {
      return null;
    }
  }

  function getFontSize(nome) {
    if (!nome) return 'text-sm';
    if (nome.length > 35) return 'text-xs';
    if (nome.length > 25) return 'text-xs';
    return 'text-sm';
  }

  const isJaneiro = mesAtual.getMonth() === 0;
  const isDezembro = mesAtual.getMonth() === 11;
  const mesAtualNome = format(mesAtual, 'MMMM', { locale: ptBR });

  if (loading) {
    return (
      <div className="calendario-card p-4">
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="calendario-card">
        {/* Header com destaque do mês atual */}
        <div className="flex items-center justify-between px-3 pt-3">
          <button
            type="button"
            className={`w-9 h-9 rounded-full transition-colors flex items-center justify-center ${
              isJaneiro
                ? 'text-gray-300 cursor-not-allowed'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            onClick={irParaMesAnterior}
            disabled={isJaneiro}
            aria-label="Mês anterior"
          >
            <i className="bi bi-chevron-left"></i>
          </button>
          
          <div className="flex items-center gap-2">
            <h6 className="font-semibold text-gray-700 capitalize text-sm">
              {mesAtualNome}
            </h6>
            {/* ✅ DESTAQUE DO MÊS ATUAL */}
            {isSameMonth(mesAtual, new Date()) && (
              <span className="text-[0.5rem] font-bold text-brand-600 bg-brand-100 px-2 py-0.5 rounded-full animate-pulse">
                Atual
              </span>
            )}
          </div>
          
          <button
            type="button"
            className={`w-9 h-9 rounded-full transition-colors flex items-center justify-center ${
              isDezembro
                ? 'text-gray-300 cursor-not-allowed'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            onClick={irParaProximoMes}
            disabled={isDezembro}
            aria-label="Próximo mês"
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>

        {/* Badge do ano */}
        <div className="flex justify-center pb-2">
          <span className="text-[0.55rem] font-bold text-brand-600 bg-brand-50 px-3 py-0.5 rounded-full">
            {anoAtual}
          </span>
        </div>

        {/* Dias da semana */}
        <div className="px-2">
          <div className="grid grid-cols-7 gap-0 mb-1">
            {diasDaSemana.map((dia) => (
              <div key={dia} className="text-center">
                <span className="text-[0.6rem] font-medium text-gray-400">
                  {dia}
                </span>
              </div>
            ))}
          </div>

          {/* Dias do mês */}
          {semanas.map((semana, semanaIndex) => (
            <div key={semanaIndex} className="grid grid-cols-7 gap-0 mb-0.5">
              {semana.map((dia) => {
                const aniversariantes = getAniversariantesDoDia(dia);
                const isDiaAtual = isToday(dia);
                const isMesAtual = dia.getMonth() === mesAtual.getMonth();
                const temAniversariante = aniversariantes.length > 0;

                let bgColor = 'transparent';
                let textColor = 'text-gray-800';
                let dotColor = 'bg-brand-500';
                let border = 'border-transparent';
                let hoverEffect = '';

                if (isDiaAtual && temAniversariante) {
                  bgColor = 'bg-gradient-to-br from-brand-600 to-purple-600';
                  textColor = 'text-white';
                  dotColor = 'bg-yellow-400';
                  border = 'border-2 border-yellow-400';
                } else if (isDiaAtual) {
                  bgColor = 'bg-brand-600';
                  textColor = 'text-white';
                  dotColor = 'bg-white';
                } else if (temAniversariante) {
                  bgColor = 'bg-brand-50';
                  textColor = 'text-gray-800';
                  dotColor = 'bg-brand-500';
                  hoverEffect = 'hover:bg-brand-100';
                }

                return (
                  <div key={format(dia, 'yyyy-MM-dd')} className="text-center">
                    <div
                      className={`${bgColor} ${textColor} ${border} ${hoverEffect} rounded-lg transition-colors duration-200 min-h-[44px] flex flex-col items-center justify-center mx-0.5 ${
                        temAniversariante ? 'cursor-pointer' : 'cursor-default'
                      }`}
                      style={{
                        fontWeight: isDiaAtual ? '700' : '400',
                      }}
                      onClick={() => handleDiaClick(dia)}
                    >
                      <span className="text-xs font-medium">
                        {format(dia, 'd')}
                        {isDiaAtual && temAniversariante && (
                          <i className="bi bi-star-fill ml-0.5 text-[0.4rem] text-yellow-400"></i>
                        )}
                      </span>
                      
                      {temAniversariante && (
                        <div className="flex justify-center gap-0.5 mt-0.5">
                          {aniversariantes.slice(0, 2).map((cliente, idx) => (
                            <div
                              key={idx}
                              className={`${dotColor} rounded-full w-1 h-1`}
                              style={{
                                boxShadow: isDiaAtual ? '0 0 4px rgba(251, 191, 36, 0.5)' : 'none',
                              }}
                              title={cliente.nome}
                            />
                          ))}
                          {aniversariantes.length > 2 && (
                            <span className={`text-[0.35rem] font-bold opacity-80 ${textColor}`}>
                              +{aniversariantes.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Legenda */}
          <div className="flex justify-center gap-4 mt-2 pt-1 pb-2 text-[0.55rem]">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              <span className="text-gray-500">Aniversariante</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              <span className="text-gray-500 font-bold">Hoje com aniversario</span>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ MODAL RESPONSIVO - CORRIGIDO PARA TELAS PEQUENAS */}
      {diaSelecionado && clientesDoDia.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-sm animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && fecharModal()}
        >
          <div 
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm mx-0 sm:mx-4 overflow-hidden shadow-2xl"
            style={{ 
              maxHeight: '85vh',
              height: 'auto',
              minHeight: '200px',
              maxWidth: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-brand-800 to-brand-600 px-4 py-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h6 className="font-bold text-white text-sm truncate">
                    <i className="bi bi-calendar-event mr-2"></i>
                    {format(diaSelecionado, "dd 'de' MMMM", { locale: ptBR })}
                  </h6>
                  <span className="text-white/70 text-xs">
                    {clientesDoDia.length} aniversariante(s)
                  </span>
                </div>
                <button
                  type="button"
                  className="text-white/70 hover:text-white transition-colors p-1 flex-shrink-0 ml-2"
                  onClick={fecharModal}
                  aria-label="Fechar"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
            </div>

            {/* Body com scroll */}
            <div 
              className="px-3 py-2 overflow-y-auto flex-1"
              style={{ 
                maxHeight: 'calc(85vh - 130px)',
                minHeight: '80px',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {clientesDoDia.map((cliente) => {
                const idade = calcularIdade(cliente.dataNascimento);
                const iniciais = cliente.nome
                  .split(' ')
                  .slice(0, 2)
                  .map(p => p[0])
                  .join('')
                  .toUpperCase();

                return (
                  <div
                    key={cliente._id}
                    className="flex items-center gap-2 p-2 mb-1.5 bg-white rounded-xl shadow-sm border border-gray-100"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {iniciais || <i className="bi bi-person-fill text-sm"></i>}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div 
                        className="font-semibold text-gray-800 text-xs line-clamp-2"
                        title={cliente.nome}
                      >
                        {cliente.nome}
                      </div>
                      <div className="flex flex-wrap items-center gap-1 text-[0.6rem] text-gray-500">
                        <span className="flex items-center gap-0.5">
                          <i className="bi bi-cake2 text-[0.5rem]"></i>
                          {idade} anos
                        </span>
                        {cliente.telefone && (
                          <span className="flex items-center gap-0.5">
                            <i className="bi bi-whatsapp text-green-500 text-[0.5rem]"></i>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-0.5 flex-shrink-0">
                      <button
                        className="p-1 rounded-lg text-brand-600 hover:bg-brand-50 transition-colors"
                        onClick={() => {
                          fecharModal();
                          window.location.href = `/cliente/${cliente._id}`;
                        }}
                        aria-label="Editar"
                      >
                        <i className="bi bi-pencil-fill text-xs"></i>
                      </button>
                      <button
                        className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        onClick={() => {
                          if (window.confirm(`Excluir ${cliente.nome}?`)) {
                            fecharModal();
                          }
                        }}
                        aria-label="Excluir"
                      >
                        <i className="bi bi-trash-fill text-xs"></i>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-100 flex-shrink-0">
              <button
                className="w-full py-2 rounded-xl bg-gray-100 text-gray-600 font-medium text-sm hover:bg-gray-200 transition-colors active:scale-[0.98]"
                onClick={fecharModal}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CalendarioMensal;