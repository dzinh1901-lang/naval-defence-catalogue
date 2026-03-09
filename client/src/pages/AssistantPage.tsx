/*
 * AI Defense Assistant Page — Naval & Defense Systems Intelligence Catalogue
 * Design: Luxury Naval Intelligence — Refined Minimalism
 * Layout: Chat interface with suggested queries and response rendering
 */

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Anchor, ChevronRight } from "lucide-react";
import NavBar from "@/components/NavBar";
import { AI_RESPONSES } from "@/lib/navalData";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUERIES = [
  { label: 'AEGIS vs. Other Combat Systems', query: 'Compare AEGIS combat systems with other naval combat management systems' },
  { label: 'Phased-Array Radar Physics', query: 'Explain how phased-array radar works on modern destroyers' },
  { label: 'Submarine Propulsion Comparison', query: 'Compare diesel-electric and nuclear submarine propulsion systems' },
  { label: 'Anti-Ship Missile Defense', query: 'How do modern naval vessels defend against anti-ship missiles?' },
  { label: 'Sonar Detection Principles', query: 'Explain passive sonar detection and how submarines avoid detection' },
];

function getAIResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('aegis') || q.includes('combat system') || q.includes('combat management')) {
    return AI_RESPONSES.aegis;
  }
  if (q.includes('phased') || q.includes('radar') || q.includes('array')) {
    return AI_RESPONSES.phased_array;
  }
  if (q.includes('submarine') || q.includes('propulsion') || q.includes('nuclear') || q.includes('diesel')) {
    return AI_RESPONSES.submarine_propulsion;
  }
  if (q.includes('sonar') || q.includes('acoustic') || q.includes('detection')) {
    return `## Sonar Detection Principles

**Passive Sonar** listens for sounds emitted by the target — machinery noise, propeller cavitation, flow noise. No emissions are made, making it undetectable.

**Active Sonar** emits acoustic pulses and listens for echoes. Provides precise range and bearing but reveals the sonar platform's position.

### Passive Detection Methods:
- **LOFAR (Low-Frequency Analysis and Recording)**: Detects narrowband tonal frequencies from rotating machinery
- **DEMON (Demodulation of Envelope Modulation on Noise)**: Detects propeller blade rate
- **Broadband**: Detects overall noise level above ambient

### Acoustic Signature Reduction (Submarines):
1. **Anechoic tiles**: Rubber coating absorbs active sonar pulses
2. **Raft mounting**: Machinery isolated from hull on vibration-damped rafts
3. **Pump-jet propulsors**: Replace cavitating propellers
4. **Natural circulation reactors**: Eliminate coolant pump noise (Virginia Block III+)

### Detection Ranges (Approximate):
| Condition | Range |
|-----------|-------|
| Convergence zone | 50-100 km |
| Direct path | 10-30 km |
| Bottom bounce | 100-200 km |

Modern AIP submarines like the Type 212A are considered nearly undetectable in passive mode.`;
  }
  if (q.includes('missile') || q.includes('anti-ship') || q.includes('defense')) {
    return `## Naval Anti-Ship Missile Defense

Modern surface combatants employ a **layered defense architecture** to defeat anti-ship missiles:

### Layer 1: Long-Range Intercept (50-200 km)
- **SM-6 (RIM-174)**: Active radar homing, Mach 3.5+, engages supersonic threats
- **SM-2 (RIM-66)**: Semi-active radar homing, proven against subsonic ASMs
- Requires AEGIS/SPY-6 radar cueing

### Layer 2: Medium-Range (5-50 km)
- **ESSM (RIM-162)**: Quad-packed in Mk 41 VLS, highly maneuverable
- **RAM (RIM-116)**: Passive RF/IR homing, autonomous engagement

### Layer 3: Close-In (0-2 km)
- **Phalanx CIWS (Mk 15)**: 4,500 rpm, fully autonomous, last-ditch
- **SeaRAM**: Combines Phalanx sensor with RAM missiles

### Electronic Countermeasures:
- **AN/SLQ-32 SEWIP Block 3**: Active jamming to seduce/confuse seeker
- **Chaff/Decoys**: Nulka active decoy, SRBOC chaff rockets
- **Soft-kill**: Preferred to preserve ammunition

### Saturation Attack Challenge:
The primary threat is **salvo attacks** — launching more missiles than the defender has intercept shots. Modern AEGIS ships carry 96 VLS cells but may face 20+ simultaneous threats.`;
  }

  // Default response
  return `## Naval Defense Intelligence Assistant

I can provide detailed technical analysis on the following topics:

**Naval Platforms**
- Aircraft carriers, destroyers, frigates, submarines
- Amphibious assault ships, unmanned surface vessels

**Weapon Systems**
- Anti-ship missiles, cruise missiles, torpedoes
- Naval artillery, close-in weapon systems (CIWS)

**Detection Systems**
- Phased-array radar (AEGIS, SPY-6, SAMPSON)
- Sonar arrays (passive, active, towed)
- Electronic warfare systems

**Propulsion Systems**
- Nuclear propulsion (PWR design, advantages)
- Gas turbine (LM2500, MT30)
- Diesel-electric and AIP (fuel cell, Stirling)

**Example queries:**
- *"Compare AEGIS with other naval combat management systems"*
- *"How does phased-array radar work?"*
- *"Nuclear vs. diesel-electric submarine propulsion"*
- *"How do ships defend against anti-ship missiles?"*

Please ask a specific question to receive a detailed technical briefing.`;
}

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  const rendered: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('## ')) {
      rendered.push(
        <h2 key={i} className="font-display text-xl font-semibold text-[#0B1C2E] mt-4 mb-2 first:mt-0">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      rendered.push(
        <h3 key={i} className="font-ui text-sm font-semibold text-[#0B1C2E] mt-3 mb-1.5">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith('| ') && line.includes('|')) {
      // Table
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      const headers = tableLines[0].split('|').filter(Boolean).map(h => h.trim());
      const rows = tableLines.slice(2).map(row => row.split('|').filter(Boolean).map(c => c.trim()));
      rendered.push(
        <div key={`table-${i}`} className="overflow-x-auto my-3">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#F5F4F2]">
                {headers.map((h, j) => (
                  <th key={j} className="text-left px-3 py-2 font-mono-data text-[10px] text-[#52627A] tracking-[0.08em] uppercase border-b border-[#e8e8e8]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="border-b border-[#f0f0f0]">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 font-ui text-xs text-[#52627A]">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    } else if (line.startsWith('- ')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2));
        i++;
      }
      rendered.push(
        <ul key={`ul-${i}`} className="space-y-1 my-2">
          {items.map((item, j) => {
            const parts = item.split(/\*\*(.*?)\*\*/g);
            return (
              <li key={j} className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-[#C8922A] mt-1.5 flex-shrink-0" />
                <span className="font-ui text-xs text-[#52627A] leading-relaxed">
                  {parts.map((p, pi) => pi % 2 === 1 ? <strong key={pi} className="text-[#0B1C2E]">{p}</strong> : p)}
                </span>
              </li>
            );
          })}
        </ul>
      );
      continue;
    } else if (line.match(/^\d+\. /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(lines[i].replace(/^\d+\. /, ''));
        i++;
      }
      rendered.push(
        <ol key={`ol-${i}`} className="space-y-1 my-2">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2">
              <span className="font-mono-data text-[10px] text-[#C8922A] mt-0.5 flex-shrink-0">{String(j + 1).padStart(2, '0')}</span>
              <span className="font-ui text-xs text-[#52627A] leading-relaxed">{item}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    } else if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
      rendered.push(
        <p key={i} className="font-ui text-xs text-[#52627A] italic my-1">{line.slice(1, -1)}</p>
      );
    } else if (line.trim() !== '') {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      rendered.push(
        <p key={i} className="font-ui text-xs text-[#52627A] leading-relaxed my-1">
          {parts.map((p, pi) => pi % 2 === 1 ? <strong key={pi} className="text-[#0B1C2E]">{p}</strong> : p)}
        </p>
      );
    }
    i++;
  }

  return <div className="space-y-0.5">{rendered}</div>;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: AI_RESPONSES.default,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (query: string) => {
    if (!query.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = getAIResponse(query);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavBar />

      {/* Header */}
      <div className="pt-14 border-b border-[#e8e8e8] bg-[#F5F4F2]">
        <div className="max-w-[1280px] mx-auto px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0B1C2E] flex items-center justify-center">
              <Bot size={16} className="text-[#C8922A]" />
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold text-[#0B1C2E]">
                Naval Defense Intelligence Assistant
              </h1>
              <div className="classification-label">AI-Assisted Technical Analysis · Naval Systems</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-[1280px] mx-auto w-full px-6 pb-24 md:pb-8">
        {/* Suggested Queries */}
        <div className="py-4 border-b border-[#f0f0f0]">
          <div className="font-mono-data text-[9px] text-[#B0B8C1] tracking-[0.15em] uppercase mb-2">
            Suggested Queries
          </div>
          <div className="flex gap-2 overflow-x-auto catalogue-scroll pb-1">
            {SUGGESTED_QUERIES.map((sq) => (
              <button
                key={sq.label}
                onClick={() => sendMessage(sq.query)}
                className="flex-shrink-0 flex items-center gap-1.5 border border-[#e8e8e8] px-3 py-1.5 font-ui text-xs text-[#52627A] hover:border-[#C8922A] hover:text-[#C8922A] transition-colors whitespace-nowrap"
              >
                {sq.label}
                <ChevronRight size={10} />
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 py-6 space-y-6 overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`w-7 h-7 flex-shrink-0 flex items-center justify-center ${
                msg.role === 'assistant' ? 'bg-[#0B1C2E]' : 'bg-[#C8922A]'
              }`}>
                {msg.role === 'assistant'
                  ? <Anchor size={13} className="text-[#C8922A]" />
                  : <User size={13} className="text-white" />
                }
              </div>

              {/* Bubble */}
              <div className={`max-w-[85%] md:max-w-[75%] ${
                msg.role === 'user' ? 'chat-bubble-user px-4 py-3' : 'chat-bubble-ai px-4 py-4'
              }`}>
                {msg.role === 'user' ? (
                  <p className="font-ui text-sm">{msg.content}</p>
                ) : (
                  <MarkdownRenderer content={msg.content} />
                )}
                <div className={`font-mono-data text-[9px] mt-2 ${
                  msg.role === 'user' ? 'text-white/50 text-right' : 'text-[#B0B8C1]'
                }`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-7 h-7 bg-[#0B1C2E] flex items-center justify-center flex-shrink-0">
                <Anchor size={13} className="text-[#C8922A]" />
              </div>
              <div className="chat-bubble-ai px-4 py-3">
                <div className="flex gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C8922A] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C8922A] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C8922A] animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="font-mono-data text-[9px] text-[#B0B8C1] ml-1">Analyzing...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-[#e8e8e8] pt-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about naval systems, specifications, or engineering principles..."
              className="flex-1 border border-[#e8e8e8] px-4 py-3 font-ui text-sm text-[#0B1C2E] placeholder:text-[#B0B8C1] focus:outline-none focus:border-[#C8922A] transition-colors bg-white"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="bg-[#0B1C2E] text-white px-4 py-3 hover:bg-[#162d47] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send size={16} />
              <span className="hidden sm:block font-ui text-xs font-medium">Send</span>
            </button>
          </form>
          <div className="font-mono-data text-[9px] text-[#B0B8C1] mt-2 tracking-[0.08em]">
            NAVAL INTELLIGENCE AI · FOR RESEARCH AND EDUCATIONAL PURPOSES ONLY
          </div>
        </div>
      </div>
    </div>
  );
}
