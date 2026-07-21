import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, CheckCircle2, Calendar, MapPin, Bell } from 'lucide-react';

const getEventStyles = (event) => {
  if (event.image) {
    return {
      imagePattern: 'none',
      imageGradient: 'from-transparent to-[#0D0B1A]',
      backgroundImage: `url(${event.image})`
    };
  }
  // Fallback beautiful gradients
  const gradients = [
    { from: '#8155ff', to: '#0D0B1A', pattern: 'radial-gradient(circle at 50% 50%, rgba(129, 85, 255, 0.2) 0%, transparent 70%)' },
    { from: '#10b981', to: '#0D0B1A', pattern: 'linear-gradient(45deg, rgba(16, 185, 129, 0.1) 25%, transparent 25%, transparent 75%, rgba(16, 185, 129, 0.1) 75%, rgba(16, 185, 129, 0.1))' },
    { from: '#f59e0b', to: '#0D0B1A', pattern: 'radial-gradient(circle at 20% 80%, rgba(245, 158, 11, 0.2) 0%, transparent 50%)' },
    { from: '#ec4899', to: '#0D0B1A', pattern: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(236, 72, 153, 0.1) 10px, rgba(236, 72, 153, 0.1) 20px)' },
    { from: '#ef4444', to: '#0D0B1A', pattern: 'radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.2) 0%, transparent 50%)' },
    { from: '#3b82f6', to: '#0D0B1A', pattern: 'linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px)' }
  ];
  const index = Math.abs((event.id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % gradients.length;
  return {
    imagePattern: gradients[index].pattern,
    imageGradient: `from-[${gradients[index].from}]/30 to-[#0D0B1A]`,
    backgroundImage: 'none'
  };
};

const formatDate = (dateString) => {
  if (!dateString) return 'TBA';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function EventsList() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/events`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.event) {
          setEvents(data.event);
        }
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = events.filter((event) => {
    return (
      (event.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.location || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col justify-center items-center bg-[#050508] relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px] pointer-events-none" />
        
        {/* Spinner */}
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-purple-300/80 text-sm font-medium tracking-wide animate-pulse">Loading public events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12 min-h-screen">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Public Events</h1>
          <p className="text-white/50 text-sm">Discover and register for awesome events happening around you.</p>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          <div className="relative">
            <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/10 transition-colors">
              <Bell size={18} />
            </button>
            <span className="absolute top-0 right-0 w-4 h-4 bg-[#8155ff] text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-[#0D0B1A]">0</span>
          </div>
        </div>
      </div>

      {/* Search and Sort Row */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="flex-1 flex items-center bg-[#120c2b]/80 border border-white/10 rounded-xl px-4 py-3 focus-within:border-[#8155ff]/50 transition-colors">
          <Search className="text-white/40 mr-3 shrink-0" size={18} />
          <input 
            type="text" 
            placeholder="Search events, organizers or locations..." 
            className="bg-transparent border-none text-white text-sm outline-none placeholder:text-white/40 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-4 shrink-0">
          <button className="flex items-center justify-between w-[160px] bg-[#120c2b]/80 border border-white/10 text-white/80 px-4 py-3 rounded-xl text-sm hover:bg-white/5 transition-colors">
            <span>Sort by: Latest</span>
            <ChevronDown size={16} className="text-white/40" />
          </button>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl bg-[#120c2b]/20">
          <Calendar size={48} className="text-white/20 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-1">No Public Events Found</h3>
          <p className="text-white/40 text-sm max-w-sm text-center">We couldn't find any public events matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredEvents.map((event) => {
            const styles = getEventStyles(event);
            const joinedUsers = event._count?.transactions || 0;
            const progress = Math.min(100, Math.round((joinedUsers / event.capacity) * 100));
            const hasImage = event.image !== '';
            
            return (
              <div 
                key={event.id}
                onClick={() => navigate(`/events/${event.id}`)}
                className="bg-[#120c2b]/60 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden hover:border-[#8155ff]/30 transition-all cursor-pointer group flex flex-col"
              >
                {/* Card Image Area */}
                <div 
                  className={`h-40 w-full relative bg-cover bg-center bg-no-repeat bg-gradient-to-t ${styles.imageGradient}`}
                  style={{ 
                    backgroundImage: hasImage ? `url(${event.image})` : styles.imagePattern, 
                    backgroundSize: hasImage ? 'cover' : '20px 20px' 
                  }}
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
                  
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    <span className="bg-[#8155ff] text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm tracking-wide uppercase">
                      {event.price === 0 ? 'Free' : `₹${event.price}`}
                    </span>
                  </div>
                </div>

                {/* Card Content Area */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#8155ff] transition-colors">{event.title}</h3>
                  <p className="text-white/50 text-[13px] mb-3 line-clamp-2">{event.description}</p>
                  
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-[#8155ff] text-white flex items-center justify-center font-bold text-[8px] overflow-hidden select-none shrink-0 border border-white/10">
                      {event.user?.avatar ? (
                        <img 
                          src={event.user.avatar} 
                          alt="Avatar" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        event.user?.name ? event.user.name.charAt(0).toUpperCase() : 'O'
                      )}
                    </div>
                    <span className="text-white/60 text-xs font-medium">by {event.user?.name || 'Organizer'}</span>
                    <CheckCircle2 size={12} className="text-[#8155ff] fill-[#8155ff]/20" />
                  </div>

                  {/* Progress Section */}
                  <div className="mt-auto">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-white font-bold text-sm">
                        {joinedUsers} <span className="text-white/40 text-xs font-normal">joined</span>
                      </span>
                      <span className="text-white/80 font-bold text-xs">{progress}%</span>
                    </div>
                    
                    <div className="w-full h-1.5 bg-white/10 rounded-full mb-2 overflow-hidden">
                      <div 
                        className="h-full bg-[#8155ff] rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    
                    <p className="text-white/40 text-[11px]">of {event.capacity} spots</p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="border-t border-white/5 p-4 flex justify-between items-center bg-black/20">
                  <div className="flex items-center gap-1.5 text-white/50 text-[11px] font-medium">
                    <MapPin size={12} /> {event.location || 'Online'}
                  </div>
                  <div className="flex items-center gap-1.5 text-white/50 text-[11px] font-medium">
                    <Calendar size={12} /> {formatDate(event.date)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
