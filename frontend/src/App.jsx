import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import Cadastro from './pages/Cadastro';
import ClienteForm from './pages/ClienteForm';
import Home from './pages/Home';

function App() {
  const { pathname } = useLocation();
  const isForm = pathname.startsWith('/cliente/');

  return (
    <div className="app-container">
      <nav className="bg-gradient-to-br from-brand-700 to-brand-500 sticky top-0 z-40 shadow-md px-4 py-3.5">
        <div className="flex items-center justify-between max-w-[480px] mx-auto">
          <span className="text-white font-bold text-sm flex items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-md">
              <img 
                src="/favicon-32x32.png" 
                alt="Aniversário Seguro" 
                className="w-8 h-8 rounded-full"
              />
            </div>
            Aniversário Seguro
          </span>
          <span className="text-[0.45rem] font-bold text-white/70 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
            Desenvolvido por Matheus Oliveira
          </span>
        </div>
      </nav>

      <main className={`flex-1 py-3 ${!isForm ? 'pb-[100px]' : 'pb-3'}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/clientes" element={<Cadastro />} />
          <Route path="/cliente/novo" element={<ClienteForm />} />
          <Route path="/cliente/:id" element={<ClienteForm />} />
        </Routes>
      </main>

      {!isForm && (
        <nav className="bottom-nav">
          <div className="nav-item">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <i className="bi bi-house-heart-fill"></i>
              <span>Início</span>
            </NavLink>
          </div>
          <div className="nav-item">
            <NavLink
              to="/clientes"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <i className="bi bi-people-fill"></i>
              <span>Clientes</span>
            </NavLink>
          </div>
        </nav>
      )}
    </div>
  );
}

export default App;