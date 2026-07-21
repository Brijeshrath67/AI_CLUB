import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getToken } from '../api/tokens.js';

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

export default function PrivateInvite() {
  const { token: eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchEventDetails = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/events/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.event) {
          setEvent(data.event);
        }
      }
    } catch (err) {
      console.error('Failed to fetch event details for invite:', err);
    }
  }, [eventId]);

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
          const hasJoined = data.transaction.some(
            (tx) => tx.eventId === eventId && tx.status === 'SUCCESS'
          );
          if (hasJoined) {
            setIsRegistered(true);
          }
        }
      }
    } catch (err) {
      console.error('Failed to check registration status:', err);
    }
  }, [eventId]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchEventDetails();
      await checkRegistrationStatus();
      setIsLoading(false);
    };
    init();
  }, [fetchEventDetails, checkRegistrationStatus]);

  const handleRegister = async () => {
    const token = getToken();
    if (!token || !user) {
      addToast('Please login to register for this event.', 'error');
      navigate('/login');
      return;
    }

    setIsProcessing(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        addToast('Failed to load Razorpay payment SDK.', 'error');
        setIsProcessing(false);
        return;
      }

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/transactions/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ eventId })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        addToast(data.error || 'Failed to initialize booking.', 'error');
        setIsProcessing(false);
        return;
      }

      const { order } = data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_your_key',
        amount: order.amount,
        currency: order.currency,
        name: 'ML Hive',
        description: event.title,
        order_id: order.id,
        handler: async function (response) {
          try {
            setIsProcessing(true);
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
          color: '#f59e0b'
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-600/20 rounded-full blur-[150px] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-amber-300/80 text-sm font-medium tracking-wide animate-pulse">Loading invite details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#050508] px-6 py-24">
        <h2 className="text-2xl font-bold text-white mb-2">Invalid Invite</h2>
        <p className="text-white/40 mb-6">The invite code is invalid or has expired.</p>
        <button onClick={() => navigate('/events')} className="bg-[#8155ff] hover:bg-[#6035f5] text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
          Browse Events
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24 relative bg-[#050508]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[150px] -z-10 pointer-events-none" />

      <div className="w-full max-w-2xl bg-black/40 backdrop-blur-2xl border border-white/5 border-l-amber-500/20 border-t-amber-500/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] rounded-[2rem] overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-black/40 pointer-events-none" />
        
        {event.image && (
          <div className="w-full h-48 bg-cover bg-center" style={{ backgroundImage: `url(${event.image})` }} />
        )}

        <div className="p-8 md:p-12 relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-md text-[10px] font-bold tracking-widest uppercase">
              {event.type} Invite
            </span>
          </div>

          <h1 className="text-3xl font-medium text-white mb-4">{event.title}</h1>
          <p className="text-white/60 leading-relaxed mb-10 text-sm">
            {event.description}
          </p>

          <div className="grid grid-cols-2 gap-6 mb-10 pb-10 border-b border-white/10">
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">Date</p>
              <p className="text-sm font-medium text-white/90">{formatDate(event.date)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">Organiser</p>
              <p className="text-sm font-medium text-white/90">{event.user?.name || 'Organizer'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">Capacity</p>
              <p className="text-sm font-medium text-white/90">{event.capacity} spots total</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">Price</p>
              <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                {event.price === 0 ? 'Free' : `₹${event.price}`}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <p className="text-[10px] text-white/40 uppercase tracking-widest">
              Code: <span className="font-mono bg-black/40 px-2 py-1 rounded text-white/60 border border-white/5">{eventId}</span>
            </p>
            
            {isRegistered ? (
              <div className="w-full sm:w-auto text-center bg-green-500/10 text-green-400 border border-green-500/20 px-6 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Registered!
              </div>
            ) : (
              <button 
                disabled={isProcessing}
                onClick={handleRegister}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-3.5 rounded-xl font-semibold text-xs transition-opacity shadow-lg shadow-amber-500/20 border border-white/10 hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  event.price === 0 ? 'Join Event' : 'Pay & Join Event'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
