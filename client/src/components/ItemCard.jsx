import { Link } from 'react-router-dom';
import { MapPin, CalendarDays, ArrowUpRight } from 'lucide-react';
export default function ItemCard({ item }) {
  return <article className="item-card">
    <Link to={`/items/${item._id}`} className="item-image-link" aria-label={`View ${item.title}`}>
      {item.imageUrl ? <img className="item-image" src={item.imageUrl} alt={item.title} loading="lazy"/> : <div className="image-placeholder"><span>CB</span><small>PHOTO NOT ADDED</small></div>}
      <span className={`type-badge ${item.type}`}>{item.type === 'lost' ? 'Lost item' : 'Found item'}</span>
    </Link>
    <div className="item-card-body"><div className="item-category">{item.category}</div><Link to={`/items/${item._id}`} className="item-title">{item.title}<ArrowUpRight size={16}/></Link>
      <p className="item-description">{item.description}</p>
      <div className="item-meta"><span><MapPin size={14}/>{item.location}</span><span><CalendarDays size={14}/>{new Date(item.date).toLocaleDateString()}</span></div>
      <div className="item-card-footer"><span className="posted-by">Posted by {item.owner?.name || 'Student'}</span><span className={`status-dot ${item.status}`}>{item.status === 'returned' ? 'Returned' : item.status === 'claim_pending' ? 'Claim pending' : 'Active'}</span></div>
    </div>
  </article>;
}
