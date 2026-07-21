import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        //console.log('[SW] Registrado com sucesso:', registration);
      })
      .catch((error) => {
        console.warn('[SW] Falha ao registrar:', error);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: { 
            borderRadius: '12px', 
            background: '#1e293b', 
            color: '#fff',
            padding: '12px 16px',
          },
          success: { 
            style: { background: '#22c55e', color: '#fff' } 
          },
          error: { 
            style: { background: '#ef4444', color: '#fff' } 
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);