import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEventRegistrations } from '../utils/mockData';
import { Calendar, Users, PlusCircle, Search, Filter, Key, Globe, Eye } from 'lucide-react';

export default function Events() {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, PUBLIC, PRIVATE

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/events/my`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          setEvents(data.events || []);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchEvents();
    }
  }, [token]);

  const filteredEvents = events.filter(evt => {
    const matchesSearch = evt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          evt.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'ALL' || evt.type === filterType;

    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050508]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#8155ff] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-xs font-sans">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white px-6 md:px-12 py-10 font-sans">
      <div className="max-w-[1200px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Events Management</h1>
            <p className="text-sm text-white/50">Create, manage and distribute tickets for your events.</p>
          </div>
          <Link
            to="/events/create"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#8155ff] to-[#6035f5] hover:opacity-90 text-white px-5 py-3 rounded-2xl font-bold text-[13px] shadow-lg shadow-purple-500/20 transition-all w-fit cursor-pointer"
          >
            <PlusCircle size={16} /> Create Event
          </Link>
        </div>

        {/* Filters and Search */}
        {events.length > 0 && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/[0.02] border border-white/[0.04] p-4 rounded-2xl">
            {/* Search Input */}
            <div className="w-full md:w-80 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={16} />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-[#8155ff] transition-colors"
              />
            </div>

            {/* Type Filters */}
            <div className="flex items-center gap-2 bg-black/40 border border-white/10 p-1 rounded-xl w-full md:w-auto">
              {['ALL', 'PUBLIC', 'PRIVATE'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`flex-1 md:flex-none text-xs font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer ${
                    filterType === type 
                      ? 'bg-white/10 text-white border border-white/10' 
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-3xl py-20 px-6 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center mb-4 text-white/35">
              <Calendar size={28} />
            </div>
            <h3 className="text-lg font-bold mb-1">Get Started by Creating an Event</h3>
            <p className="text-xs text-white/45 max-w-sm mb-6 leading-relaxed">
              Create your department event or club trip to start collecting registrations and UPI/card payments.
            </p>
            <Link
              to="/events/create"
              className="bg-white text-black font-semibold text-xs px-6 py-3 rounded-full hover:bg-white/95 transition-all"
            >
              Create Your First Event
            </Link>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-20 text-center text-white/40 text-sm">
            No events match your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((evt) => {
              const regs = getEventRegistrations(evt);
              return (
                <div 
                  key={evt.id} 
                  className="bg-white/[0.02] border border-white/[0.05] rounded-3xl overflow-hidden hover:border-[#8155ff]/30 hover:bg-white/[0.03] transition-all flex flex-col justify-between"
                >
                  <div className="relative h-44 w-full bg-black/50 border-b border-white/[0.04] overflow-hidden">
                    {evt.image ? (
                      <img 
                        src={evt.image} 
                        alt={evt.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1a1033] to-[#0D0B1A] flex items-center justify-center">
                        <Calendar className="text-white/20" size={32} />
                      </div>
                    )}
                    
                    {/* Badge */}
                    <span className={`absolute top-4 right-4 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                      evt.type === 'PRIVATE' 
                        ? 'bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/20' 
                        : 'bg-[#8155ff]/15 text-[#8155ff] border border-[#8155ff]/20'
                    }`}>
                      {evt.type === 'PRIVATE' ? <Key size={10} /> : <Globe size={10} />}
                      {evt.type}
                    </span>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-white line-clamp-1">{evt.title}</h3>
                      <p className="text-xs text-white/50 line-clamp-3 leading-relaxed">{evt.description}</p>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-white/[0.04]">
                      <div className="flex items-center justify-between text-xs text-white/60">
                        <span className="font-medium">Ticket Price:</span>
                        <span className="font-bold text-white">₹{evt.price}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-white/60">
                        <span className="font-medium">Capacity / Registrations:</span>
                        <span className="font-bold text-white">{regs.length} / {evt.capacity}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-white/60">
                        <span className="font-medium">Date:</span>
                        <span className="font-bold text-white">{new Date(evt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      {evt.type === 'PRIVATE' && evt.code && (
                        <div className="flex items-center justify-between text-xs text-[#f59e0b]">
                          <span className="font-medium">Invite Code:</span>
                          <span className="font-mono font-bold tracking-wider">{evt.code}</span>
                        </div>
                      )}
                    </div>

                    <Link
                      to={`/events/${evt.id}`}
                      className="w-full bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-[#8155ff]/40 text-white py-2.5 rounded-2xl text-center text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Eye size={13} /> View & Manage
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
