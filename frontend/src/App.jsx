import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import Cadastro from './pages/Cadastro';
import ClienteForm from './pages/ClienteForm';
import Home from './pages/Home';

function App() {
  const { pathname } = useLocation();
  const isForm = pathname.startsWith('/cliente/');

  return (
    <div className="app-shell">

      <header className="top-nav">
        <div className="top-nav__inner">
          <div className="top-nav__brand">
            <div className="top-nav__logo">
              <img
                src="/favicon-32x32.png"
                alt="Logo"
                className="w-5 h-5 rounded-lg"
              />
            </div>
            <div>
              <p className="top-nav__title">Aniversário Seguro</p>
              <p className="top-nav__subtitle">Gestão de clientes</p>
            </div>
          </div>
          <span className="top-nav__badge">por Matheus Oliveira</span>
        </div>
      </header>

      <main className={isForm ? 'page-content--no-nav' : 'page-content'}>
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/clientes"      element={<Cadastro />} />
          <Route path="/cliente/novo"  element={<ClienteForm />} />
          <Route path="/cliente/:id"   element={<ClienteForm />} />
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
              <i className="bi bi-house-heart-fill" />
              <span>Início</span>
            </NavLink>
          </div>
          <div className="nav-item">
            <NavLink
              to="/clientes"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <i className="bi bi-people-fill" />
              <span>Clientes</span>
            </NavLink>
          </div>
        </nav>
      )}
    </div>
  );
}

export default App;