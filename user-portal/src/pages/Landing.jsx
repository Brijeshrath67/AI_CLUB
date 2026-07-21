import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, CreditCard, TrendingUp, Share2, QrCode } from 'lucide-react';

const ThreeHeroModel = lazy(() => import('../components/ThreeHeroModel'));

export default function Landing() {
  const navigate = useNavigate();
  const [threeLoaded, setThreeLoaded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkIsDesktop = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (!desktop) {
        setThreeLoaded(true);
      }
    };
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  useEffect(() => {
    if (isDesktop) {
      // Safety fallback timeout to fade out the preloader after 3.5 seconds anyway
      const timer = setTimeout(() => {
        setThreeLoaded(true);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isDesktop]);

  return (
    <div className="bg-[#050508] text-white overflow-x-hidden">

      {/* ─── FULL SCREEN SITE PRELOADER ─── */}
      <div 
        className={`fixed inset-0 bg-[#050508] z-[999] flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
          threeLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          {/* Pulsing Logo badge */}
          <div className="w-20 h-20 rounded-2xl bg-black border border-white/10 flex items-center justify-center shadow-2xl shadow-white/10 animate-pulse">
            <img src="/logo.png" alt="Fundo Logo" className="w-14 h-14 object-contain" />
          </div>
          {/* Loading status */}
          <div className="flex flex-col items-center gap-1.5 mt-2">
            <span className="text-[13px] font-bold tracking-widest text-white/90 uppercase">Fundo</span>
            <div className="flex items-center gap-1.5 text-[11px] text-white/40 tracking-wider">
              <span>Initializing 3D experience</span>
              <span className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-white/40 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1 h-1 rounded-full bg-white/40 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1 h-1 rounded-full bg-white/40 animate-bounce" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── HERO ─── */}
      <section className="relative w-full h-screen flex overflow-hidden">

        {/* LEFT — vertically centered text */}
        <div className="relative z-20 w-full lg:w-1/2 flex flex-col justify-center px-12 lg:px-20 shrink-0">


          <h1 className="text-[48px] md:text-[58px] font-bold tracking-tight leading-[1.1] mb-6 select-none">
            <span className="text-white">Organize.</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c084fc] via-[#a78bff] to-[#60a5fa] font-extrabold filter drop-shadow-[0_0_8px_rgba(168,85,247,0.2)]">
              Collect.
            </span><br />
            <span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.25)', textStroke: '1px rgba(255,255,255,0.25)' }}>
              Thrive.
            </span>
          </h1>

          <p className="text-[16px] text-white/50 leading-relaxed mb-10 max-w-[420px] font-light">
            Make payments to events, track every rupee, and manage your history — all from one place.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/events"
              className="group flex items-center gap-2.5 bg-[#7c5cfc] hover:bg-[#6b4ef0] text-white px-7 py-3.5 rounded-full font-semibold text-[14px] transition-all shadow-[0_0_28px_rgba(124,92,252,0.4)]">
              Make Payment to Event <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <button onClick={() => navigate('/join')} className="flex items-center gap-2.5 bg-white/[0.06] border border-white/[0.12] text-white/75 px-7 py-3.5 rounded-full font-semibold text-[14px] hover:bg-white/[0.09] hover:text-white transition-all cursor-pointer">
              <QrCode size={14} className="text-white/40" /> Join with Code
            </button>
          </div>
        </div>

        {/* RIGHT — Three.js 3D canvas, vertically centered */}
        <div className="hidden lg:flex relative w-1/2 h-full items-center justify-center overflow-hidden">
          {isDesktop && (
            <Suspense fallback={null}>
              <ThreeHeroModel onLoad={() => setThreeLoaded(true)} />
            </Suspense>
          )}

          {/* Left fade — wider to cleanly separate from text column */}
          <div className="absolute inset-y-0 left-0 w-52 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to right, #050508 30%, transparent)' }} />
          {/* Top fade */}
          <div className="absolute top-0 left-0 w-full h-24 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, #050508, transparent)' }} />
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 w-full h-32 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to top, #050508, transparent)' }} />
        </div>
      </section>

      {/* ─── TRUST BAR ─── */}
      <section className="py-10 px-6 border-y border-white/[0.04]">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-[11px] text-white/20 mb-5 font-medium tracking-widest uppercase">Trusted by students & organizers from</p>
          <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
            {['IIT Bombay', 'Delhi University', 'BITS Pilani', 'VIT Chennai', 'SRM University', 'Manipal Institute', 'CUSAT'].map((u, i) => (
              <span key={i} className="text-[13px] font-semibold text-white/25 hover:text-white/50 transition-colors tracking-wide cursor-default">{u}</span>
            ))}
            <span className="text-[12px] text-white/15 italic">and many more...</span>
          </div>
        </div>
      </section>

      {/* ─── WHY FUNDO ─── */}
      <section className="py-28 px-6 lg:px-12 max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <p className="text-[11px] tracking-widest uppercase text-[#7c5cfc] font-semibold mb-4">Why Fundo</p>
          <h2 className="text-[38px] md:text-[48px] font-bold tracking-tight leading-tight mb-4">
            Why choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a78bff] to-[#7c5cfc]">Fundo</span>?
          </h2>
          <p className="text-[16px] text-white/35 max-w-lg mx-auto leading-relaxed">
            Built for college organizers who want to move fast without complex tools.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: <Calendar size={22} />, title: 'Event Payments', desc: 'Select any event and pay securely in seconds.', accent: '#7c5cfc', bg: 'rgba(124,92,252,0.08)' },
            { icon: <CreditCard size={22} />, title: 'Secure Payments', desc: 'UPI, cards, netbanking — powered by Razorpay.', accent: '#10b981', bg: 'rgba(16,185,129,0.08)' },
            { icon: <TrendingUp size={22} />, title: 'Real-time Tracking', desc: 'Track registrations and revenue as they happen.', accent: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
            { icon: <Share2 size={22} />, title: 'Share & Grow', desc: 'Send a link or code. Attendees pay in one tap.', accent: '#ec4899', bg: 'rgba(236,72,153,0.08)' },
          ].map((f, i) => (
            <div key={i} className="group relative rounded-2xl p-7 border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 overflow-hidden cursor-default"
              style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at 30% 30%, ${f.accent}14 0%, transparent 70%)` }} />
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: f.bg, color: f.accent }}>{f.icon}</div>
              <h3 className="text-[15px] font-semibold text-white mb-2.5">{f.title}</h3>
              <p className="text-[13px] text-white/35 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="py-16 px-6 lg:px-12 pb-24">
        <div className="max-w-[1100px] mx-auto relative overflow-hidden rounded-3xl border border-[#7c5cfc]/20 p-12 md:p-16 text-center"
          style={{ background: 'linear-gradient(135deg, #0e0a1f 0%, #16103a 50%, #0e0a1f 100%)' }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#7c5cfc]/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-[34px] md:text-[44px] font-bold tracking-tight mb-4">Ready to make a payment?</h2>
            <p className="text-[16px] text-white/40 mb-10 max-w-md mx-auto leading-relaxed">Join thousands of users who trust Fundo for secure event payments.</p>
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
              <Link to="/events" className="group flex items-center gap-2 bg-[#7c5cfc] hover:bg-[#6b4ef0] text-white px-8 py-3.5 rounded-full font-semibold text-[14px] transition-all shadow-[0_4px_24px_rgba(124,92,252,0.4)]">
                Make Payment to Event <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <button onClick={() => navigate('/join')} className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.12] text-white/75 px-8 py-3.5 rounded-full font-semibold text-[14px] hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer">
                <QrCode size={15} /> Join with Code
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
