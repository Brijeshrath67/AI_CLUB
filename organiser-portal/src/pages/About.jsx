import React from 'react';
import { ExternalLink, Mail } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen pb-20">
      
      {/* 1. Developer Details Section */}
      <section className="pt-10 pb-16 px-6 max-w-[1000px] mx-auto text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6 backdrop-blur-sm">
          About The Creator
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
          Meet the mind behind <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8155ff] to-[#a88bff]">Fundo</span>
        </h1>
        
        <div className="bg-gradient-to-br from-[#1c133a]/50 to-[#0e0a1f]/50 backdrop-blur-md border border-white/10 rounded-[32px] p-8 md:p-12 mt-12 flex flex-col md:flex-row items-center gap-10 hover:border-[#8155ff]/30 transition-colors text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-full bg-[#8155ff]/10 blur-[80px] pointer-events-none"></div>
          
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-[#8155ff] to-[#4520b8] p-1 shrink-0 shadow-[0_0_30px_rgba(129,85,255,0.4)] z-10">
            <div className="w-full h-full rounded-full bg-[#0D0B1A] flex items-center justify-center border-4 border-[#0D0B1A] overflow-hidden">
              <span className="text-5xl font-bold text-white">MR</span>
            </div>
          </div>
          
          <div className="z-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">Muhammed Rahil Nazar</h2>
            <p className="text-[#8155ff] font-medium mb-6">Full Stack Developer</p>
            <p className="text-white/60 leading-relaxed mb-8 text-sm md:text-base">
              I built Fundo to simplify the way we manage events and handle payments. My focus is on creating a seamless, robust, and beautiful experience that helps organizers focus on their audience rather than administrative headaches.
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <a 
                href="https://www.linkedin.com/in/muhammed-rahil-nazar-ab9393316/" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 bg-[#0A66C2] hover:bg-[#004182] text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-[#0A66C2]/20"
              >
                <ExternalLink size={18} /> Connect on LinkedIn
              </a>
              <a 
                href="https://x.com/ralu_rahil" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 bg-black hover:bg-black/80 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-black/50"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[18px] h-[18px] fill-current">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                </svg>
                Follow on X
              </a>
              <a 
                href="mailto:fundoooooo12@gmail.com" 
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                <Mail size={18} /> Email Me
              </a>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
