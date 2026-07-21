import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';

vi.mock('../services/api', () => ({
  listarClientes: vi.fn().mockResolvedValue([]),
  listarAniversariantesHoje: vi.fn().mockResolvedValue([]),
  marcarComoEnviado: vi.fn().mockResolvedValue({}),
  lembrarEmDuasHoras: vi.fn().mockResolvedValue({})
}));

vi.mock('../services/pushService', () => ({
  initPushNotifications: vi.fn().mockResolvedValue({ enabled: true })
}));

vi.mock('react-hot-toast', () => {
  const toastFn = vi.fn();
  toastFn.error = vi.fn();
  toastFn.success = vi.fn();
  return { default: toastFn };
});

describe('Home', () => {
  it('exibe estado vazio quando não há aniversariantes', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Nenhum aniversariante hoje')).toBeInTheDocument();
    });
  });
});
