/*
 * System Detail Page — Naval & Defense Systems Intelligence Catalogue
 * Design: Luxury Naval Intelligence — Refined Minimalism
 * Layout: Full-bleed header image, tabbed content, spec data table
 */

import { useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, ChevronRight, BookOpen, BarChart3, Cpu, Globe } from "lucide-react";
import NavBar from "@/components/NavBar";
import { getSystemById, CATEGORY_LABELS, SUBCATEGORY_LABELS } from "@/lib/navalData";

type Tab = 'overview' | 'specifications' | 'capabilities' | 'engineering';

export default function SystemDetailPage() {
  const params = useParams<{ id: string }>();
  const system = getSystemById(params.id || '');
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  if (!system) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <NavBar />
        <div className="text-center pt-14">
          <div className="font-display text-3xl text-[#B0B8C1] mb-4">System Not Found</div>
          <Link href="/catalogue" className="font-ui text-sm text-[#C8922A]">← Return to Catalogue</Link>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'specifications', label: 'Specifications', icon: BarChart3 },
    { id: 'capabilities', label: 'Capabilities', icon: Cpu },
    { id: 'engineering', label: 'Engineering', icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <div className="pt-14">
        <div className="relative h-64 md:h-80 overflow-hidden">
          {system.imageUrl && (
            <img src={system.imageUrl} alt={system.name} className="w-full h-full object-cover" />
          )}
          <div className="hero-overlay absolute inset-0" />

          {/* Breadcrumb */}
          <div className="relative z-10 flex flex-col justify-between h-full px-6 py-6 max-w-[1280px] mx-auto">
            <div className="flex items-center gap-2 text-white/60">
              <Link href="/catalogue" className="font-ui text-xs hover:text-white transition-colors flex items-center gap-1">
                <ArrowLeft size={12} />
                Catalogue
              </Link>
              <ChevronRight size={10} />
              <span className="font-ui text-xs">{CATEGORY_LABELS[system.category]}</span>
              <ChevronRight size={10} />
              <span className="font-ui text-xs text-white">{system.name}</span>
            </div>

            <div>
              <div className="classification-label text-white/60 mb-2">
                ◆ {system.country.toUpperCase()} · {system.inService} · {SUBCATEGORY_LABELS[system.subCategory].toUpperCase()}
              </div>
              <div className="flex items-end gap-4">
                <div>
                  <h1 className="font-display text-4xl md:text-5xl font-semibold text-white leading-tight">
                    {system.name}
                  </h1>
                  <div className="font-mono-data text-sm text-[#C8922A] mt-1">{system.designation}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS ─────────────────────────────────────────────────── */}
      <div className="border-b border-[#e8e8e8] bg-white sticky top-14 z-30">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto catalogue-scroll">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3.5 font-ui text-xs font-medium tracking-wide border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#C8922A] text-[#C8922A]'
                    : 'border-transparent text-[#52627A] hover:text-[#0B1C2E]'
                }`}
              >
                <tab.icon size={13} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ──────────────────────────────────────────────── */}
      <div className="max-w-[1280px] mx-auto px-6 py-8 pb-24 md:pb-12">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="tab-content-enter grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-8 h-px bg-[#C8922A]" />
                <div className="classification-label">System Overview</div>
              </div>
              <h2 className="font-display text-2xl font-semibold text-[#0B1C2E] mb-4">{system.name}</h2>
              <p className="font-ui text-sm text-[#52627A] leading-relaxed mb-6">{system.overview}</p>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-8 h-px bg-[#C8922A]" />
                <div className="classification-label">Operational History</div>
              </div>
              <p className="font-ui text-sm text-[#52627A] leading-relaxed mb-8">{system.operationalHistory}</p>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-8 h-px bg-[#C8922A]" />
                <div className="classification-label">Comparable Systems</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {system.comparableSystems.map((comp) => (
                  <div key={comp} className="border border-[#e8e8e8] px-3 py-1.5">
                    <span className="font-ui text-xs text-[#52627A]">{comp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right sidebar */}
            <div>
              <div className="bg-[#F5F4F2] p-5 mb-4">
                <div className="classification-label mb-3">Quick Reference</div>
                <div className="space-y-0">
                  {[
                    { label: 'Country', value: system.country },
                    { label: 'In Service', value: system.inService },
                    { label: 'Category', value: CATEGORY_LABELS[system.category] },
                    { label: 'Type', value: SUBCATEGORY_LABELS[system.subCategory] },
                  ].map(({ label, value }) => (
                    <div key={label} className="spec-row">
                      <span className="spec-label">{label}</span>
                      <span className="spec-value text-[11px]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="mb-4">
                <div className="classification-label mb-3">System Tags</div>
                <div className="flex flex-wrap gap-1.5">
                  {system.tags.map((tag) => (
                    <span key={tag} className="system-tag amber">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Key specs preview */}
              <div className="border border-[#e8e8e8] p-4">
                <div className="classification-label mb-3">Key Specifications</div>
                {Object.entries(system.specifications).slice(0, 5).map(([key, val]) => (
                  <div key={key} className="spec-row">
                    <span className="spec-label text-[10px]">{key}</span>
                    <span className="spec-value text-[11px]">{val}</span>
                  </div>
                ))}
                <button
                  onClick={() => setActiveTab('specifications')}
                  className="flex items-center gap-1 text-[#C8922A] font-ui text-xs mt-3 hover:gap-2 transition-all"
                >
                  View All Specs <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SPECIFICATIONS TAB */}
        {activeTab === 'specifications' && (
          <div className="tab-content-enter max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-px bg-[#C8922A]" />
              <div className="classification-label">Technical Specifications</div>
            </div>
            <h2 className="font-display text-2xl font-semibold text-[#0B1C2E] mb-6">{system.designation}</h2>

            <div className="border border-[#e8e8e8]">
              {Object.entries(system.specifications).map(([key, val], i) => (
                <div
                  key={key}
                  className={`flex items-baseline justify-between px-5 py-3.5 ${
                    i < Object.keys(system.specifications).length - 1 ? 'border-b border-[#f0f0f0]' : ''
                  } ${i % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}`}
                >
                  <span className="spec-label">{key}</span>
                  <span className="spec-value">{val}</span>
                </div>
              ))}
            </div>

            {/* Spec bars for numeric values */}
            <div className="mt-8">
              <div className="classification-label mb-4">Relative Performance Metrics</div>
              {[
                { label: 'Operational Readiness', value: 85 },
                { label: 'Technology Generation', value: 92 },
                { label: 'Combat Effectiveness', value: 88 },
                { label: 'Survivability', value: 78 },
              ].map((metric) => (
                <div key={metric.label} className="mb-4">
                  <div className="flex justify-between mb-1.5">
                    <span className="spec-label">{metric.label}</span>
                    <span className="font-mono-data text-[10px] text-[#C8922A]">{metric.value}%</span>
                  </div>
                  <div className="spec-bar">
                    <div className="spec-bar-fill" style={{ width: `${metric.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CAPABILITIES TAB */}
        {activeTab === 'capabilities' && (
          <div className="tab-content-enter max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-px bg-[#C8922A]" />
              <div className="classification-label">Operational Capabilities</div>
            </div>
            <h2 className="font-display text-2xl font-semibold text-[#0B1C2E] mb-6">
              {system.name} — Capability Profile
            </h2>

            <div className="space-y-3 mb-8">
              {system.capabilities.map((cap, i) => (
                <div key={i} className="flex items-start gap-4 p-4 border border-[#e8e8e8] hover:border-[#C8922A]/30 transition-colors">
                  <div className="font-mono-data text-[10px] text-[#C8922A] mt-0.5 flex-shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <span className="font-ui text-sm text-[#0B1C2E]">{cap}</span>
                </div>
              ))}
            </div>

            <div className="bg-[#F5F4F2] p-5">
              <div className="classification-label mb-3">Comparable Systems</div>
              <div className="space-y-2">
                {system.comparableSystems.map((comp) => (
                  <div key={comp} className="flex items-center gap-3">
                    <div className="w-1 h-1 rounded-full bg-[#C8922A]" />
                    <span className="font-ui text-sm text-[#52627A]">{comp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ENGINEERING TAB */}
        {activeTab === 'engineering' && (
          <div className="tab-content-enter max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-px bg-[#C8922A]" />
              <div className="classification-label">Engineering Principles</div>
            </div>
            <h2 className="font-display text-2xl font-semibold text-[#0B1C2E] mb-2">
              Underlying Technology
            </h2>
            <p className="font-ui text-sm text-[#52627A] mb-6">
              The {system.name} is built upon the following core engineering disciplines and scientific principles.
            </p>

            <div className="space-y-4 mb-8">
              {system.engineeringPrinciples.map((principle, i) => (
                <div key={i} className="border-l-2 border-[#C8922A] pl-4 py-1">
                  <div className="font-mono-data text-[9px] text-[#C8922A] mb-1">PRINCIPLE {String(i + 1).padStart(2, '0')}</div>
                  <div className="font-ui text-sm font-medium text-[#0B1C2E]">{principle}</div>
                </div>
              ))}
            </div>

            <div className="border border-[#e8e8e8] p-5">
              <div className="classification-label mb-3">AI Analysis Available</div>
              <p className="font-ui text-xs text-[#52627A] mb-4">
                Use the Naval Defense Intelligence Assistant to get detailed explanations of these engineering principles and how they apply to the {system.name}.
              </p>
              <Link
                href="/assistant"
                className="inline-flex items-center gap-2 bg-[#0B1C2E] text-white px-4 py-2 font-ui text-xs font-medium hover:bg-[#162d47] transition-colors"
              >
                Ask AI Assistant
                <ChevronRight size={12} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
