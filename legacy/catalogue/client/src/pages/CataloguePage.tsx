/*
 * Catalogue Page — Naval & Defense Systems Intelligence Catalogue
 * Design: Luxury Naval Intelligence — Refined Minimalism
 * Layout: Sidebar category filter + main content grid
 */

import { useState, useEffect } from "react";
import { Link, useParams } from "wouter";
import { ArrowRight, Filter, ChevronDown, ChevronRight } from "lucide-react";
import NavBar from "@/components/NavBar";
import {
  navalSystems,
  CATEGORY_LABELS,
  SUBCATEGORY_LABELS,
  CATEGORY_SUBCATEGORIES,
  getSystemsByCategory,
  getSystemsBySubCategory,
  type SystemCategory,
  type SystemSubCategory,
} from "@/lib/navalData";

const CATEGORY_IMAGES: Record<SystemCategory, string> = {
  'naval-platforms': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663393397427/2sv9VgNDVmgCjc4JvJ9onP/hero-destroyer-9yLqQbmbhyaY2KoGk7drA5.webp',
  'weapon-systems': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663393397427/2sv9VgNDVmgCjc4JvJ9onP/missile-system-fj9TDyvW2EG5iJdi5YDc4X.webp',
  'detection-systems': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663393397427/2sv9VgNDVmgCjc4JvJ9onP/radar-system-2RiCELzpdBWDGFKe5jbDAx.webp',
  'propulsion-systems': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
};

export default function CataloguePage() {
  const params = useParams<{ category?: string }>();
  const [activeCategory, setActiveCategory] = useState<SystemCategory | 'all'>('all');
  const [activeSubCategory, setActiveSubCategory] = useState<SystemSubCategory | 'all'>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<SystemCategory>>(new Set<SystemCategory>(['naval-platforms']));
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    if (params.category && params.category in CATEGORY_LABELS) {
      setActiveCategory(params.category as SystemCategory);
      setExpandedCategories(new Set([params.category as SystemCategory]));
    }
  }, [params.category]);

  const filteredSystems = (() => {
    if (activeSubCategory !== 'all') return getSystemsBySubCategory(activeSubCategory);
    if (activeCategory !== 'all') return getSystemsByCategory(activeCategory);
    return navalSystems;
  })();

  const toggleCategory = (cat: SystemCategory) => {
    const next = new Set(expandedCategories);
    if (next.has(cat)) next.delete(cat); else next.add(cat);
    setExpandedCategories(next);
  };

  const handleCategoryClick = (cat: SystemCategory) => {
    setActiveCategory(cat);
    setActiveSubCategory('all');
    if (!expandedCategories.has(cat)) toggleCategory(cat);
  };

  const handleSubCategoryClick = (sub: SystemSubCategory) => {
    setActiveSubCategory(sub);
    setFilterOpen(false);
  };

  const heroBg = activeCategory !== 'all' ? CATEGORY_IMAGES[activeCategory] : CATEGORY_IMAGES['naval-platforms'];

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      {/* ── CATALOGUE HEADER ─────────────────────────────────────── */}
      <div className="pt-14">
        <div className="relative h-48 md:h-64 overflow-hidden">
          <img src={heroBg} alt="Category" className="w-full h-full object-cover" />
          <div className="hero-overlay absolute inset-0" />
          <div className="relative z-10 flex flex-col justify-end h-full pb-8 px-6 max-w-[1280px] mx-auto">
            <div className="classification-label text-white/60 mb-2">
              ◆ SYSTEMS CATALOGUE · {filteredSystems.length} ENTRIES
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-white">
              {activeSubCategory !== 'all'
                ? SUBCATEGORY_LABELS[activeSubCategory]
                : activeCategory !== 'all'
                  ? CATEGORY_LABELS[activeCategory]
                  : 'Naval Systems Catalogue'}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-8 flex gap-8">
        {/* ── SIDEBAR FILTER (Desktop) ─────────────────────────── */}
        <aside className="hidden md:block w-52 flex-shrink-0">
          <div className="sticky top-20">
            <div className="font-mono-data text-[9px] text-[#B0B8C1] tracking-[0.2em] uppercase mb-4">
              Filter by Category
            </div>

            {/* All Systems */}
            <button
              onClick={() => { setActiveCategory('all'); setActiveSubCategory('all'); }}
              className={`w-full text-left px-3 py-2 mb-1 font-ui text-xs font-medium transition-colors ${
                activeCategory === 'all'
                  ? 'bg-[#0B1C2E] text-white'
                  : 'text-[#52627A] hover:text-[#0B1C2E] hover:bg-[#F5F4F2]'
              }`}
            >
              All Systems ({navalSystems.length})
            </button>

            <div className="w-full h-px bg-[#e8e8e8] my-3" />

            {(Object.keys(CATEGORY_LABELS) as SystemCategory[]).map((cat) => {
              const isActive = activeCategory === cat;
              const isExpanded = expandedCategories.has(cat);
              const catSystems = getSystemsByCategory(cat);

              return (
                <div key={cat} className="mb-1">
                  <button
                    onClick={() => handleCategoryClick(cat)}
                    className={`w-full flex items-center justify-between px-3 py-2 font-ui text-xs font-medium transition-colors ${
                      isActive
                        ? 'text-[#C8922A] bg-[#fdf8f0]'
                        : 'text-[#52627A] hover:text-[#0B1C2E] hover:bg-[#F5F4F2]'
                    }`}
                  >
                    <span>{CATEGORY_LABELS[cat]}</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono-data text-[9px] text-[#B0B8C1]">{catSystems.length}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleCategory(cat); }}
                        className="text-[#B0B8C1]"
                      >
                        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      </button>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="ml-3 border-l border-[#e8e8e8] pl-3 mt-1 mb-2">
                      {CATEGORY_SUBCATEGORIES[cat].map((sub) => {
                        const subSystems = getSystemsBySubCategory(sub);
                        if (subSystems.length === 0) return null;
                        return (
                          <button
                            key={sub}
                            onClick={() => handleSubCategoryClick(sub)}
                            className={`w-full text-left py-1.5 font-ui text-[11px] transition-colors flex items-center justify-between ${
                              activeSubCategory === sub
                                ? 'text-[#C8922A]'
                                : 'text-[#B0B8C1] hover:text-[#52627A]'
                            }`}
                          >
                            <span>{SUBCATEGORY_LABELS[sub]}</span>
                            <span className="font-mono-data text-[9px]">{subSystems.length}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* ── MAIN CONTENT ─────────────────────────────────────── */}
        <main className="flex-1 min-w-0">
          {/* Mobile Filter Toggle */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 border border-[#e8e8e8] px-4 py-2 font-ui text-xs text-[#52627A]"
            >
              <Filter size={14} />
              Filter
              <ChevronDown size={12} className={filterOpen ? 'rotate-180' : ''} />
            </button>

            {filterOpen && (
              <div className="mt-2 border border-[#e8e8e8] bg-white p-4">
                <button
                  onClick={() => { setActiveCategory('all'); setActiveSubCategory('all'); setFilterOpen(false); }}
                  className="block w-full text-left font-ui text-xs py-2 text-[#52627A] border-b border-[#f0f0f0]"
                >
                  All Systems
                </button>
                {(Object.keys(CATEGORY_LABELS) as SystemCategory[]).map((cat) => (
                  <div key={cat}>
                    <button
                      onClick={() => { handleCategoryClick(cat); setFilterOpen(false); }}
                      className="block w-full text-left font-ui text-xs py-2 font-medium text-[#0B1C2E] border-b border-[#f0f0f0]"
                    >
                      {CATEGORY_LABELS[cat]}
                    </button>
                    {CATEGORY_SUBCATEGORIES[cat].map((sub) => {
                      const subSystems = getSystemsBySubCategory(sub);
                      if (subSystems.length === 0) return null;
                      return (
                        <button
                          key={sub}
                          onClick={() => handleSubCategoryClick(sub)}
                          className="block w-full text-left font-ui text-[11px] py-1.5 pl-4 text-[#B0B8C1] border-b border-[#f8f8f8]"
                        >
                          {SUBCATEGORY_LABELS[sub]}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-6">
            <div className="font-mono-data text-[10px] text-[#B0B8C1] tracking-[0.1em] uppercase">
              {filteredSystems.length} System{filteredSystems.length !== 1 ? 's' : ''} Found
            </div>
          </div>

          {/* System Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredSystems.map((system) => (
              <Link key={system.id} href={`/system/${system.id}`}>
                <div className="system-card overflow-hidden group cursor-pointer h-full flex flex-col">
                  {/* Image */}
                  <div className="relative h-44 overflow-hidden bg-[#e8e8e8] flex-shrink-0">
                    {system.imageUrl && (
                      <img
                        src={system.imageUrl}
                        alt={system.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1C2E]/50 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <div className="system-tag bg-white/90 text-[#0B1C2E] border-white/50">
                        {CATEGORY_LABELS[system.category]}
                      </div>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <div className="system-tag amber">{system.inService}</div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-mono-data text-[9px] text-[#B0B8C1] tracking-[0.15em] uppercase mb-0.5">
                          {system.country}
                        </div>
                        <h3 className="font-display text-lg font-semibold text-[#0B1C2E] leading-tight">
                          {system.name}
                        </h3>
                      </div>
                      <div className="font-mono-data text-[10px] text-[#C8922A] text-right leading-tight ml-2 flex-shrink-0">
                        {system.designation}
                      </div>
                    </div>

                    <p className="font-ui text-xs text-[#52627A] leading-relaxed mb-3 flex-1">
                      {system.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {system.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="system-tag">{tag}</span>
                      ))}
                    </div>

                    {/* Quick specs */}
                    <div className="border-t border-[#f0f0f0] pt-3">
                      {Object.entries(system.specifications).slice(0, 2).map(([key, val]) => (
                        <div key={key} className="spec-row py-1">
                          <span className="spec-label text-[10px]">{key}</span>
                          <span className="spec-value text-[11px]">{val}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 text-[#C8922A] mt-3 group-hover:gap-2 transition-all">
                      <span className="font-ui text-xs font-medium">View Full Entry</span>
                      <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredSystems.length === 0 && (
            <div className="text-center py-20">
              <div className="font-display text-2xl text-[#B0B8C1] mb-2">No systems found</div>
              <div className="font-ui text-sm text-[#B0B8C1]">Try adjusting your filter selection</div>
            </div>
          )}
        </main>
      </div>

      {/* Footer spacing for mobile nav */}
      <div className="h-20 md:h-0" />
    </div>
  );
}
