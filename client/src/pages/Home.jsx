import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Plus, ShieldCheck, HeartHandshake, ArrowRight, PackageSearch, SlidersHorizontal } from 'lucide-react';
import api, { errorMessage } from '../services/api';
import { useAuth } from '../context';
import ItemCard from '../components/ItemCard';

const categories = ['All categories','ID Card','Electronics','Books & Notes','Bags','Bottles','Keys','Clothing','Accessories','Other'];
export default function Home() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [type, setType] = useState(params.get('type') || 'all');
  const [category, setCategory] = useState(params.get('category') || 'All categories');
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const { user } = useAuth();
  useEffect(() => { setQuery(params.get('q') || ''); setType(params.get('type') || 'all'); setCategory(params.get('category') || 'All categories'); }, [params]);
  useEffect(() => {
    let active = true; setLoading(true); setError('');
    const timer = setTimeout(() => api.get('/items', { params: { q: query, ...(type !== 'all' ? { type } : {}), ...(category !== 'All categories' ? { category } : {}) } })
      .then(({ data }) => { if (active) setItems(data.items); }).catch((e) => { if (active) setError(errorMessage(e)); }).finally(() => { if (active) setLoading(false); }), 200);
    return () => { active = false; clearTimeout(timer); };
  }, [query, type, category]);
  function clearFilters() { setQuery(''); setType('all'); setCategory('All categories'); setParams({}); }
  return <>
    <section className="hero"><div className="hero-orb orb-one"/><div className="hero-orb orb-two"/><div className="container hero-grid"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot"/> YOUR CAMPUS, A LITTLE MORE CONNECTED</div><h1>Lost something?<br/><span>Let's bring it</span><br/>back to you.</h1><p className="hero-text">A missing ID card, your favourite bottle, those class notes — campus life happens. Find what you've lost, or help a fellow student find their way back to it.</p><div className="hero-actions"><a href="#browse" className="button button-light">Explore listings <ArrowRight size={17}/></a>{user ? <Link to="/report" className="button button-ghost"><Plus size={17}/> Report an item</Link> : <Link to="/register" className="button button-ghost">Join the community</Link>}</div><div className="hero-trust"><span><ShieldCheck size={16}/> Student-first community</span><span><HeartHandshake size={16}/> Good things find their way</span></div></div><div className="hero-visual"><div className="hero-visual-glow"/><div className="hero-note note-top"><span className="note-icon note-blue">⌁</span><span><b>Lost something?</b><small>Search campus listings</small></span><span className="note-arrow">↗</span></div><div className="hero-stack"><div className="stack-card stack-back"><div className="stack-lines"/></div><div className="stack-card stack-front"><div className="stack-topline"><span>FOUND ON CAMPUS</span><span className="stack-dot"/></div><div className="illustration-bottle"><div className="bottle-cap"/><div className="bottle-body"><div className="bottle-shine"/><span>HYDRATE</span></div></div><div className="stack-caption"><b>Blue water bottle</b><small><span className="mini-pin"/> Library · Today</small></div></div></div><div className="hero-note note-bottom"><span className="note-icon note-green">✓</span><span><b>A little help goes far.</b><small>Make someone's day.</small></span></div><div className="float-spark spark-one">✳</div><div className="float-spark spark-two">✦</div></div></div></section>
    <section className="stats-strip"><div className="container stats-grid"><div><span className="stat-icon"><PackageSearch size={19}/></span><span><b>One place</b><small>For lost & found items</small></span></div><div><span className="stat-icon"><Search size={19}/></span><span><b>Easy to search</b><small>Find items in a few clicks</small></span></div><div><span className="stat-icon"><HeartHandshake size={19}/></span><span><b>Community powered</b><small>Students helping students</small></span></div></div></section>
    <main className="container browse-section" id="browse"><div className="section-heading"><div><div className="section-kicker">THE CAMPUS BOARD</div><h2>Find your missing piece.</h2><p>Browse recent reports from your campus community.</p></div><Link to={user ? '/report' : '/login'} className="button button-primary"><Plus size={17}/> Post a listing</Link></div>
      <div className="filter-panel"><div className="search-box"><Search size={18}/><input aria-label="Search listings" placeholder="Search items, places, descriptions..." value={query} onChange={e => setQuery(e.target.value)}/>{query && <button onClick={() => setQuery('')} aria-label="Clear search">×</button>}</div><div className="filter-select-wrap"><SlidersHorizontal size={16}/><select aria-label="Filter by type" value={type} onChange={e => setType(e.target.value)}><option value="all">Lost & found</option><option value="lost">Lost items</option><option value="found">Found items</option></select></div><div className="filter-select-wrap"><select aria-label="Filter by category" value={category} onChange={e => setCategory(e.target.value)}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div></div>
      <div className="listing-summary"><span>{loading ? 'Searching listings…' : `${items.length} ${items.length === 1 ? 'listing' : 'listings'} to explore`}</span><span className="listing-live"><i/> Updated as students post</span></div>
      {error && <div className="alert alert-error">{error} <button onClick={() => window.location.reload()}>Try again</button></div>}
      {loading ? <div className="loading-grid">{[1,2,3].map(n => <div className="skeleton-card" key={n}><div/><span/><span/><span/></div>)}</div> : items.length ? <div className="items-grid">{items.map(item => <ItemCard key={item._id} item={item}/>)}</div> : <div className="empty-state"><div className="empty-icon"><PackageSearch size={30}/></div><h3>No listings found</h3><p>Try a different keyword or remove some filters. The item you're looking for might be posted under another category.</p><button className="button button-secondary" onClick={clearFilters}>Clear all filters</button></div>}
      <div className="community-cta"><div className="cta-icon"><HeartHandshake size={25}/></div><div><h3>Found something that isn't yours?</h3><p>One quick post could make someone's day. Help a classmate get their belongings back.</p></div><Link to={user ? '/report' : '/register'} className="button button-light">Help someone out <ArrowRight size={16}/></Link></div>
    </main>
  </>;
}
