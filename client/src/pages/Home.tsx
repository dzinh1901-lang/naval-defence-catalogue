/*
 * Home Page — Naval & Defense Systems Intelligence Catalogue
 * Design: Luxury Naval Intelligence — Refined Minimalism
 * Layout: Full-bleed hero, asymmetric editorial grid, horizontal scroll catalogue
 * Colors: White bg, deep navy text, amber accent, brushed steel secondary
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, ChevronRight, Anchor, Shield, Radio, Zap } from "lucide-react";
import NavBar from "@/components/NavBar";
import { navalSystems, CATEGORY_LABELS, type SystemCategory } from "@/lib/navalData";

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663393397427/2sv9VgNDVmgCjc4JvJ9onP/hero-destroyer-9yLqQbmbhyaY2KoGk7drA5.webp";
const SUBMARINE_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663393397427/2sv9VgNDVmgCjc4JvJ9onP/submarine-dive-jyCmsXQxkLwcYuU6oz2DbB.webp";
const RADAR_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663393397427/2sv9VgNDVmgCjc4JvJ9onP/radar-system-2RiCELzpdBWDGFKe5jbDAx.webp";

const categories: { id: SystemCategory; icon: React.ElementType; count: number; desc: string }[] = [
  { id: 'naval-platforms', icon: Anchor, count: 6, desc: 'Carriers, destroyers, frigates, submarines & more' },
  { id: 'weapon-systems', icon: Shield, count: 5, desc: 'Missiles, torpedoes, artillery & CIWS' },
  { id: 'detection-systems', icon: Radio, count: 4, desc: 'Radar, sonar, EW & surveillance platforms' },
  { id: 'propulsion-systems', icon: Zap, count: 4, desc: 'Gas turbine, nuclear, diesel-electric & IEP' },
];

const stats = [
  { value: '19', label: 'System Entries', sub: 'Documented' },
  { value: '4', label: 'Technology', sub: 'Categories' },
  { value: 'AI', label: 'Assisted', sub: 'Analysis' },
  { value: '12+', label: 'Nations', sub: 'Covered' },
];

function useIntersectionObserver(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useIntersectionObserver();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const featuredSystems = navalSystems.slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      {/* ── HERO SECTION ─────────────────────────────────────────── */}
      <section className="relative h-[100svh] min-h-[600px] max-h-[900px] overflow-hidden">
        {/* Background Image with parallax */}
        <div
          className="absolute inset-0"
          style={{ transform: `translateY(${scrollY * 0.3}px)`, willChange: 'transform' }}
        >
          <img
            src={HERO_IMAGE}
            alt="Naval Destroyer at Sea"
            className="w-full h-full object-cover object-center scale-110"
          />
        </div>

        {/* Dark overlay */}
        <div className="hero-overlay absolute inset-0" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end h-full pb-16 md:pb-20 px-6 md:px-12 max-w-[1280px] mx-auto">
          {/* Classification label */}
          <div className="classification-label mb-4 opacity-80">
            ◆ NAVAL INTELLIGENCE CATALOGUE · UNCLASSIFIED · REF-2026
          </div>

          {/* Amber rule */}
          <div className="w-12 h-px bg-[#C8922A] mb-6" />

          {/* Main heading */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold text-white leading-[1.05] tracking-tight mb-6 max-w-3xl">
            Naval & Defense<br />
            <em className="not-italic text-[#C8922A]">Systems</em> Intelligence<br />
            Catalogue
          </h1>

          <p className="font-ui text-sm md:text-base text-white/70 max-w-lg mb-8 leading-relaxed">
            A precision reference platform for maritime defense technologies. Structured specifications, AI-assisted analysis, and interactive system visualizations for naval engineers, analysts, and researchers.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/catalogue"
              className="inline-flex items-center gap-2 bg-[#C8922A] text-white px-6 py-3 font-ui text-sm font-medium tracking-wide hover:bg-[#b07d22] transition-colors"
            >
              Explore Catalogue
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/assistant"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white px-6 py-3 font-ui text-sm font-medium tracking-wide hover:bg-white/20 transition-colors"
            >
              AI Defense Assistant
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 right-6 md:right-12 flex flex-col items-center gap-2 opacity-50">
          <div className="w-px h-12 bg-white/50" />
          <span className="font-mono-data text-[9px] text-white tracking-[0.2em] rotate-90 origin-center mt-2">SCROLL</span>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────── */}
      <section className="border-b border-[#e8e8e8] bg-[#F5F4F2]">
        <div className="max-w-[1280px] mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center md:text-left">
                <div className="font-display text-3xl md:text-4xl font-semibold text-[#0B1C2E] leading-none">
                  {stat.value}
                </div>
                <div className="font-ui text-xs font-medium text-[#0B1C2E] mt-1">{stat.label}</div>
                <div className="font-mono-data text-[9px] tracking-[0.12em] text-[#B0B8C1] uppercase">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORY GRID ────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 max-w-[1280px] mx-auto">
        <AnimatedSection>
          <div className="flex items-center gap-4 mb-2">
            <div className="section-number">01</div>
            <div className="w-8 h-px bg-[#C8922A]" />
            <div className="classification-label">System Categories</div>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-[#0B1C2E] mb-2">
            Technology Domains
          </h2>
          <p className="font-ui text-sm text-[#52627A] mb-10 max-w-lg">
            Four primary domains of maritime defense technology, each documented with full technical specifications and AI-assisted analysis.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <AnimatedSection key={cat.id} delay={i * 80}>
              <Link href={`/catalogue/${cat.id}`}>
                <div className="system-card p-6 group cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 border border-[#e8e8e8] flex items-center justify-center group-hover:border-[#C8922A] transition-colors">
                      <cat.icon size={18} className="text-[#B0B8C1] group-hover:text-[#C8922A] transition-colors" />
                    </div>
                    <div className="font-mono-data text-[10px] text-[#C8922A] tracking-[0.1em]">
                      {String(cat.count).padStart(2, '0')} SYS
                    </div>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-[#0B1C2E] mb-2 leading-tight">
                    {CATEGORY_LABELS[cat.id]}
                  </h3>
                  <p className="font-ui text-xs text-[#52627A] leading-relaxed mb-4">
                    {cat.desc}
                  </p>
                  <div className="flex items-center gap-1 text-[#C8922A] group-hover:gap-2 transition-all">
                    <span className="font-ui text-xs font-medium">View Systems</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ── FEATURED SYSTEMS ─────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-[#F5F4F2]">
        <div className="px-6 max-w-[1280px] mx-auto">
          <AnimatedSection>
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="section-number">02</div>
                  <div className="w-8 h-px bg-[#C8922A]" />
                  <div className="classification-label">Featured Entries</div>
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-[#0B1C2E]">
                  Selected Systems
                </h2>
              </div>
              <Link
                href="/catalogue"
                className="hidden md:flex items-center gap-2 font-ui text-xs font-medium text-[#52627A] hover:text-[#0B1C2E] transition-colors"
              >
                View All <ArrowRight size={14} />
              </Link>
            </div>
          </AnimatedSection>

          {/* Horizontal scroll on mobile, grid on desktop */}
          <div className="catalogue-scroll">
            <div className="flex gap-4 pb-4 md:grid md:grid-cols-2 lg:grid-cols-4">
              {featuredSystems.map((system, i) => (
                <AnimatedSection key={system.id} delay={i * 80}>
                  <Link href={`/system/${system.id}`}>
                    <div className="system-card min-w-[260px] md:min-w-0 overflow-hidden group cursor-pointer">
                      {/* Image */}
                      <div className="relative h-40 overflow-hidden bg-[#e8e8e8]">
                        {system.imageUrl && (
                          <img
                            src={system.imageUrl}
                            alt={system.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1C2E]/60 to-transparent" />
                        <div className="absolute bottom-3 left-3">
                          <div className="system-tag amber">{system.subCategory.replace(/-/g, ' ')}</div>
                        </div>
                      </div>
                      {/* Content */}
                      <div className="p-4">
                        <div className="font-mono-data text-[9px] text-[#B0B8C1] tracking-[0.15em] uppercase mb-1">
                          {system.country}
                        </div>
                        <h3 className="font-display text-lg font-semibold text-[#0B1C2E] leading-tight mb-1">
                          {system.name}
                        </h3>
                        <div className="font-mono-data text-[10px] text-[#C8922A] mb-2">
                          {system.designation}
                        </div>
                        <p className="font-ui text-xs text-[#52627A] leading-relaxed line-clamp-2">
                          {system.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SPLIT EDITORIAL SECTION ──────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left: Image */}
            <AnimatedSection>
              <div className="relative overflow-hidden aspect-[4/3]">
                <img
                  src={SUBMARINE_IMAGE}
                  alt="Nuclear Submarine"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/95 backdrop-blur-sm p-3">
                    <div className="classification-label mb-1">Virginia-class SSN · United States</div>
                    <div className="font-display text-base font-semibold text-[#0B1C2E]">
                      Nuclear Attack Submarine
                    </div>
                    <div className="font-mono-data text-[10px] text-[#52627A] mt-1">
                      DEPTH: 240m+ · SPEED: 25+ kts · CREW: 135
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Right: Text */}
            <AnimatedSection delay={150}>
              <div className="flex items-center gap-4 mb-4">
                <div className="section-number">03</div>
                <div className="w-8 h-px bg-[#C8922A]" />
                <div className="classification-label">Subsurface Systems</div>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-[#0B1C2E] mb-4 leading-tight">
                Beneath the Surface.<br />
                <em className="not-italic text-[#C8922A]">Beyond Detection.</em>
              </h2>
              <p className="font-ui text-sm text-[#52627A] leading-relaxed mb-6">
                Modern nuclear submarines represent the pinnacle of stealth engineering. From the Virginia class's photonics mast to the Type 212A's hydrogen fuel cell propulsion, explore the engineering principles that make these platforms the most survivable weapons systems ever built.
              </p>
              <div className="space-y-3 mb-8">
                {['Nuclear & AIP Propulsion Systems', 'Acoustic Signature Reduction', 'Advanced Sonar Suites', 'Vertical Launch Capabilities'].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-1 h-1 rounded-full bg-[#C8922A]" />
                    <span className="font-ui text-xs text-[#52627A]">{item}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/catalogue/naval-platforms"
                className="inline-flex items-center gap-2 border border-[#0B1C2E] text-[#0B1C2E] px-5 py-2.5 font-ui text-xs font-medium tracking-wide hover:bg-[#0B1C2E] hover:text-white transition-colors"
              >
                Explore Naval Platforms
                <ArrowRight size={14} />
              </Link>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── RADAR SECTION ────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-[#0B1C2E]">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left: Text */}
            <AnimatedSection>
              <div className="flex items-center gap-4 mb-4">
                <div className="font-mono-data text-[10px] text-[#C8922A] tracking-[0.2em]">04</div>
                <div className="w-8 h-px bg-[#C8922A]" />
                <div className="font-mono-data text-[9px] text-[#C8922A] tracking-[0.15em] uppercase">Detection Systems</div>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-white mb-4 leading-tight">
                Eyes of the Fleet.<br />
                <em className="not-italic text-[#C8922A]">Precision at Range.</em>
              </h2>
              <p className="font-ui text-sm text-white/60 leading-relaxed mb-6">
                From the AN/SPY-6's GaN-based AESA arrays to hull-mounted sonar suites, detection systems define the battlespace awareness of modern naval forces. Explore phased-array radar physics, sonar acoustics, and electronic warfare principles.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { label: 'SPY-6 Sensitivity', value: '35×' },
                  { label: 'Detection Range', value: '1000+ km' },
                  { label: 'Track Capacity', value: '1000+' },
                  { label: 'Freq. Band', value: 'S-band' },
                ].map((spec) => (
                  <div key={spec.label} className="border border-white/10 p-3">
                    <div className="font-mono-data text-[9px] text-white/40 tracking-[0.1em] uppercase mb-1">{spec.label}</div>
                    <div className="font-mono-data text-base font-medium text-[#C8922A]">{spec.value}</div>
                  </div>
                ))}
              </div>
              <Link
                href="/catalogue/detection-systems"
                className="inline-flex items-center gap-2 border border-[#C8922A] text-[#C8922A] px-5 py-2.5 font-ui text-xs font-medium tracking-wide hover:bg-[#C8922A] hover:text-white transition-colors"
              >
                Explore Detection Systems
                <ArrowRight size={14} />
              </Link>
            </AnimatedSection>

            {/* Right: Image */}
            <AnimatedSection delay={150}>
              <div className="relative overflow-hidden aspect-[4/3]">
                <img
                  src={RADAR_IMAGE}
                  alt="Naval Phased-Array Radar"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <div className="bg-[#0B1C2E]/80 backdrop-blur-sm border border-white/10 px-3 py-1.5">
                    <div className="font-mono-data text-[9px] text-[#C8922A] tracking-[0.15em]">AN/SPY-6(V)1 · AESA</div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── AI ASSISTANT CTA ─────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 max-w-[1280px] mx-auto">
        <AnimatedSection>
          <div className="border border-[#e8e8e8] p-8 md:p-12 relative overflow-hidden">
            {/* Decorative radar SVG */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none hidden md:block">
              <svg width="200" height="200" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" stroke="#C8922A" strokeWidth="1" fill="none" />
                <circle cx="100" cy="100" r="60" stroke="#C8922A" strokeWidth="1" fill="none" />
                <circle cx="100" cy="100" r="30" stroke="#C8922A" strokeWidth="1" fill="none" />
                <line x1="100" y1="10" x2="100" y2="190" stroke="#C8922A" strokeWidth="0.5" />
                <line x1="10" y1="100" x2="190" y2="100" stroke="#C8922A" strokeWidth="0.5" />
                <path d="M100 100 L190 100 A90 90 0 0 0 100 10 Z" fill="#C8922A" opacity="0.3" />
              </svg>
            </div>

            <div className="relative z-10 max-w-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="section-number">05</div>
                <div className="w-8 h-px bg-[#C8922A]" />
                <div className="classification-label">AI-Assisted Analysis</div>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-[#0B1C2E] mb-4">
                Naval Defense<br />Intelligence Assistant
              </h2>
              <p className="font-ui text-sm text-[#52627A] leading-relaxed mb-6">
                Ask complex technical questions about naval systems. Compare combat management systems, understand propulsion engineering, or analyze weapon system capabilities with AI-guided precision.
              </p>
              <div className="space-y-2 mb-8">
                {[
                  '"Compare AEGIS with other naval combat management systems"',
                  '"Explain how phased-array radar works on destroyers"',
                  '"Nuclear vs. diesel-electric submarine propulsion"',
                ].map((q) => (
                  <div key={q} className="font-mono-data text-[10px] text-[#52627A] bg-[#F5F4F2] px-3 py-2 border-l-2 border-[#C8922A]">
                    {q}
                  </div>
                ))}
              </div>
              <Link
                href="/assistant"
                className="inline-flex items-center gap-2 bg-[#0B1C2E] text-white px-6 py-3 font-ui text-sm font-medium tracking-wide hover:bg-[#162d47] transition-colors"
              >
                Open AI Assistant
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="border-t border-[#e8e8e8] bg-[#F5F4F2] pb-20 md:pb-0">
        <div className="max-w-[1280px] mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="font-display text-base font-semibold text-[#0B1C2E] mb-1">
                Naval & Defense Systems Intelligence Catalogue
              </div>
              <div className="font-mono-data text-[9px] text-[#B0B8C1] tracking-[0.15em] uppercase">
                For Research & Educational Purposes · Unclassified
              </div>
            </div>
            <div className="flex gap-6">
              {[
                { href: '/catalogue', label: 'Catalogue' },
                { href: '/assistant', label: 'AI Assistant' },
                { href: '/visualization', label: 'Visualization' },
                { href: '/database', label: 'Spec Database' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-ui text-xs text-[#52627A] hover:text-[#0B1C2E] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-[#e8e8e8]">
            <div className="font-mono-data text-[9px] text-[#B0B8C1] tracking-[0.1em]">
              © 2026 NAVAL INTELLIGENCE CATALOGUE · ALL SPECIFICATIONS ARE PUBLICLY AVAILABLE DATA · NOT FOR OPERATIONAL USE
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
