import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';

import App from './App';
import { Signup } from './pages/Signup';
import { Login } from './pages/Login';
import { Admin } from './pages/Admin';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <Routes>
      <Route path="/"       element={<App />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login"  element={<Login />} />
      <Route path="/admin"  element={<Admin />} />
    </Routes>
  </HashRouter>,
);
