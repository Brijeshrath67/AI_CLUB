import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getToken } from '../api/tokens.js';
import { Share2, Brain, Users, Lightbulb } from 'lucide-react';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const formatDate = (dateString) => {
  if (!dateString) return 'TBA';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchEventDetails = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/events/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.event) {
          setEvent(data.event);
        }
      } else {
        addToast('Event not found or failed to load.', 'error');
      }
    } catch (err) {
      console.error('Failed to fetch event details:', err);
      addToast('Failed to load event details.', 'error');
    }
  }, [id, addToast]);

  const checkRegistrationStatus = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/transactions/my`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.transaction)) {
          // Check if there is a successful transaction for this event
          const hasJoined = data.transaction.some(
            (tx) => tx.eventId === id && tx.status === 'SUCCESS'
          );
          if (hasJoined) {
            setIsRegistered(true);
          }
        }
      }
    } catch (err) {
      console.error('Failed to check registration status:', err);
    }
  }, [id]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchEventDetails();
      await checkRegistrationStatus();
      setIsLoading(false);
    };
    init();
  }, [fetchEventDetails, checkRegistrationStatus]);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = event?.title || 'Fundo Event';
    
    // Copy the link to clipboard unconditionally
    try {
      await navigator.clipboard.writeText(shareUrl);
      addToast('Event link copied to clipboard!', 'success');
    } catch (err) {
      console.error('Failed to copy link:', err);
      addToast('Failed to copy event link.', 'error');
    }

    // Try invoking native share drawer
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `Check out this event on Fundo: ${shareTitle}`,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    }
  };

  const handleRegister = async () => {
    const token = getToken();
    if (!token || !user) {
      addToast('Please login to register for this event.', 'error');
      navigate('/login');
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        addToast('Failed to load Razorpay payment SDK.', 'error');
        setIsProcessing(false);
        return;
      }

      // 2. Create payment order on backend
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/transactions/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ eventId: id })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        addToast(data.error || 'Failed to initialize booking.', 'error');
        setIsProcessing(false);
        return;
      }

      const { order } = data;

      // 3. Open Razorpay checkout modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_your_key',
        amount: order.amount,
        currency: order.currency,
        name: 'Fundo',
        description: event.title,
        order_id: order.id,
        handler: async function (response) {
          try {
            setIsProcessing(true);
            // 4. Verify payment with backend
            const verifyRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/transactions/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setIsRegistered(true);
              addToast('Successfully registered for the event!', 'success');
            } else {
              addToast(verifyData.error || 'Payment verification failed.', 'error');
            }
          } catch (err) {
            console.error('Payment verification error:', err);
            addToast('Error verifying payment.', 'error');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user.name || '',
          email: user.email || ''
        },
        theme: {
          color: '#8155ff'
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Registration/Checkout error:', err);
      addToast('An error occurred during registration.', 'error');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col justify-center items-center bg-[#050508] relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px] pointer-events-none" />
        
        {/* Spinner */}
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-purple-300/80 text-sm font-medium tracking-wide animate-pulse">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 min-h-screen flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold text-white mb-2">Event Not Found</h2>
        <p className="text-white/40 mb-6">The event you are looking for does not exist or has been deleted.</p>
        <button onClick={() => navigate('/events')} className="bg-[#8155ff] hover:bg-[#6035f5] text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-24 min-h-screen relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px] -z-10 pointer-events-none" />

      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate('/events')} className="text-white/60 hover:text-white font-medium text-sm transition-colors flex items-center gap-1 cursor-pointer">
          &larr; Back to Events
        </button>
        <button 
          onClick={handleShare}
          className="bg-white/5 border border-white/10 hover:bg-white/10 text-white/85 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg"
        >
          <Share2 size={16} /> Share Event
        </button>
      </div>

      <div className="bg-black/40 backdrop-blur-2xl border border-white/5 border-l-purple-500/20 border-t-purple-500/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] rounded-[2rem] overflow-hidden">
        {/* Cloudinary Event Image Banner or Gradient Fallback */}
        {event.image && (
          <div className="w-full h-64 bg-cover bg-center" style={{ backgroundImage: `url(${event.image})` }} />
        )}

        <div className="bg-white/5 px-8 py-10 border-b border-white/5 relative">
          <span className={`absolute top-6 right-6 px-3 py-1.5 text-[10px] tracking-widest font-bold uppercase rounded-md border ${event.type === 'PUBLIC' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
            {event.type} Event
          </span>
          {event.isHackathon && (
            <span className="absolute top-6 right-36 px-3 py-1.5 text-[10px] tracking-widest font-bold uppercase rounded-md border bg-purple-500/20 text-purple-400 border-purple-500/30 flex items-center gap-1">
              <Brain size={10} /> Hackathon
            </span>
          )}
          <h1 className="text-3xl md:text-4xl font-medium text-white mb-4">{event.title}</h1>
          <p className="text-white/60 leading-relaxed max-w-2xl text-sm">{event.description}</p>
        </div>
        
        <div className="p-8 grid md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">Date</p>
              <p className="text-sm font-medium text-white/90">{formatDate(event.date)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5">Organiser</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-[#8155ff] text-white flex items-center justify-center font-bold text-[10px] overflow-hidden select-none shrink-0 border border-white/10">
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
                <p className="text-sm font-medium text-white/90">{event.user?.name || 'Organizer'}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">Capacity</p>
              <p className="text-sm font-medium text-white/90">{event.capacity} seats</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">Price</p>
              <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-[#8155ff]">
                {event.price === 0 ? 'Free' : `₹${event.price}`}
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center items-center md:items-end md:border-l border-white/10 md:pl-8">
            {event.isHackathon ? (
              <div className="w-full space-y-3">
                <button
                  onClick={() => navigate(`/hackathon/problems/${event.id}`)}
                  className="w-full h-12 bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lightbulb size={16} /> View Problem Statements
                </button>
                <button
                  onClick={() => navigate(`/hackathon/register/${event.id}`)}
                  className="w-full h-12 bg-gradient-to-r from-[#8155ff] to-[#6035f5] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Users size={16} /> Register Your Team
                </button>
                <div className="flex items-center gap-4 text-[10px] text-white/30 justify-center">
                  <span>{event._count?.teams || 0} teams registered</span>
                  <span>&middot;</span>
                  <span>Rs.{event.price} per team</span>
                </div>
              </div>
            ) : isRegistered ? (
              <div className="w-full text-center bg-green-500/10 text-green-400 border border-green-500/20 p-6 rounded-2xl">
                <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-medium text-lg mb-1">You're Registered!</h3>
                <p className="text-xs text-green-400/60">See you at the event.</p>
              </div>
            ) : (
              <div className="w-full">
                <button 
                  disabled={isProcessing}
                  onClick={handleRegister}
                  className="w-full h-12 bg-gradient-to-r from-[#8155ff] to-[#6035f5] text-white rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity shadow-lg shadow-purple-500/20 border border-white/10 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    event.price === 0 ? 'Register Now' : 'Make Payment to Event'
                  )}
                </button>
                <p className="text-center text-[10px] text-white/40 mt-3 tracking-wide">Secure checkout powered by Fundo payments.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
