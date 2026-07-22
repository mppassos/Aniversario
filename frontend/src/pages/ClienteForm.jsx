import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { notificarRecarregarAniversariantes } from '../hooks/useAniversariantes';
import {
  atualizarCliente,
  buscarClientePorId,
  criarCliente,
} from '../services/api';

function formatDateToDisplay(isoDate) {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

function applyPhoneMask(value) {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  let formatted = '';
  for (let i = 0; i < numbers.length; i++) {
    if (i === 0) formatted += '(';
    else if (i === 2) formatted += ') ';
    else if (i === 7) formatted += '-';
    formatted += numbers[i];
  }
  return formatted;
}

function ClienteForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const dateInputRef = useRef(null);

  const [form, setForm] = useState({
    nome: '',
    dataNascimento: '',
    dataDisplay: '',
    telefone: '',
    observacoes: '',
  });
  const [errors, setErrors] = useState({}); 
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    buscarClientePorId(id)
      .then((data) => {
        const isoDate = (data.dataNascimento || '').split('T')[0];
        setForm({
          nome: data.nome || '',
          dataNascimento: isoDate,
          dataDisplay: isoDate ? formatDateToDisplay(isoDate) : '',
          telefone: data.telefone || '',
          observacoes: data.observacoes || '',
        });
      })
      .catch(() => toast.error('Erro ao carregar dados do cliente.'))
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  function handleDateChange(e) {
    const isoDate = e.target.value;
    setForm((prev) => ({
      ...prev,
      dataNascimento: isoDate,
      dataDisplay: isoDate ? formatDateToDisplay(isoDate) : '',
    }));
    if (isoDate) setErrors((prev) => ({ ...prev, dataNascimento: '' }));
  }

  function handleChange(e) {
    const { name, value } = e.target;
    const newValue = name === 'telefone' ? applyPhoneMask(value) : value;
    setForm((prev) => ({ ...prev, [name]: newValue }));
    if (newValue) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function handleDisplayClick() {
    dateInputRef.current?.showPicker?.() ?? dateInputRef.current?.click();
  }

  function validate() {
    const newErrors = {};
    if (!form.nome.trim()) newErrors.nome = 'Nome é obrigatório.';
    if (!form.dataNascimento) newErrors.dataNascimento = 'Data de nascimento é obrigatória.';
    if (form.telefone.replace(/\D/g, '').length < 10)
      newErrors.telefone = 'Digite um telefone válido com DDD.';
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error(Object.values(newErrors)[0]);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nome: form.nome.trim(),
        dataNascimento: form.dataNascimento,
        telefone: form.telefone,
        observacoes: form.observacoes || '',
      };

      if (isEditing) {
        await atualizarCliente(id, payload);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await criarCliente(payload);
        toast.success('Cliente cadastrado com sucesso!');
      }

      notificarRecarregarAniversariantes();

      navigate('/clientes');
    } catch (err) {
      toast.error(err?.friendlyMessage || 'Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner texto="Carregando dados..." />;

  function inputClass(field) {
    return `w-full px-4 py-3 rounded-xl border transition-all duration-200 outline-none text-gray-700 text-base
      ${errors[field]
        ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50/30'
        : 'border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 bg-white'
      }`;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center text-gray-600 flex-shrink-0"
          onClick={() => navigate('/clientes')}
          aria-label="Voltar"
        >
          <i className="bi bi-arrow-left text-lg"></i>
        </button>
        <div className="min-w-0">
          <h5 className="font-bold text-brand-600 text-base truncate">
            <i className={`bi ${isEditing ? 'bi-pencil-square' : 'bi-person-plus-fill'} mr-2`}></i>
            {isEditing ? `Editando cliente` : 'Novo Cliente'}
          </h5>
          {isEditing && form.nome && (
            <p className="text-xs text-gray-400 truncate mt-0.5">{form.nome}</p>
          )}
        </div>
      </div>

      {/* Card do formulário */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <form onSubmit={handleSubmit} noValidate>

          {/* Nome */}
          <div className="mb-4">
            <label htmlFor="nome" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Nome completo <span className="text-red-500">*</span>
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              className={inputClass('nome')}
              placeholder="Ex: João Silva"
              value={form.nome}
              onChange={handleChange}
              autoFocus
            />
            {errors.nome && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <i className="bi bi-exclamation-circle-fill"></i>
                {errors.nome}
              </p>
            )}
          </div>

          {/* Data de Nascimento */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Data de Nascimento <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <div
                className={`${inputClass('dataNascimento')} flex items-center justify-between cursor-pointer`}
                onClick={handleDisplayClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleDisplayClick()}
              >
                <span className={form.dataDisplay ? 'text-gray-700' : 'text-gray-400'}>
                  {form.dataDisplay || 'DD/MM/AAAA'}
                </span>
                <i className="bi bi-calendar3 text-gray-400 text-lg"></i>
              </div>

              <input
                ref={dateInputRef}
                type="date"
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                value={form.dataNascimento}
                onChange={handleDateChange}
                tabIndex={-1}
                aria-hidden="true"
              />
            </div>

            {errors.dataNascimento && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <i className="bi bi-exclamation-circle-fill"></i>
                {errors.dataNascimento}
              </p>
            )}

            {form.dataDisplay && !errors.dataNascimento && (
              <div className="mt-2 bg-green-50 border border-green-100 rounded-xl p-2.5 flex items-center gap-2">
                <i className="bi bi-check-circle-fill text-green-500 flex-shrink-0"></i>
                <span className="text-sm text-gray-700">
                  Data selecionada:{' '}
                  <span className="font-semibold text-green-600">{form.dataDisplay}</span>
                </span>
              </div>
            )}
          </div>

          {/* Telefone */}
          <div className="mb-4">
            <label htmlFor="telefone" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Telefone <span className="text-red-500">*</span>
            </label>
            <input
              id="telefone"
              name="telefone"
              type="tel"
              inputMode="numeric"
              className={inputClass('telefone')}
              placeholder="(71) 99999-9999"
              value={form.telefone}
              onChange={handleChange}
              maxLength={15}
            />
            {errors.telefone ? (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <i className="bi bi-exclamation-circle-fill"></i>
                {errors.telefone}
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <i className="bi bi-whatsapp text-green-500"></i>
                Necessário para enviar mensagem via WhatsApp
              </p>
            )}
          </div>

          {/* Observações */}
          <div className="mb-5">
            <label htmlFor="observacoes" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Observações{' '}
              <span className="text-gray-400 font-normal text-xs">(opcional)</span>
            </label>
            <textarea
              id="observacoes"
              name="observacoes"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all duration-200 outline-none text-gray-700 text-sm resize-none bg-white"
              rows={3}
              placeholder="Anotações sobre o cliente..."
              value={form.observacoes}
              onChange={handleChange}
            />
          </div>

          {/* Botão submit */}
          <button
            type="submit"
            className="w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <i className={`bi ${isEditing ? 'bi-check-lg' : 'bi-person-plus-fill'}`}></i>
                {isEditing ? 'Salvar Alterações' : 'Cadastrar Cliente'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ClienteForm;