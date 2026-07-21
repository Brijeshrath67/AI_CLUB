import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { getToken } from '../api/tokens.js';
import { ArrowLeft, RefreshCw, Ticket } from 'lucide-react';

export default function JoinWithCode() {
  const [eventCode, setEventCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!eventCode.trim()) {
      addToast('Please enter an event code.', 'error');
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/events/${encodeURIComponent(eventCode.trim())}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      const data = await res.json();

      if (res.status === 404 || res.status === 409) {
        addToast(data.message || data.error || 'Event not found or already joined.', 'error');
      } else if (res.ok) {
        addToast(data.message || 'Successfully joined the event!', 'success');
        // Redirect to the event details page on success
        const eventId = data.eventId || data.event?.id || data.id;
        if (eventId) {
          navigate(`/events/${eventId}`);
        } else {
          navigate('/events');
        }
      } else {
        addToast(data.message || data.error || 'Failed to join event.', 'error');
      }
    } catch (err) {
      console.error('Error joining event:', err);
      addToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24 relative bg-[#050508]">
      {/* Glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] -z-10 pointer-events-none" />

      <div className="w-full max-w-md bg-black/40 backdrop-blur-2xl border border-white/5 border-l-purple-500/20 border-t-purple-500/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] rounded-[2rem] overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-black/40 pointer-events-none" />

        <div className="p-8 md:p-10 relative z-10">
          {/* Back button */}
          <button 
            onClick={() => navigate('/events')} 
            className="group flex items-center gap-1.5 text-xs text-white/50 hover:text-white/90 transition-colors mb-8 cursor-pointer bg-transparent border-none p-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to events
          </button>

          {/* Icon and tag */}
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-[#6035f5] flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded-md text-[10px] font-bold tracking-widest uppercase">
              Join with code
            </span>
          </div>

          <h1 className="text-2xl font-semibold text-white mb-2">Enter Event Code</h1>
          <p className="text-white/60 leading-relaxed mb-8 text-sm">
            Please enter the unique code for the event you would like to join.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 relative group">
              <label htmlFor="event-code" className="text-xs font-medium text-white/90">Event Code</label>
              <div className="relative">
                <Ticket className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-purple-400 transition-colors" />
                <input
                  id="event-code"
                  type="text"
                  placeholder="e.g. EVT-123456"
                  className="w-full pl-10 pr-4 h-12 rounded-xl bg-black/20 border border-white/5 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500 focus:bg-black/40 transition-all text-sm font-mono tracking-wider"
                  value={eventCode}
                  onChange={(e) => setEventCode(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-[#8155ff] to-[#6035f5] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 border border-white/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Joining Event...
                </>
              ) : (
                'Join Event'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
