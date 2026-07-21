import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Key, TrendingUp, Download, Sparkles, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThreeHeroModel from '../components/ThreeHeroModel';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="bg-[#050508] text-white overflow-x-hidden font-sans relative min-h-screen">
      
      {/* ─── HERO & ACTIONS ─── */}
      <section className="relative w-full h-screen flex overflow-hidden">
        
        {/* Ambient background glows */}
        <div className="absolute top-1/4 right-10 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[130px] pointer-events-none -z-10" />
        <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        {/* LEFT — Vertically Centered Text */}
        <div className="relative z-20 w-full lg:w-1/2 flex flex-col justify-center px-12 lg:px-20 shrink-0 text-left py-12 lg:py-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-6 w-fit backdrop-blur-sm">
            <Sparkles size={12} className="animate-pulse" />
            <span>Organiser Workspace</span>
          </div>

          <h1 className="text-[42px] sm:text-[52px] md:text-[60px] font-bold tracking-tight leading-[1.08] mb-6 select-none">
            <span className="text-white">Create.</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c084fc] via-[#a78bff] to-[#60a5fa] font-extrabold filter drop-shadow-[0_0_8px_rgba(168,85,247,0.15)]">
              Organise.
            </span><br />
            <span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.22)', textStroke: '1px rgba(255,255,255,0.22)' }}>
              Empower.
            </span>
          </h1>

          <p className="text-[15px] sm:text-[16px] text-white/50 leading-relaxed mb-10 max-w-[440px] font-light">
            Configure ticketing pricing models, coordinate private verification entries, and access transaction ledgers instantly.
          </p>

          <div className="flex flex-wrap items-center gap-3.5">
            {user ? (
              <>
                <Link to="/events"
                  className="group flex items-center gap-2.5 bg-[#7c5cfc] hover:bg-[#6b4ef0] text-white px-7 py-3.5 rounded-full font-semibold text-[14px] transition-all shadow-[0_0_28px_rgba(124,92,252,0.35)]">
                  Go to Workspace <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link to="/events/create"
                  className="flex items-center gap-2.5 bg-white/[0.05] border border-white/[0.12] text-white/75 px-7 py-3.5 rounded-full font-semibold text-[14px] hover:bg-white/[0.08] hover:text-white transition-all">
                  Create Event
                </Link>
              </>
            ) : (
              <>
                <Link to="/register"
                  className="group flex items-center gap-2.5 bg-[#7c5cfc] hover:bg-[#6b4ef0] text-white px-7 py-3.5 rounded-full font-semibold text-[14px] transition-all shadow-[0_0_28px_rgba(124,92,252,0.35)]">
                  Register as Organiser <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link to="/login"
                  className="flex items-center gap-2.5 bg-white/[0.05] border border-white/[0.12] text-white/75 px-7 py-3.5 rounded-full font-semibold text-[14px] hover:bg-white/[0.08] hover:text-white transition-all">
                  Login to Portal
                </Link>
              </>
            )}
          </div>
        </div>

        {/* RIGHT — Three.js 3D Canvas */}
        <div className="hidden lg:flex relative w-1/2 h-full items-center justify-center overflow-hidden">
          <ThreeHeroModel />

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
      <section className="py-10 px-6 border-y border-white/[0.04] bg-black/10 relative z-10">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-[11px] text-white/20 mb-5 font-medium tracking-widest uppercase">Trusted by student bodies & event creators from</p>
          <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
            {['IIT Bombay', 'Delhi University', 'BITS Pilani', 'VIT Chennai', 'SRM University', 'Manipal Institute', 'CUSAT'].map((u, i) => (
              <span key={i} className="text-[13px] font-semibold text-white/25 hover:text-white/40 transition-colors tracking-wide cursor-default">{u}</span>
            ))}
            <span className="text-[12px] text-white/15 italic">and many more...</span>
          </div>
        </div>
      </section>

      {/* ─── WHY FUNDO ─── */}
      <section className="py-28 px-6 lg:px-12 max-w-[1200px] mx-auto relative z-10">
        <div className="text-center mb-16">
          <p className="text-[11px] tracking-widest uppercase text-[#7c5cfc] font-semibold mb-4">Organiser Experience</p>
          <h2 className="text-[38px] md:text-[48px] font-bold tracking-tight leading-tight mb-4">
            Designed for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a78bff] to-[#7c5cfc]">Streamlined</span> Operations
          </h2>
          <p className="text-[15px] sm:text-[16px] text-white/35 max-w-lg mx-auto leading-relaxed">
            Everything you need to configure ticketing, verify payments, and download checkins from one dashboard.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: <Calendar size={22} />, title: 'Flexible Pricing', desc: 'Set public or private tickets with instant checkouts.', accent: '#7c5cfc', bg: 'rgba(124,92,252,0.08)' },
            { icon: <Key size={22} />, title: 'Private Invites', desc: 'Secure events with unique invite codes for verified entry.', accent: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
            { icon: <TrendingUp size={22} />, title: 'Real-time Stats', desc: 'Watch transaction counts, prices, and revenue updates.', accent: '#10b981', bg: 'rgba(16,185,129,0.08)' },
            { icon: <Download size={22} />, title: 'CSV Ledger Exports', desc: 'Export student lists, email addresses, and registration dates.', accent: '#ec4899', bg: 'rgba(236,72,153,0.08)' },
          ].map((f, i) => (
            <div key={i} className="group relative rounded-2xl p-7 border border-white/[0.06] hover:border-[#8155ff]/30 transition-all duration-300 overflow-hidden cursor-default bg-white/[0.01]">
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
      <section className="py-16 px-6 lg:px-12 pb-24 relative z-10">
        <div className="max-w-[1100px] mx-auto relative overflow-hidden rounded-3xl border border-[#7c5cfc]/20 p-12 md:p-16 text-center"
          style={{ background: 'linear-gradient(135deg, #0e0a1f 0%, #16103a 50%, #0e0a1f 100%)' }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#7c5cfc]/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-[34px] md:text-[44px] font-bold tracking-tight mb-4">Ready to launch your event?</h2>
            <p className="text-[16px] text-white/40 mb-10 max-w-md mx-auto leading-relaxed">Join clubs and departments across campus leveraging Fundo for easy payments.</p>
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
              {user ? (
                <Link to="/events/create" className="group flex items-center gap-2 bg-[#7c5cfc] hover:bg-[#6b4ef0] text-white px-8 py-3.5 rounded-full font-semibold text-[14px] transition-all shadow-[0_4px_24px_rgba(124,92,252,0.4)]">
                  Launch Event Now <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ) : (
                <Link to="/register" className="group flex items-center gap-2 bg-[#7c5cfc] hover:bg-[#6b4ef0] text-white px-8 py-3.5 rounded-full font-semibold text-[14px] transition-all shadow-[0_4px_24px_rgba(124,92,252,0.4)]">
                  Create Organiser Account <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
