import React from 'react';
import { ShieldCheck, Zap, Globe, Smartphone, BarChart3, Lock, Users, CreditCard, Server, Database, Code, CheckCircle2 } from 'lucide-react';

export default function Features() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-6 font-sans">
      <div className="max-w-[1000px] mx-auto space-y-24">
        
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#8155ff]/10 border border-[#8155ff]/20 text-[#8155ff] text-sm font-medium backdrop-blur-sm">
            The Fundo Vision
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Collecting money for college events is <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">broken</span>.<br/>
            Fundo fixes this <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8155ff] to-[#a88bff]">entirely.</span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            A platform where students make payments to events online — and everything is tracked automatically.
          </p>
        </div>

        {/* The Problem */}
        <div className="bg-gradient-to-br from-[#1c133a]/50 to-[#0e0a1f]/50 border border-white/10 rounded-[32px] p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-full bg-red-500/5 blur-[80px] pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 text-sm">🛑</span>
                The Problem
              </h2>
              <p className="text-white/60 leading-relaxed text-lg">
                Someone wants to organise a trip or an event. They ask 20 people for money. Some pay in cash, some say "I'll pay later", some forget. The organiser has no list, no record, no idea who paid ₹500 and who paid nothing. At the end, it's a mess of screenshots and WhatsApp messages.
              </p>
            </div>
          </div>
        </div>

        {/* Two Types of Events */}
        <div className="space-y-10">
          <h2 className="text-3xl font-bold text-white text-center">🎟️ The Two Types of Events</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-[24px] p-8 hover:border-[#8155ff]/30 transition-colors">
              <Globe className="text-[#8155ff] w-12 h-12 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Public Event</h3>
              <p className="text-white/60 leading-relaxed mb-6">Visible to everyone on the main dashboard when they open Fundo. Anyone from the campus can see it, click on it, and pay to register.</p>
              <div className="bg-[#8155ff]/10 text-[#8155ff] px-4 py-2 rounded-lg text-sm font-medium inline-block">
                Best for: College fests, competitions, seminars
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-[24px] p-8 hover:border-[#f59e0b]/30 transition-colors">
              <Lock className="text-[#f59e0b] w-12 h-12 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Private Event</h3>
              <p className="text-white/60 leading-relaxed mb-6">Hidden from the dashboard. The organiser gets a unique link and shares it only with specific people. Only someone with that link can access and pay.</p>
              <div className="bg-[#f59e0b]/10 text-[#f59e0b] px-4 py-2 rounded-lg text-sm font-medium inline-block">
                Best for: Club trips, department outings
              </div>
            </div>
          </div>
        </div>

        {/* How Payment Works */}
        <div className="space-y-10">
          <h2 className="text-3xl font-bold text-white text-center">💸 How a Payment Works</h2>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
            
            {[
              { step: 1, title: 'Student opens the event', desc: 'Either from the dashboard (public) or from the link shared by the organiser (private).' },
              { step: 2, title: 'Student clicks Pay', desc: 'Razorpay checkout window opens. They can pay via UPI, card, net banking, anything.' },
              { step: 3, title: 'Payment goes to Razorpay', desc: 'Razorpay processes the money and sends a secret signal (webhook) to Fundo backend saying "this person paid".' },
              { step: 4, title: 'Fundo verifies the signal', desc: 'Backend checks a secret signature to make sure the signal is genuinely from Razorpay and not a fake. Security layer.' },
              { step: 5, title: 'Record is saved permanently', desc: 'Database now has: who paid, how much, at what time. Permanently. No manual entry needed.' },
              { step: 6, title: 'Dashboard updates live', desc: 'Powered by Socket.io, the moment a payment is confirmed, the organiser sees it appear in real time without refreshing.' },
            ].map((item, i) => (
              <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0D0B1A] bg-[#8155ff] text-white font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_15px_rgba(129,85,255,0.5)] z-10">
                  {item.step}
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors">
                  <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                  <p className="text-sm text-white/60 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
            
          </div>
        </div>

        {/* Who Uses It */}
        <div className="space-y-10">
          <h2 className="text-3xl font-bold text-white text-center">👥 Who Uses It & What They Get</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400"><Users size={24}/></div>
                <div>
                  <h3 className="text-xl font-bold text-white">The Organiser</h3>
                  <p className="text-sm text-white/50">Student club, department, individual</p>
                </div>
              </div>
              <ul className="space-y-4">
                <li className="flex gap-3 text-white/70 text-sm leading-relaxed"><CheckCircle2 className="text-green-500 shrink-0" size={20}/> <span><strong>Live payment dashboard:</strong> A screen that shows every payment as it happens. No refresh needed.</span></li>
                <li className="flex gap-3 text-white/70 text-sm leading-relaxed"><CheckCircle2 className="text-green-500 shrink-0" size={20}/> <span><strong>CSV export:</strong> Download the entire payment list as a spreadsheet. Useful for submitting records.</span></li>
                <li className="flex gap-3 text-white/70 text-sm leading-relaxed"><CheckCircle2 className="text-green-500 shrink-0" size={20}/> <span><strong>Zero manual work:</strong> Organiser never has to chase people for screenshots or manually mark who paid.</span></li>
              </ul>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400"><Smartphone size={24}/></div>
                <div>
                  <h3 className="text-xl font-bold text-white">The Participant</h3>
                  <p className="text-sm text-white/50">Student paying for the event</p>
                </div>
              </div>
              <ul className="space-y-4">
                <li className="flex gap-3 text-white/70 text-sm leading-relaxed"><CheckCircle2 className="text-blue-500 shrink-0" size={20}/> <span><strong>Simple, familiar checkout:</strong> They just click Pay, use UPI or card like any other app. No separate app needed.</span></li>
                <li className="flex gap-3 text-white/70 text-sm leading-relaxed"><CheckCircle2 className="text-blue-500 shrink-0" size={20}/> <span><strong>Proof of payment:</strong> Their payment is recorded in the system instantly. No need to keep a screenshot.</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="space-y-10">
          <h2 className="text-3xl font-bold text-white text-center">🚀 The Tech Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#120c2b] border border-white/5 p-6 rounded-2xl hover:border-[#10b981]/30 transition-colors">
              <Server className="text-[#10b981] mb-4" size={28}/>
              <h4 className="text-lg font-bold text-white mb-4">Backend</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><strong className="text-white/80">Runtime:</strong> Node.js</li>
                <li><strong className="text-white/80">Framework:</strong> Express.js</li>
                <li><strong className="text-white/80">Auth:</strong> JWT & bcrypt</li>
                <li><strong className="text-white/80">Real-time:</strong> Socket.io</li>
                <li><strong className="text-white/80">Queue:</strong> BullMQ</li>
              </ul>
            </div>
            <div className="bg-[#120c2b] border border-white/5 p-6 rounded-2xl hover:border-[#3b82f6]/30 transition-colors">
              <Database className="text-[#3b82f6] mb-4" size={28}/>
              <h4 className="text-lg font-bold text-white mb-4">Data & Payments</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><strong className="text-white/80">Database:</strong> PostgreSQL</li>
                <li><strong className="text-white/80">ORM:</strong> Prisma</li>
                <li><strong className="text-white/80">Caching:</strong> Redis</li>
                <li><strong className="text-white/80">Gateway:</strong> Razorpay</li>
                <li><strong className="text-white/80">Security:</strong> HMAC Webhooks</li>
              </ul>
            </div>
            <div className="bg-[#120c2b] border border-white/5 p-6 rounded-2xl hover:border-[#d946ef]/30 transition-colors">
              <Code className="text-[#d946ef] mb-4" size={28}/>
              <h4 className="text-lg font-bold text-white mb-4">Frontend & Ops</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><strong className="text-white/80">Framework:</strong> React 19 + Vite</li>
                <li><strong className="text-white/80">Styling:</strong> Tailwind CSS</li>
                <li><strong className="text-white/80">Animations:</strong> Framer Motion</li>
                <li><strong className="text-white/80">3D:</strong> Spline</li>
                <li><strong className="text-white/80">Deployment:</strong> Docker</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
