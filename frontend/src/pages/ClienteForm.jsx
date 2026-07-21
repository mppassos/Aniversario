import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { atualizarCliente, buscarClientePorId, criarCliente } from '../services/api';

function formatDateToBackend(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return dateStr;
}

function formatDateToDisplay(isoDate) {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return isoDate;
}

function applyPhoneMask(value) {
  const numbers = value.replace(/\D/g, '');
  const limited = numbers.slice(0, 11);
  let formatted = '';
  for (let i = 0; i < limited.length; i++) {
    if (i === 0) {
      formatted += '(';
    } else if (i === 2) {
      formatted += ') ';
    } else if (i === 7) {
      formatted += '-';
    }
    formatted += limited[i];
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
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    buscarClientePorId(id)
      .then((data) => {
        const isoDate = (data.dataNascimento || '').split('T')[0] || '';
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
    const displayDate = isoDate ? formatDateToDisplay(isoDate) : '';
    
    setForm((prev) => ({ 
      ...prev, 
      dataNascimento: isoDate,
      dataDisplay: displayDate
    }));
  }

  function handleChange(e) {
    const { name, value } = e.target;
    
    if (name === 'telefone') {
      const masked = applyPhoneMask(value);
      setForm((prev) => ({ ...prev, [name]: masked }));
    } else if (name === 'nome' || name === 'observacoes') {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  function handleDisplayClick() {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker?.() || dateInputRef.current.click();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!form.nome.trim()) {
      toast.error('O nome e obrigatorio.');
      return;
    }
    
    if (!form.dataNascimento) {
      toast.error('A data de nascimento e obrigatoria.');
      return;
    }

    const phoneNumbers = form.telefone.replace(/\D/g, '');
    if (phoneNumbers.length < 10) {
      toast.error('Telefone obrigatorio. Digite um numero valido com DDD.');
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
      navigate('/clientes');
    } catch (err) {
      toast.error(err?.friendlyMessage || 'Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner texto="Carregando dados..." />;

  return (
    <div>
      {/* Header com voltar */}
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center text-gray-600"
          onClick={() => navigate('/clientes')}
          aria-label="Voltar"
        >
          <i className="bi bi-arrow-left text-lg"></i>
        </button>
        <h5 className="font-bold text-brand-600 break-words">
          <i className={`bi ${isEditing ? 'bi-pencil-square' : 'bi-person-plus-fill'} mr-2`}></i>
          {isEditing ? `Editando: ${form.nome}` : 'Novo Cliente'}
        </h5>
      </div>

      {/* Formulário */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-5">
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
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all duration-200 outline-none text-gray-700 text-base"
              placeholder="Ex: Joao Silva"
              value={form.nome}
              onChange={handleChange}
              autoFocus
            />
          </div>

          {/* Data de Nascimento */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Data de Nascimento <span className="text-red-500">*</span>
            </label>
            
            <div className="relative">
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all duration-200 outline-none text-gray-700 text-base cursor-pointer bg-white pr-12"
                placeholder="DD/MM/YYYY"
                value={form.dataDisplay}
                onClick={handleDisplayClick}
                readOnly
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <i className="bi bi-calendar3 text-lg"></i>
              </div>
            </div>

            <input
              ref={dateInputRef}
              type="date"
              className="absolute opacity-0 w-0 h-0 pointer-events-none"
              value={form.dataNascimento}
              onChange={handleDateChange}
            />

            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <i className="bi bi-calendar-event"></i>
              Toque no campo para abrir o calendario
            </p>

            {form.dataDisplay && (
              <div className="mt-2 bg-green-50 rounded-xl p-2.5 flex items-center gap-2">
                <i className="bi bi-check-circle-fill text-green-500"></i>
                <span className="text-sm font-semibold text-gray-700">
                  Data selecionada: <span className="text-green-600">{form.dataDisplay}</span>
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
              pattern="[0-9]*"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all duration-200 outline-none text-gray-700 text-base"
              placeholder="(11) 99999-9999"
              value={form.telefone}
              onChange={handleChange}
              maxLength={15}
            />
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <i className="bi bi-whatsapp text-green-500"></i>
              Necessario para enviar mensagem via WhatsApp
            </p>
          </div>

          {/* Observacoes */}
          <div className="mb-5">
            <label htmlFor="observacoes" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Observacoes <span className="text-gray-400 font-normal text-xs">(opcional)</span>
            </label>
            <textarea
              id="observacoes"
              name="observacoes"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all duration-200 outline-none text-gray-700 text-sm resize-none"
              rows={3}
              placeholder="Anotacoes sobre o cliente..."
              value={form.observacoes}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Salvando...
              </>
            ) : (
              <>
                <i className={`bi ${isEditing ? 'bi-check-lg' : 'bi-person-plus-fill'}`}></i>
                {isEditing ? 'Salvar Alteracoes' : 'Cadastrar Cliente'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ClienteForm;