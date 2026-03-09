/*
 * Spec Database Page — Naval & Defense Systems Intelligence Catalogue
 * Design: Luxury Naval Intelligence — Refined Minimalism
 * Layout: Search bar + filterable specification database table
 */

import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Search, X, ArrowRight, SlidersHorizontal } from "lucide-react";
import NavBar from "@/components/NavBar";
import {
  navalSystems,
  searchSystems,
  CATEGORY_LABELS,
  SUBCATEGORY_LABELS,
  type SystemCategory,
} from "@/lib/navalData";

const SORT_OPTIONS = [
  { value: 'name', label: 'Name A–Z' },
  { value: 'country', label: 'Country' },
  { value: 'category', label: 'Category' },
  { value: 'inService', label: 'In Service' },
];

export default function SpecDatabasePage() {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<SystemCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let results = query.trim() ? searchSystems(query) : navalSystems;
    if (categoryFilter !== 'all') {
      results = results.filter(s => s.category === categoryFilter);
    }
    return [...results].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'country') return a.country.localeCompare(b.country);
      if (sortBy === 'category') return a.category.localeCompare(b.category);
      if (sortBy === 'inService') return a.inService.localeCompare(b.inService);
      return 0;
    });
  }, [query, categoryFilter, sortBy]);

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      {/* Header */}
      <div className="pt-14 bg-[#0B1C2E]">
        <div className="max-w-[1280px] mx-auto px-6 py-8">
          <div className="classification-label text-[#C8922A] mb-2">
            ◆ TECHNICAL SPECIFICATION DATABASE · {navalSystems.length} SYSTEMS
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-white mb-4">
            Specification Database
          </h1>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52627A]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search systems, designations, countries, capabilities..."
              className="w-full bg-white/10 border border-white/20 pl-10 pr-10 py-3 font-ui text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#C8922A] transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-6 pb-24 md:pb-12">
        {/* Filters bar */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 border border-[#e8e8e8] px-3 py-1.5 font-ui text-xs text-[#52627A] hover:border-[#C8922A] transition-colors"
            >
              <SlidersHorizontal size={12} />
              Filters
            </button>

            {/* Category pills */}
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 font-ui text-xs border transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-[#0B1C2E] text-white border-[#0B1C2E]'
                  : 'border-[#e8e8e8] text-[#52627A] hover:border-[#C8922A]'
              }`}
            >
              All
            </button>
            {(Object.keys(CATEGORY_LABELS) as SystemCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 font-ui text-xs border transition-colors whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-[#0B1C2E] text-white border-[#0B1C2E]'
                    : 'border-[#e8e8e8] text-[#52627A] hover:border-[#C8922A]'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="font-mono-data text-[9px] text-[#B0B8C1] tracking-[0.1em] uppercase">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-[#e8e8e8] px-2 py-1.5 font-ui text-xs text-[#52627A] focus:outline-none focus:border-[#C8922A] bg-white"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="font-mono-data text-[10px] text-[#B0B8C1] tracking-[0.1em] uppercase mb-4">
          {filtered.length} of {navalSystems.length} systems
          {query && <span className="ml-2 text-[#C8922A]">· Matching "{query}"</span>}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block border border-[#e8e8e8] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F5F4F2] border-b border-[#e8e8e8]">
                {['System', 'Designation', 'Category', 'Country', 'In Service', 'Key Spec', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-mono-data text-[9px] text-[#B0B8C1] tracking-[0.12em] uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((system, i) => {
                const firstSpec = Object.entries(system.specifications)[0];
                return (
                  <tr
                    key={system.id}
                    className={`border-b border-[#f0f0f0] hover:bg-[#fdf8f0] transition-colors ${
                      i % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-display text-sm font-semibold text-[#0B1C2E]">{system.name}</div>
                      <div className="font-ui text-[11px] text-[#52627A] line-clamp-1 max-w-[200px]">{system.description}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono-data text-[11px] text-[#C8922A]">{system.designation}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="system-tag">{SUBCATEGORY_LABELS[system.subCategory]}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-ui text-xs text-[#52627A]">{system.country}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono-data text-[11px] text-[#52627A]">{system.inService}</span>
                    </td>
                    <td className="px-4 py-3">
                      {firstSpec && (
                        <div>
                          <div className="font-mono-data text-[9px] text-[#B0B8C1] uppercase">{firstSpec[0]}</div>
                          <div className="font-mono-data text-[11px] text-[#0B1C2E]">{firstSpec[1]}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/system/${system.id}`}
                        className="flex items-center gap-1 text-[#C8922A] font-ui text-xs hover:gap-2 transition-all whitespace-nowrap"
                      >
                        View <ArrowRight size={11} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {filtered.map((system) => (
            <Link key={system.id} href={`/system/${system.id}`}>
              <div className="border border-[#e8e8e8] p-4 hover:border-[#C8922A]/40 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-display text-base font-semibold text-[#0B1C2E]">{system.name}</div>
                    <div className="font-mono-data text-[10px] text-[#C8922A]">{system.designation}</div>
                  </div>
                  <div className="system-tag amber flex-shrink-0 ml-2">{system.country}</div>
                </div>
                <p className="font-ui text-xs text-[#52627A] mb-3 line-clamp-2">{system.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(system.specifications).slice(0, 4).map(([k, v]) => (
                    <div key={k}>
                      <div className="font-mono-data text-[9px] text-[#B0B8C1] uppercase">{k}</div>
                      <div className="font-mono-data text-[11px] text-[#0B1C2E]">{v}</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-[#C8922A] mt-3 font-ui text-xs">
                  Full Specifications <ArrowRight size={11} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 border border-[#e8e8e8]">
            <Search size={32} className="text-[#B0B8C1] mx-auto mb-3" />
            <div className="font-display text-xl text-[#B0B8C1] mb-2">No results found</div>
            <div className="font-ui text-sm text-[#B0B8C1]">Try a different search term or clear filters</div>
            <button
              onClick={() => { setQuery(''); setCategoryFilter('all'); }}
              className="mt-4 font-ui text-xs text-[#C8922A] border border-[#C8922A] px-4 py-2 hover:bg-[#C8922A] hover:text-white transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
