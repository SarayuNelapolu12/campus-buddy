import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, PlusCircle, LayoutDashboard, ShieldCheck, LogOut, Menu, X, Compass } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const signOut = () => { logout(); setOpen(false); navigate('/'); };
  const navClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;
  return <header className="site-header"><div className="nav-wrap">
    <Link to="/" className="brand" onClick={() => setOpen(false)}><span className="brand-mark"><Compass size={22}/></span><span>campus<span className="brand-light">buddy</span><small>LOST & FOUND, CONNECTED</small></span></Link>
    <button className="mobile-menu" aria-label="Toggle menu" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
    <nav className={`nav-links${open ? ' nav-open' : ''}`}>
      <NavLink to="/" end className={navClass} onClick={() => setOpen(false)}><Search size={16}/> Browse items</NavLink>
      {user && <NavLink to="/report" className={navClass} onClick={() => setOpen(false)}><PlusCircle size={16}/> Report item</NavLink>}
      {user && <NavLink to="/dashboard" className={navClass} onClick={() => setOpen(false)}><LayoutDashboard size={16}/> My dashboard</NavLink>}
      {user?.role === 'admin' && <NavLink to="/admin" className={navClass} onClick={() => setOpen(false)}><ShieldCheck size={16}/> Admin</NavLink>}
      {user ? <div className="nav-user"><span className="avatar">{user.name?.[0]?.toUpperCase()}</span><span className="user-name">{user.name}</span><button className="icon-button" title="Log out" onClick={signOut}><LogOut size={17}/></button></div> : <div className="nav-auth"><Link to="/login" className="login-link" onClick={() => setOpen(false)}>Log in</Link><Link to="/register" className="button button-small" onClick={() => setOpen(false)}>Join Campus Buddy</Link></div>}
    </nav>
  </div></header>;
}
