/*
 * NavBar Component
 * Design: Luxury Naval Intelligence — Refined Minimalism
 * Top navigation: thin, precise, with amber accent on active items
 * Mobile: bottom navigation bar
 */

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Anchor, Search, BookOpen, Cpu, BarChart3, Database, Bot } from "lucide-react";

const navItems = [
  { path: "/", label: "Overview", icon: Anchor },
  { path: "/catalogue", label: "Catalogue", icon: BookOpen },
  { path: "/assistant", label: "AI Assistant", icon: Bot },
  { path: "/visualization", label: "Visualization", icon: Cpu },
  { path: "/spec-database", label: "Spec Database", icon: Database },
];

export default function NavBar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e8e8e8]">
        <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-7 h-7 relative">
              <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
                <circle cx="14" cy="14" r="12" stroke="#0B1C2E" strokeWidth="1.5" fill="none" />
                <circle cx="14" cy="14" r="7" stroke="#C8922A" strokeWidth="1" fill="none" opacity="0.6" />
                <circle cx="14" cy="14" r="2" fill="#C8922A" />
                <line x1="14" y1="2" x2="14" y2="26" stroke="#0B1C2E" strokeWidth="0.75" opacity="0.3" />
                <line x1="2" y1="14" x2="26" y2="14" stroke="#0B1C2E" strokeWidth="0.75" opacity="0.3" />
                <path d="M14 2 L26 14 L14 26 L2 14 Z" stroke="#C8922A" strokeWidth="0.75" fill="none" opacity="0.3" />
              </svg>
            </div>
            <div>
              <div className="font-display text-[13px] font-semibold tracking-tight text-[#0B1C2E] leading-none">
                NAVAL INTELLIGENCE
              </div>
              <div className="font-mono-data text-[8px] tracking-[0.15em] text-[#C8922A] uppercase leading-none mt-0.5">
                Defence Systems Catalogue
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`nav-link transition-colors duration-200 ${
                  location === item.path ? 'active' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Search + Mobile Menu */}
          <div className="flex items-center gap-3">
            <Link href="/database" className="p-2 text-[#52627A] hover:text-[#0B1C2E] transition-colors">
              <Search size={16} />
            </Link>
            <button
              className="md:hidden p-2 text-[#52627A] hover:text-[#0B1C2E] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-[#e8e8e8]">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-6 py-3.5 border-b border-[#f0f0f0] last:border-0 ${
                  location === item.path
                    ? 'text-[#C8922A] bg-[#fdf8f0]'
                    : 'text-[#0B1C2E]'
                }`}
              >
                <item.icon size={16} className={location === item.path ? 'text-[#C8922A]' : 'text-[#B0B8C1]'} />
                <span className="font-ui text-[13px] font-medium tracking-wide">{item.label}</span>
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-nav md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-[52px]"
              >
                <item.icon
                  size={20}
                  className={isActive ? 'text-[#C8922A]' : 'text-[#B0B8C1]'}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                <span
                  className={`font-mono-data text-[9px] tracking-[0.08em] uppercase ${
                    isActive ? 'text-[#C8922A]' : 'text-[#B0B8C1]'
                  }`}
                >
                  {item.label.split(' ')[0]}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
