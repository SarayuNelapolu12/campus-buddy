import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Compass, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import api, { errorMessage } from '../services/api';
import { useAuth } from '../context';

export default function Auth({ mode }) {
  const isRegister = mode === 'register'; const { user, login } = useAuth(); const navigate = useNavigate(); const location = useLocation();
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [showPassword, setShowPassword] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  if (user) return <Navigate to="/" replace/>;
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    try { const { data } = await api.post(`/auth/${isRegister ? 'register' : 'login'}`, isRegister ? { name, email, password } : { email, password }); login(data); navigate(location.state?.from || '/dashboard', { replace: true }); }
    catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  }
  return <main className="auth-page"><div className="auth-decoration"><div className="auth-orbit orbit-a"/><div className="auth-orbit orbit-b"/><div className="auth-decoration-content"><span className="auth-big-mark"><Compass size={34}/></span><div className="section-kicker">A CAMPUS THAT CARES</div><h2>Good things<br/>find their way<br/><em>back.</em></h2><p>Lost a little something? Found something that belongs to someone? You're in the right place.</p><div className="auth-points"><span><ShieldCheck size={17}/> Student-first community</span><span><ShieldCheck size={17}/> Simple. Safe. Helpful.</span></div></div></div><div className="auth-form-side"><form className="auth-form" onSubmit={submit}><div className="auth-form-mark"><span className="brand-mark"><Compass size={22}/></span><span>campus<span className="brand-light">buddy</span></span></div><div className="section-kicker">{isRegister ? 'JOIN THE COMMUNITY' : 'WELCOME BACK'}</div><h1>{isRegister ? 'Create your account' : 'Good to see you again.'}</h1><p className="auth-subtitle">{isRegister ? 'A few details and you’re ready to help.' : 'Sign in to manage your listings and claims.'}</p>{error && <div className="alert alert-error">{error}</div>}
      {isRegister && <label className="form-label">Full name<input required minLength={2} maxLength={80} autoComplete="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Aashi Kumar"/></label>}
      <label className="form-label">Email address<input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@college.edu"/></label>
      <label className="form-label">Password<div className="password-field"><input required minLength={isRegister ? 8 : undefined} type={showPassword ? 'text' : 'password'} autoComplete={isRegister ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={isRegister ? 'At least 8 characters' : 'Enter your password'}/><button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></label>
      <button className="button button-primary auth-submit" disabled={busy}>{busy ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'} <ArrowRight size={17}/></button><p className="auth-switch">{isRegister ? 'Already part of the community?' : 'New to Campus Buddy?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Log in' : 'Create an account'}</Link></p><p className="auth-privacy">Your account details are used to manage listings and claims.</p>
    </form></div></main>;
}
