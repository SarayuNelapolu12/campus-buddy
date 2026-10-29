import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Report from './pages/Report';
import ItemDetails from './pages/ItemDetails';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import './styles.css';

function Protected({ children, admin = false }) {
  const { user, checking } = useAuth(); const location = useLocation();
  if (checking) return <div className="app-checking">Opening your campus space…</div>;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace/>;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace/>;
  return children;
}
function Footer(){return <footer className="site-footer"><div className="container footer-inner"><div className="footer-brand"><span className="brand-mark"><span>CB</span></span><span>campus<span className="brand-light">buddy</span></span></div><p>Little things matter. Let's help them find their way home.</p><span>Made for campus communities · © {new Date().getFullYear()} Campus Buddy</span></div></footer>}
function App(){return <AuthProvider><BrowserRouter><Navbar/><Routes><Route path="/" element={<Home/>}/><Route path="/login" element={<Auth mode="login"/>}/><Route path="/register" element={<Auth mode="register"/>}/><Route path="/items/:id" element={<ItemDetails/>}/><Route path="/report" element={<Protected><Report/></Protected>}/><Route path="/items/:id/edit" element={<Protected><Report/></Protected>}/><Route path="/dashboard" element={<Protected><Dashboard/></Protected>}/><Route path="/admin" element={<Protected admin><Admin/></Protected>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes><Footer/></BrowserRouter></AuthProvider>}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
