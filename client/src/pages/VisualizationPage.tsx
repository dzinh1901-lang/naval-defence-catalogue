/*
 * Visualization Page — Naval & Defense Systems Intelligence Catalogue
 * Design: Luxury Naval Intelligence — Refined Minimalism
 * Interactive SVG diagrams: radar coverage, sonar detection, propulsion layouts
 */

import { useState, useEffect, useRef } from "react";
import { Radio, Waves, Zap, Anchor } from "lucide-react";
import NavBar from "@/components/NavBar";

type VizType = 'radar' | 'sonar' | 'propulsion' | 'ship-architecture';

const VIZ_TABS: { id: VizType; label: string; icon: React.ElementType }[] = [
  { id: 'radar', label: 'Radar Coverage', icon: Radio },
  { id: 'sonar', label: 'Sonar Detection', icon: Waves },
  { id: 'propulsion', label: 'Propulsion Systems', icon: Zap },
  { id: 'ship-architecture', label: 'Ship Architecture', icon: Anchor },
];

// ── RADAR VISUALIZATION ────────────────────────────────────────────
function RadarVisualization() {
  const [angle, setAngle] = useState(0);
  const [tracks, setTracks] = useState<{ x: number; y: number; age: number }[]>([]);
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const targets = [
      { x: 65, y: 35 }, { x: 80, y: 60 }, { x: 45, y: 75 },
      { x: 30, y: 40 }, { x: 70, y: 80 }, { x: 55, y: 25 },
    ];

    const animate = (time: number) => {
      const delta = time - lastTimeRef.current;
      if (delta > 16) {
        setAngle(prev => (prev + 1.2) % 360);
        lastTimeRef.current = time;
      }
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    setTracks(targets.map(t => ({ ...t, age: Math.random() * 100 })));

    return () => cancelAnimationFrame(animRef.current);
  }, []);

  useEffect(() => {
    setTracks(prev => prev.map(t => ({ ...t, age: (t.age + 1.2) % 360 })));
  }, [angle]);

  const cx = 50, cy = 50, r = 44;
  const sweepRad = (angle * Math.PI) / 180;
  const sweepX = cx + r * Math.cos(sweepRad - Math.PI / 2);
  const sweepY = cy + r * Math.sin(sweepRad - Math.PI / 2);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-6 h-px bg-[#C8922A]" />
        <div className="classification-label">AN/SPY-6(V)1 — Phased Array Radar Coverage Simulation</div>
      </div>
      <p className="font-ui text-xs text-[#52627A] mb-4">
        Simulated 360° electronic beam steering. The AN/SPY-6 achieves 35× the sensitivity of its predecessor using GaN solid-state transmit/receive modules, enabling simultaneous search, track, and fire control.
      </p>

      <div className="viz-container rounded-none p-4 aspect-square max-w-sm mx-auto">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Background grid */}
          <circle cx={cx} cy={cy} r={r * 0.25} stroke="#1a3a5c" strokeWidth="0.3" fill="none" />
          <circle cx={cx} cy={cy} r={r * 0.5} stroke="#1a3a5c" strokeWidth="0.3" fill="none" />
          <circle cx={cx} cy={cy} r={r * 0.75} stroke="#1a3a5c" strokeWidth="0.3" fill="none" />
          <circle cx={cx} cy={cy} r={r} stroke="#1a3a5c" strokeWidth="0.4" fill="none" />

          {/* Cross hairs */}
          <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="#1a3a5c" strokeWidth="0.2" />
          <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#1a3a5c" strokeWidth="0.2" />
          <line x1={cx - r * 0.7} y1={cy - r * 0.7} x2={cx + r * 0.7} y2={cy + r * 0.7} stroke="#1a3a5c" strokeWidth="0.15" />
          <line x1={cx + r * 0.7} y1={cy - r * 0.7} x2={cx - r * 0.7} y2={cy + r * 0.7} stroke="#1a3a5c" strokeWidth="0.15" />

          {/* Sweep gradient */}
          <defs>
            <radialGradient id="sweepGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#C8922A" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#C8922A" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Sweep trail */}
          {[...Array(60)].map((_, i) => {
            const trailAngle = ((angle - i * 1.5) * Math.PI) / 180;
            const opacity = (1 - i / 60) * 0.4;
            const x = cx + r * Math.cos(trailAngle - Math.PI / 2);
            const y = cy + r * Math.sin(trailAngle - Math.PI / 2);
            return (
              <line
                key={i}
                x1={cx} y1={cy}
                x2={x} y2={y}
                stroke="#C8922A"
                strokeWidth="0.4"
                strokeOpacity={opacity}
              />
            );
          })}

          {/* Main sweep line */}
          <line
            x1={cx} y1={cy}
            x2={sweepX} y2={sweepY}
            stroke="#C8922A"
            strokeWidth="0.6"
            strokeOpacity="0.9"
          />

          {/* Target tracks */}
          {tracks.map((track, i) => {
            const angleDiff = Math.abs(((track.age - angle + 360) % 360));
            const brightness = Math.max(0, 1 - angleDiff / 180);
            return (
              <g key={i}>
                <circle
                  cx={track.x} cy={track.y} r="1.2"
                  fill="#00ff88"
                  fillOpacity={0.3 + brightness * 0.7}
                />
                <circle
                  cx={track.x} cy={track.y} r="0.5"
                  fill="#00ff88"
                  fillOpacity={0.8 + brightness * 0.2}
                />
              </g>
            );
          })}

          {/* Center dot */}
          <circle cx={cx} cy={cy} r="1.5" fill="#C8922A" />
          <circle cx={cx} cy={cy} r="0.5" fill="white" />

          {/* Range labels */}
          <text x={cx + 1} y={cy - r * 0.25 + 1} fill="#4a6a8a" fontSize="2.5" fontFamily="monospace">250km</text>
          <text x={cx + 1} y={cy - r * 0.5 + 1} fill="#4a6a8a" fontSize="2.5" fontFamily="monospace">500km</text>
          <text x={cx + 1} y={cy - r * 0.75 + 1} fill="#4a6a8a" fontSize="2.5" fontFamily="monospace">750km</text>
          <text x={cx + 1} y={cy - r + 1} fill="#4a6a8a" fontSize="2.5" fontFamily="monospace">1000km</text>
        </svg>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {[
          { color: '#C8922A', label: 'Sweep Beam', desc: 'Electronic beam' },
          { color: '#00ff88', label: 'Track Contact', desc: 'Detected target' },
          { color: '#1a3a5c', label: 'Range Rings', desc: '250km intervals' },
        ].map((item) => (
          <div key={item.label} className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full mt-0.5 flex-shrink-0" style={{ background: item.color }} />
            <div>
              <div className="font-ui text-[11px] font-medium text-[#0B1C2E]">{item.label}</div>
              <div className="font-mono-data text-[9px] text-[#B0B8C1]">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Specs */}
      <div className="border border-[#e8e8e8] mt-4">
        <div className="bg-[#F5F4F2] px-4 py-2 border-b border-[#e8e8e8]">
          <div className="classification-label">AN/SPY-6(V)1 Parameters</div>
        </div>
        {[
          ['Frequency Band', 'S-band (2–4 GHz)'],
          ['Technology', 'GaN AESA (Active Electronically Scanned Array)'],
          ['Sensitivity vs SPY-1D', '35× improvement'],
          ['Simultaneous Tracks', '1,000+'],
          ['Scan Type', 'Electronic beam steering, no mechanical movement'],
        ].map(([k, v]) => (
          <div key={k} className="spec-row px-4">
            <span className="spec-label">{k}</span>
            <span className="spec-value text-[11px]">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SONAR VISUALIZATION ────────────────────────────────────────────
function SonarVisualization() {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => (p + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-6 h-px bg-[#C8922A]" />
        <div className="classification-label">AN/BQQ-10 — Sonar Detection Field Visualization</div>
      </div>
      <p className="font-ui text-xs text-[#52627A] mb-4">
        Passive sonar detection fields vary with ocean depth, temperature gradients, and acoustic conditions. The convergence zone effect creates detection rings at approximately 50-100 km intervals.
      </p>

      <div className="viz-container rounded-none p-4 aspect-[4/3] max-w-lg mx-auto">
        <svg viewBox="0 0 160 120" className="w-full h-full">
          {/* Ocean depth gradient */}
          <defs>
            <linearGradient id="oceanGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0a2040" />
              <stop offset="100%" stopColor="#020810" />
            </linearGradient>
            <radialGradient id="sonarGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00aaff" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#00aaff" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="160" height="120" fill="url(#oceanGrad)" />

          {/* Thermocline layer */}
          <rect x="0" y="30" width="160" height="2" fill="#0066aa" fillOpacity="0.3" />
          <text x="2" y="28" fill="#4a8aaa" fontSize="3" fontFamily="monospace">THERMOCLINE — 200m</text>

          {/* Submarine at center */}
          <ellipse cx="80" cy="60" rx="12" ry="4" fill="#1a3a5c" />
          <ellipse cx="80" cy="57" rx="3" ry="5" fill="#1a3a5c" />
          <text x="80" y="72" fill="#4a8aaa" fontSize="3" fontFamily="monospace" textAnchor="middle">SUBMARINE</text>

          {/* Sonar pulses */}
          {[20, 40, 60, 80].map((r, i) => {
            const progress = (pulse + i * 25) % 100;
            const currentR = (progress / 100) * r;
            const opacity = 1 - progress / 100;
            return (
              <ellipse
                key={i}
                cx="80" cy="60"
                rx={currentR * 1.5} ry={currentR * 0.8}
                stroke="#00aaff"
                strokeWidth="0.5"
                fill="none"
                strokeOpacity={opacity * 0.6}
              />
            );
          })}

          {/* Detection zones */}
          <ellipse cx="80" cy="60" rx="45" ry="25" stroke="#C8922A" strokeWidth="0.4" fill="none" strokeDasharray="2,2" strokeOpacity="0.5" />
          <ellipse cx="80" cy="60" rx="70" ry="35" stroke="#C8922A" strokeWidth="0.3" fill="none" strokeDasharray="1,3" strokeOpacity="0.3" />

          {/* Contact markers */}
          {[
            { cx: 110, cy: 45 }, { cx: 130, cy: 65 }, { cx: 40, cy: 50 }, { cx: 55, cy: 75 },
          ].map((pos, i) => (
            <g key={i}>
              <circle cx={pos.cx} cy={pos.cy} r="2" fill="none" stroke="#00ff88" strokeWidth="0.5" strokeOpacity="0.8" />
              <circle cx={pos.cx} cy={pos.cy} r="0.8" fill="#00ff88" fillOpacity="0.9" />
            </g>
          ))}

          {/* Towed array */}
          <path d="M80 62 Q100 65 140 68" stroke="#C8922A" strokeWidth="0.6" fill="none" strokeOpacity="0.7" />
          <text x="142" y="70" fill="#C8922A" fontSize="2.5" fontFamily="monospace">TB-29</text>

          {/* Labels */}
          <text x="80" y="90" fill="#4a8aaa" fontSize="2.5" fontFamily="monospace" textAnchor="middle">DIRECT PATH ZONE — 30km</text>
          <text x="80" y="95" fill="#4a6a8a" fontSize="2" fontFamily="monospace" textAnchor="middle">CONVERGENCE ZONE — 50-100km</text>
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        {[
          { label: 'Direct Path', range: '10–30 km', color: '#00aaff' },
          { label: 'Convergence Zone', range: '50–100 km', color: '#C8922A' },
          { label: 'Towed Array (TB-29)', range: '240 m length', color: '#C8922A' },
          { label: 'Passive Detection', range: 'No emissions', color: '#00ff88' },
        ].map((item) => (
          <div key={item.label} className="flex items-start gap-2 border border-[#e8e8e8] p-3">
            <div className="w-2 h-2 rounded-full mt-0.5 flex-shrink-0" style={{ background: item.color }} />
            <div>
              <div className="font-ui text-[11px] font-medium text-[#0B1C2E]">{item.label}</div>
              <div className="font-mono-data text-[10px] text-[#C8922A]">{item.range}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PROPULSION VISUALIZATION ───────────────────────────────────────
function PropulsionVisualization() {
  const [selected, setSelected] = useState<'gas-turbine' | 'nuclear' | 'aip'>('gas-turbine');

  const systems = {
    'gas-turbine': {
      label: 'Gas Turbine (COGAG)',
      color: '#C8922A',
      components: [
        { label: 'Air Intake', x: 10, y: 40, w: 15, h: 20 },
        { label: 'Compressor', x: 28, y: 35, w: 18, h: 30 },
        { label: 'Combustor', x: 49, y: 30, w: 15, h: 40 },
        { label: 'Turbine', x: 67, y: 35, w: 15, h: 30 },
        { label: 'Exhaust', x: 85, y: 38, w: 10, h: 24 },
      ],
      specs: [
        ['Type', 'GE LM2500+G4'],
        ['Power', '35,300 shp'],
        ['Startup', '<2 minutes'],
        ['Efficiency', '39%'],
      ],
    },
    'nuclear': {
      label: 'Nuclear PWR',
      color: '#00aaff',
      components: [
        { label: 'Reactor Core', x: 10, y: 30, w: 20, h: 40 },
        { label: 'Steam Generator', x: 35, y: 35, w: 15, h: 30 },
        { label: 'Turbine', x: 55, y: 35, w: 15, h: 30 },
        { label: 'Condenser', x: 74, y: 40, w: 15, h: 20 },
        { label: 'Shaft', x: 90, y: 46, w: 8, h: 8 },
      ],
      specs: [
        ['Type', 'S9G PWR (Virginia)'],
        ['Power', '~40,000 shp'],
        ['Range', 'Unlimited'],
        ['Core Life', '33 years'],
      ],
    },
    'aip': {
      label: 'AIP Fuel Cell',
      color: '#00ff88',
      components: [
        { label: 'H₂ Storage', x: 8, y: 35, w: 15, h: 30 },
        { label: 'LOX Tank', x: 27, y: 35, w: 15, h: 30 },
        { label: 'Fuel Cell Stack', x: 46, y: 28, w: 20, h: 44 },
        { label: 'Battery', x: 70, y: 35, w: 15, h: 30 },
        { label: 'Motor', x: 89, y: 38, w: 10, h: 24 },
      ],
      specs: [
        ['Type', 'Siemens PEM (Type 212A)'],
        ['Power', '9× 30-50 kW cells'],
        ['Endurance', '14+ days submerged'],
        ['Noise', 'Near-zero'],
      ],
    },
  };

  const sys = systems[selected];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-6 h-px bg-[#C8922A]" />
        <div className="classification-label">Naval Propulsion System Architecture</div>
      </div>

      {/* Selector */}
      <div className="flex gap-2 mb-4">
        {(Object.keys(systems) as (keyof typeof systems)[]).map((key) => (
          <button
            key={key}
            onClick={() => setSelected(key)}
            className={`px-3 py-1.5 font-ui text-xs font-medium border transition-colors ${
              selected === key
                ? 'bg-[#0B1C2E] text-white border-[#0B1C2E]'
                : 'text-[#52627A] border-[#e8e8e8] hover:border-[#C8922A]'
            }`}
          >
            {systems[key].label}
          </button>
        ))}
      </div>

      {/* Diagram */}
      <div className="viz-container rounded-none p-4 aspect-[2/1] max-w-lg mx-auto">
        <svg viewBox="0 0 110 100" className="w-full h-full">
          {/* Flow arrow */}
          <defs>
            <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill={sys.color} opacity="0.7" />
            </marker>
          </defs>

          {/* Connection lines */}
          {sys.components.slice(0, -1).map((comp, i) => {
            const next = sys.components[i + 1];
            return (
              <line
                key={i}
                x1={comp.x + comp.w} y1={comp.y + comp.h / 2}
                x2={next.x} y2={next.y + next.h / 2}
                stroke={sys.color}
                strokeWidth="0.8"
                strokeOpacity="0.6"
                markerEnd="url(#arrowhead)"
              />
            );
          })}

          {/* Components */}
          {sys.components.map((comp, i) => (
            <g key={i}>
              <rect
                x={comp.x} y={comp.y}
                width={comp.w} height={comp.h}
                fill={sys.color}
                fillOpacity="0.15"
                stroke={sys.color}
                strokeWidth="0.5"
                strokeOpacity="0.8"
              />
              <text
                x={comp.x + comp.w / 2}
                y={comp.y + comp.h / 2}
                fill={sys.color}
                fontSize="2.8"
                fontFamily="monospace"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {comp.label}
              </text>
            </g>
          ))}

          {/* Label */}
          <text x="55" y="95" fill="#4a6a8a" fontSize="3" fontFamily="monospace" textAnchor="middle">
            {sys.label} — Schematic
          </text>
        </svg>
      </div>

      {/* Specs */}
      <div className="border border-[#e8e8e8]">
        {sys.specs.map(([k, v]) => (
          <div key={k} className="spec-row px-4">
            <span className="spec-label">{k}</span>
            <span className="spec-value text-[11px]">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SHIP ARCHITECTURE ──────────────────────────────────────────────
function ShipArchitectureVisualization() {
  const [hoveredSystem, setHoveredSystem] = useState<string | null>(null);

  const systems = [
    { id: 'radar', label: 'SPY-6 Radar', x: 55, y: 18, r: 5, color: '#C8922A' },
    { id: 'vls', label: 'Mk 41 VLS (96 cells)', x: 35, y: 55, r: 5, color: '#00aaff' },
    { id: 'gun', label: 'Mk 45 5"/62 Gun', x: 20, y: 50, r: 4, color: '#00ff88' },
    { id: 'ciws', label: 'Phalanx CIWS', x: 72, y: 45, r: 3.5, color: '#ff6644' },
    { id: 'sonar', label: 'SQQ-89 Sonar', x: 50, y: 78, r: 4, color: '#aa44ff' },
    { id: 'helo', label: 'Helicopter Deck', x: 80, y: 62, r: 5, color: '#44aaff' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-6 h-px bg-[#C8922A]" />
        <div className="classification-label">DDG-51 Arleigh Burke — System Architecture Map</div>
      </div>
      <p className="font-ui text-xs text-[#52627A] mb-4">
        Interactive system map of the Arleigh Burke-class destroyer. Tap any system node to view details.
      </p>

      <div className="viz-container rounded-none p-4 aspect-[2/1] max-w-lg mx-auto">
        <svg viewBox="0 0 120 100" className="w-full h-full">
          {/* Ship silhouette */}
          <path
            d="M8 70 L15 55 L20 45 L30 42 L45 40 L60 38 L75 40 L85 45 L95 55 L105 65 L108 70 L105 72 L8 72 Z"
            fill="#0d2040"
            stroke="#1a3a5c"
            strokeWidth="0.5"
          />
          {/* Superstructure */}
          <path
            d="M30 42 L35 28 L45 22 L65 20 L75 25 L80 35 L85 42 Z"
            fill="#0a1830"
            stroke="#1a3a5c"
            strokeWidth="0.4"
          />
          {/* Mast */}
          <line x1="55" y1="20" x2="55" y2="8" stroke="#1a3a5c" strokeWidth="0.5" />
          <line x1="48" y1="12" x2="62" y2="12" stroke="#1a3a5c" strokeWidth="0.4" />

          {/* Waterline */}
          <line x1="5" y1="72" x2="115" y2="72" stroke="#0066aa" strokeWidth="0.3" strokeDasharray="2,2" strokeOpacity="0.5" />

          {/* System nodes */}
          {systems.map((sys) => (
            <g
              key={sys.id}
              onMouseEnter={() => setHoveredSystem(sys.id)}
              onMouseLeave={() => setHoveredSystem(null)}
              className="cursor-pointer"
            >
              <circle
                cx={sys.x} cy={sys.y} r={sys.r + 2}
                fill={sys.color}
                fillOpacity={hoveredSystem === sys.id ? 0.2 : 0.05}
                stroke={sys.color}
                strokeWidth="0.3"
                strokeOpacity="0.4"
              />
              <circle
                cx={sys.x} cy={sys.y} r={sys.r}
                fill={sys.color}
                fillOpacity={hoveredSystem === sys.id ? 0.8 : 0.4}
                stroke={sys.color}
                strokeWidth="0.5"
              />
              {hoveredSystem === sys.id && (
                <text
                  x={sys.x}
                  y={sys.y - sys.r - 2}
                  fill={sys.color}
                  fontSize="3"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {sys.label}
                </text>
              )}
            </g>
          ))}

          {/* Label */}
          <text x="60" y="95" fill="#4a6a8a" fontSize="3" fontFamily="monospace" textAnchor="middle">
            DDG-51 ARLEIGH BURKE — SYSTEM LAYOUT
          </text>
        </svg>
      </div>

      {/* System legend */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
        {systems.map((sys) => (
          <div
            key={sys.id}
            className="flex items-center gap-2 p-2 border border-[#e8e8e8] cursor-pointer hover:border-[#C8922A]/30 transition-colors"
            onMouseEnter={() => setHoveredSystem(sys.id)}
            onMouseLeave={() => setHoveredSystem(null)}
          >
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: sys.color }} />
            <span className="font-ui text-[11px] text-[#52627A]">{sys.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function VisualizationPage() {
  const [activeViz, setActiveViz] = useState<VizType>('radar');

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      {/* Header */}
      <div className="pt-14 border-b border-[#e8e8e8] bg-[#F5F4F2]">
        <div className="max-w-[1280px] mx-auto px-6 py-5">
          <div className="classification-label mb-1">Interactive System Visualization</div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-[#0B1C2E]">
            Naval Systems Architecture
          </h1>
          <p className="font-ui text-xs text-[#52627A] mt-1">
            Explore naval defense systems through interactive technical diagrams and architecture maps.
          </p>
        </div>

        {/* Tabs */}
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto catalogue-scroll">
            {VIZ_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveViz(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-ui text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeViz === tab.id
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

      <div className="max-w-[1280px] mx-auto px-6 py-8 pb-24 md:pb-12">
        <div className="tab-content-enter">
          {activeViz === 'radar' && <RadarVisualization />}
          {activeViz === 'sonar' && <SonarVisualization />}
          {activeViz === 'propulsion' && <PropulsionVisualization />}
          {activeViz === 'ship-architecture' && <ShipArchitectureVisualization />}
        </div>
      </div>
    </div>
  );
}
