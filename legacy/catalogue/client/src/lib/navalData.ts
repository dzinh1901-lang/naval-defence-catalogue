// Naval & Defense Systems Intelligence Catalogue — Data Library
// Design: Luxury Naval Intelligence — Refined Minimalism

export type SystemCategory = 
  | 'naval-platforms'
  | 'weapon-systems'
  | 'detection-systems'
  | 'propulsion-systems';

export type SystemSubCategory =
  | 'aircraft-carriers'
  | 'destroyers'
  | 'frigates'
  | 'submarines'
  | 'amphibious'
  | 'unmanned'
  | 'anti-ship-missiles'
  | 'cruise-missiles'
  | 'naval-artillery'
  | 'torpedoes'
  | 'ciws'
  | 'radar'
  | 'sonar'
  | 'electronic-warfare'
  | 'surveillance'
  | 'gas-turbine'
  | 'nuclear'
  | 'diesel-electric'
  | 'integrated-electric';

export interface NavalSystem {
  id: string;
  name: string;
  designation: string;
  category: SystemCategory;
  subCategory: SystemSubCategory;
  country: string;
  inService: string;
  description: string;
  overview: string;
  specifications: Record<string, string>;
  capabilities: string[];
  operationalHistory: string;
  comparableSystems: string[];
  engineeringPrinciples: string[];
  tags: string[];
  imageUrl?: string;
}

export const CATEGORY_LABELS: Record<SystemCategory, string> = {
  'naval-platforms': 'Naval Platforms',
  'weapon-systems': 'Weapon Systems',
  'detection-systems': 'Detection Systems',
  'propulsion-systems': 'Propulsion Systems',
};

export const SUBCATEGORY_LABELS: Record<SystemSubCategory, string> = {
  'aircraft-carriers': 'Aircraft Carriers',
  'destroyers': 'Destroyers',
  'frigates': 'Frigates',
  'submarines': 'Submarines',
  'amphibious': 'Amphibious Assault',
  'unmanned': 'Unmanned Surface Vessels',
  'anti-ship-missiles': 'Anti-Ship Missiles',
  'cruise-missiles': 'Cruise Missiles',
  'naval-artillery': 'Naval Artillery',
  'torpedoes': 'Torpedoes',
  'ciws': 'Close-In Weapon Systems',
  'radar': 'Radar Systems',
  'sonar': 'Sonar Arrays',
  'electronic-warfare': 'Electronic Warfare',
  'surveillance': 'Surveillance Platforms',
  'gas-turbine': 'Gas Turbine Propulsion',
  'nuclear': 'Nuclear Propulsion',
  'diesel-electric': 'Diesel-Electric Systems',
  'integrated-electric': 'Integrated Electric Propulsion',
};

export const CATEGORY_SUBCATEGORIES: Record<SystemCategory, SystemSubCategory[]> = {
  'naval-platforms': ['aircraft-carriers', 'destroyers', 'frigates', 'submarines', 'amphibious', 'unmanned'],
  'weapon-systems': ['anti-ship-missiles', 'cruise-missiles', 'naval-artillery', 'torpedoes', 'ciws'],
  'detection-systems': ['radar', 'sonar', 'electronic-warfare', 'surveillance'],
  'propulsion-systems': ['gas-turbine', 'nuclear', 'diesel-electric', 'integrated-electric'],
};

export const navalSystems: NavalSystem[] = [
  // ── NAVAL PLATFORMS ──────────────────────────────────────────────
  {
    id: 'cvn-78-ford',
    name: 'Gerald R. Ford',
    designation: 'CVN-78',
    category: 'naval-platforms',
    subCategory: 'aircraft-carriers',
    country: 'United States',
    inService: '2017–Present',
    description: 'The most advanced aircraft carrier ever built, featuring electromagnetic catapults and advanced arresting gear.',
    overview: 'The Gerald R. Ford class represents the most significant advancement in aircraft carrier design since the Nimitz class. Incorporating the Electromagnetic Aircraft Launch System (EALS), Advanced Arresting Gear (AAG), and a new nuclear reactor design, the Ford class dramatically increases sortie generation rates while reducing crew requirements by approximately 500 personnel compared to Nimitz-class carriers.',
    specifications: {
      'Displacement': '100,000+ tons (full load)',
      'Length': '337 m (1,106 ft)',
      'Beam': '78 m (256 ft)',
      'Draft': '12 m (39 ft)',
      'Speed': '30+ knots',
      'Range': 'Unlimited (nuclear)',
      'Crew': '4,539 (ship + air wing)',
      'Aircraft Capacity': '75+ fixed-wing and rotary',
      'Propulsion': '2× A1B nuclear reactors',
      'Power Output': '700 MW (electric)',
    },
    capabilities: [
      'Electromagnetic Aircraft Launch System (EALS)',
      'Advanced Arresting Gear (AAG)',
      'Dual Band Radar (DBR) integration',
      'Increased sortie generation rate (25% over Nimitz)',
      'Reduced crew requirement by 500 personnel',
      'Enhanced survivability features',
    ],
    operationalHistory: 'Commissioned July 22, 2017. First operational deployment in 2022 to the Mediterranean Sea. Participated in Operation Prosperity Guardian in 2023-2024.',
    comparableSystems: ['Nimitz-class CVN', 'Queen Elizabeth-class (UK)', 'Charles de Gaulle (France)', 'Liaoning (China)'],
    engineeringPrinciples: ['Nuclear propulsion thermodynamics', 'Electromagnetic launch physics', 'Arresting gear energy absorption', 'Flight deck aerodynamics'],
    tags: ['nuclear', 'carrier', 'EALS', 'supercarrier'],
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
  },
  {
    id: 'ddg-51-arleigh-burke',
    name: 'Arleigh Burke',
    designation: 'DDG-51',
    category: 'naval-platforms',
    subCategory: 'destroyers',
    country: 'United States',
    inService: '1991–Present',
    description: 'The world\'s most numerous and capable guided-missile destroyer class, equipped with the AEGIS Combat System.',
    overview: 'The Arleigh Burke class is the backbone of the United States Navy surface combatant force. Equipped with the AN/SPY-1D phased-array radar and the AEGIS Combat System, these destroyers provide area air defense, anti-submarine warfare, and surface warfare capabilities. The Flight III variant introduces the Air and Missile Defense Radar (AMDR/AN/SPY-6), representing a quantum leap in radar capability.',
    specifications: {
      'Displacement': '9,700 tons (full load, Flight IIA)',
      'Length': '155.3 m (509 ft)',
      'Beam': '20.4 m (66.9 ft)',
      'Draft': '9.4 m (30.8 ft)',
      'Speed': '30+ knots',
      'Range': '4,400 nmi at 20 knots',
      'Crew': '281–329',
      'VLS Cells': '96 (Mk 41)',
      'Propulsion': '4× GE LM2500-30 gas turbines',
      'Power': '105,000 shp (78,000 kW)',
    },
    capabilities: [
      'AEGIS Combat System with AN/SPY-1D radar',
      'Ballistic Missile Defense (BMD) capability',
      'AN/SQQ-89 anti-submarine warfare suite',
      'Tomahawk Land Attack Missile (TLAM)',
      'Standard Missile-2/3/6 (SM-2/3/6)',
      'Evolved Sea Sparrow Missile (ESSM)',
      'Mk 45 5-inch/62 caliber gun',
    ],
    operationalHistory: 'Over 70 ships commissioned since 1991. Participated in Operation Desert Storm, Operation Iraqi Freedom, and numerous NATO operations. BMD-capable ships have intercepted ballistic missiles in operational tests.',
    comparableSystems: ['Type 45 Destroyer (UK)', 'Horizon-class (France/Italy)', 'Sejong the Great-class (South Korea)', 'Atago-class (Japan)'],
    engineeringPrinciples: ['Phased-array radar beam steering', 'Gas turbine COGAG propulsion', 'Vertical launch system cold launch', 'AEGIS combat management algorithms'],
    tags: ['AEGIS', 'destroyer', 'BMD', 'VLS', 'guided-missile'],
    imageUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663393397427/2sv9VgNDVmgCjc4JvJ9onP/hero-destroyer-9yLqQbmbhyaY2KoGk7drA5.webp',
  },
  {
    id: 'ssn-774-virginia',
    name: 'Virginia',
    designation: 'SSN-774',
    category: 'naval-platforms',
    subCategory: 'submarines',
    country: 'United States',
    inService: '2004–Present',
    description: 'The most advanced nuclear-powered attack submarine in service, designed for multi-mission operations in littoral and open-ocean environments.',
    overview: 'The Virginia class represents the United States Navy\'s premier nuclear-powered attack submarine. Designed from the outset for post-Cold War missions including intelligence gathering, special operations support, and strike warfare, the Virginia class incorporates numerous advanced technologies including a photonics mast replacing the traditional periscope, a fly-by-wire ship control system, and a Large Aperture Bow (LAB) sonar array.',
    specifications: {
      'Displacement': '7,900 tons (submerged)',
      'Length': '114.9 m (377 ft)',
      'Beam': '10.4 m (34 ft)',
      'Draft': '9.3 m (30.5 ft)',
      'Speed': '25+ knots (submerged)',
      'Depth': '240+ m (classified)',
      'Crew': '135',
      'Torpedo Tubes': '4× 533mm',
      'VLS Tubes': '12× Mk 41 (Block III+)',
      'Propulsion': '1× S9G nuclear reactor',
    },
    capabilities: [
      'Photonics mast (no traditional periscope)',
      'Large Aperture Bow (LAB) sonar',
      'Advanced SEAL delivery capability',
      'Tomahawk cruise missile strike',
      'Anti-submarine warfare',
      'Intelligence, Surveillance, Reconnaissance (ISR)',
      'Mine warfare operations',
    ],
    operationalHistory: 'Over 20 boats commissioned. Block V variant adds Virginia Payload Module (VPM) adding 4 additional large-diameter payload tubes, significantly increasing strike capacity.',
    comparableSystems: ['Astute-class (UK)', 'Rubis/Suffren-class (France)', 'Yasen-class (Russia)', 'Type 093 (China)'],
    engineeringPrinciples: ['Nuclear reactor thermodynamics', 'Acoustic signature reduction', 'Photonics mast optics', 'Fly-by-wire submarine control'],
    tags: ['nuclear', 'submarine', 'SSN', 'stealth', 'strike'],
    imageUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663393397427/2sv9VgNDVmgCjc4JvJ9onP/submarine-dive-jyCmsXQxkLwcYuU6oz2DbB.webp',
  },
  {
    id: 'ffg-62-constellation',
    name: 'Constellation',
    designation: 'FFG-62',
    category: 'naval-platforms',
    subCategory: 'frigates',
    country: 'United States',
    inService: '2026–Present',
    description: 'Next-generation guided-missile frigate based on the FREMM design, restoring the US Navy\'s frigate capability.',
    overview: 'The Constellation class is the United States Navy\'s new guided-missile frigate, derived from the Italian FREMM multi-mission frigate. Designed to provide a capable, affordable surface combatant to complement the Arleigh Burke destroyers, the Constellation class features a 32-cell Mk 41 VLS, AN/SPS-48G 3D air search radar, and a multi-function towed array sonar system.',
    specifications: {
      'Displacement': '7,400 tons (full load)',
      'Length': '151.2 m (496 ft)',
      'Beam': '19.7 m (64.6 ft)',
      'Draft': '5.7 m (18.7 ft)',
      'Speed': '26+ knots',
      'Range': '6,000 nmi at 16 knots',
      'Crew': '200',
      'VLS Cells': '32 (Mk 41)',
      'Propulsion': 'CODLAG (diesel-electric + gas turbine)',
      'Helicopter': '2× MH-60R Seahawk',
    },
    capabilities: [
      'AN/SPS-48G 3D air search radar',
      'Multi-function towed array sonar',
      'Surface-to-air missile defense',
      'Anti-submarine warfare',
      'Over-the-horizon targeting',
      'Electronic warfare suite',
    ],
    operationalHistory: 'Lead ship under construction at Marinette Marine. Expected commissioning 2026. Program of record: 20 ships.',
    comparableSystems: ['FREMM (France/Italy)', 'Type 26 (UK)', 'F-126 (Germany)', 'Iver Huitfeldt (Denmark)'],
    engineeringPrinciples: ['CODLAG propulsion integration', 'Multi-static sonar arrays', 'Integrated mast design', 'Signature management'],
    tags: ['frigate', 'FREMM', 'ASW', 'multi-mission'],
    imageUrl: 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=800&q=80',
  },

  // ── WEAPON SYSTEMS ────────────────────────────────────────────────
  {
    id: 'rgm-109-tomahawk',
    name: 'Tomahawk',
    designation: 'BGM-109 / RGM-109',
    category: 'weapon-systems',
    subCategory: 'cruise-missiles',
    country: 'United States / United Kingdom',
    inService: '1983–Present',
    description: 'Long-range, all-weather, subsonic cruise missile used for deep land attack missions from surface ships and submarines.',
    overview: 'The Tomahawk Land Attack Missile (TLAM) is one of the most combat-proven cruise missiles in the world. Using terrain contour matching (TERCOM) and GPS navigation, the Tomahawk can strike targets at ranges exceeding 1,500 km with high precision. The Block V variant introduces a maritime strike capability, restoring the anti-ship mission after decades of land-attack focus.',
    specifications: {
      'Length': '5.56 m (18.2 ft)',
      'Diameter': '0.52 m (20.4 in)',
      'Weight': '1,315 kg (2,900 lb)',
      'Range': '1,600+ km (Block IV)',
      'Speed': '880 km/h (Mach 0.72)',
      'Guidance': 'INS/GPS/TERCOM/DSMAC',
      'Warhead': '450 kg WDU-36 unitary / submunitions',
      'Propulsion': 'Williams F107-WR-402 turbofan',
      'Launch Platform': 'Surface ships, submarines (Mk 41 VLS)',
      'CEP': '<10 m',
    },
    capabilities: [
      'Precision land attack (TLAM-C/D)',
      'Maritime strike (Block V)',
      'In-flight retargeting capability',
      'Loitering and battle damage assessment',
      'Time-critical target engagement',
      'Conventional strike at strategic ranges',
    ],
    operationalHistory: 'First combat use: Operation Desert Storm (1991). Used extensively in operations in Iraq, Afghanistan, Libya, Syria, and Yemen. Over 2,000 combat launches to date.',
    comparableSystems: ['Storm Shadow/SCALP (France/UK)', 'Kh-101 (Russia)', 'CJ-10 (China)', 'BrahMos (India/Russia)'],
    engineeringPrinciples: ['Terrain contour matching navigation', 'Digital scene matching area correlator', 'Turbofan propulsion efficiency', 'Inertial navigation systems'],
    tags: ['cruise-missile', 'land-attack', 'long-range', 'precision'],
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  },
  {
    id: 'agm-84-harpoon',
    name: 'Harpoon',
    designation: 'AGM-84 / RGM-84',
    category: 'weapon-systems',
    subCategory: 'anti-ship-missiles',
    country: 'United States',
    inService: '1977–Present',
    description: 'The world\'s most widely deployed anti-ship missile, capable of launch from aircraft, surface ships, and submarines.',
    overview: 'The Harpoon is a sea-skimming, active radar homing anti-ship missile that has been continuously upgraded since its introduction. The Block II+ variant adds GPS guidance for land attack capability, while the Long Range Anti-Ship Missile (LRASM) represents its spiritual successor. Harpoon is operated by over 30 nations and has been integrated into virtually every major Western naval platform.',
    specifications: {
      'Length': '3.84 m (12.6 ft)',
      'Diameter': '0.34 m (13.5 in)',
      'Weight': '691 kg (1,523 lb)',
      'Range': '130+ km (Block II)',
      'Speed': '855 km/h (Mach 0.71)',
      'Guidance': 'Active radar homing + INS/GPS (Block II+)',
      'Warhead': '221 kg WDU-18/B penetrating blast',
      'Propulsion': 'Teledyne CAE J402 turbojet',
      'Launch Platforms': 'Aircraft, surface ships, submarines, coastal',
      'Sea State': 'All weather, sea state 6',
    },
    capabilities: [
      'Active radar terminal homing',
      'Sea-skimming flight profile (3-5 m AGL)',
      'Pop-up terminal maneuver option',
      'Land attack capability (Block II+)',
      'Multi-platform launch compatibility',
      'All-weather day/night operation',
    ],
    operationalHistory: 'Combat use in Falklands War (1982), Gulf War (1991), and numerous other conflicts. Provided to Ukraine for coastal defense operations (2022).',
    comparableSystems: ['Exocet (France)', 'Kh-35 (Russia)', 'C-802 (China)', 'RBS-15 (Sweden)', 'NSM (Norway)'],
    engineeringPrinciples: ['Active radar seeker design', 'Sea-skimming aerodynamics', 'Terminal guidance algorithms', 'Turbojet propulsion'],
    tags: ['anti-ship', 'sea-skimming', 'active-radar', 'multi-platform'],
    imageUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663393397427/2sv9VgNDVmgCjc4JvJ9onP/missile-system-fj9TDyvW2EG5iJdi5YDc4X.webp',
  },
  {
    id: 'mk-48-torpedo',
    name: 'Mk 48 ADCAP',
    designation: 'Mk 48 Mod 7 ADCAP',
    category: 'weapon-systems',
    subCategory: 'torpedoes',
    country: 'United States',
    inService: '1972–Present',
    description: 'The primary heavyweight torpedo of the US Navy, designed to defeat fast, deep-diving nuclear submarines and high-value surface targets.',
    overview: 'The Mark 48 Advanced Capability (ADCAP) torpedo is the most capable heavyweight torpedo in the Western inventory. Wire-guided with active/passive acoustic homing, the Mk 48 can engage targets at depths exceeding 800 meters and speeds over 55 knots. The Mod 7 variant incorporates Common Broadband Advanced Sonar System (CBASS) for improved performance against quiet diesel-electric submarines.',
    specifications: {
      'Length': '5.79 m (19 ft)',
      'Diameter': '533 mm (21 in)',
      'Weight': '1,676 kg (3,695 lb)',
      'Range': '38+ km at 55 knots',
      'Speed': '55+ knots',
      'Depth': '800+ m operating depth',
      'Guidance': 'Wire-guided + active/passive acoustic homing',
      'Warhead': '295 kg PBXN-103 high explosive',
      'Propulsion': 'Otto fuel II / piston engine',
      'Launch Platform': 'Submarines (533mm tubes)',
    },
    capabilities: [
      'Wire-guided mid-course correction',
      'Active/passive acoustic terminal homing',
      'Anti-submarine and anti-surface capability',
      'Deep-water engagement capability',
      'CBASS broadband acoustic processing',
      'Countermeasure resistance',
    ],
    operationalHistory: 'Entered service 1972. ADCAP variant from 1988. Continuous upgrades through Mod 6/7 variants. Primary torpedo of US Navy and numerous allied navies.',
    comparableSystems: ['Spearfish (UK)', 'DM2A4 (Germany)', 'F21 Artemis (France)', 'Type 89 (Japan)'],
    engineeringPrinciples: ['Acoustic homing signal processing', 'Otto fuel II propulsion chemistry', 'Wire guidance data link', 'Shaped charge warhead physics'],
    tags: ['torpedo', 'heavyweight', 'wire-guided', 'acoustic-homing'],
    imageUrl: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&q=80',
  },
  {
    id: 'phalanx-ciws',
    name: 'Phalanx CIWS',
    designation: 'Mk 15 Phalanx',
    category: 'weapon-systems',
    subCategory: 'ciws',
    country: 'United States',
    inService: '1980–Present',
    description: 'Autonomous close-in weapon system providing last-ditch defense against anti-ship missiles and aircraft.',
    overview: 'The Phalanx Close-In Weapon System (CIWS) is a rapid-fire, computer-controlled, radar-guided gun system designed to defeat anti-ship missiles and other close-in air threats. The Block 1B variant adds surface mode capability for engaging small boat threats. Phalanx operates in a fully automatic "fire control loop" — detect, track, engage, and assess — without human intervention, making it suitable for saturation attack scenarios.',
    specifications: {
      'Caliber': '20mm M61A1 Vulcan',
      'Rate of Fire': '4,500 rounds/min',
      'Effective Range': '1.5 km (anti-missile)',
      'Muzzle Velocity': '1,100 m/s',
      'Ammunition': '1,550 rounds (ready)',
      'Radar': 'Ku-band search + track',
      'Reaction Time': '<2 seconds',
      'Weight': '6,200 kg',
      'Elevation': '-25° to +85°',
      'Traverse': '±150°',
    },
    capabilities: [
      'Fully autonomous fire control',
      'Anti-missile terminal defense',
      'Anti-aircraft capability',
      'Surface mode (small boat threats, Block 1B)',
      'Simultaneous search and track',
      'Closed-loop spotting (miss distance assessment)',
    ],
    operationalHistory: 'Operated by 24+ navies. Combat use in Persian Gulf operations. Credited with defeating multiple anti-ship missile attacks. Also deployed on land as C-RAM system.',
    comparableSystems: ['Goalkeeper (Netherlands)', 'AK-630 (Russia)', 'Type 730 (China)', 'Meroka (Spain)', 'RAM (US/Germany)'],
    engineeringPrinciples: ['Closed-loop fire control', 'Ku-band radar tracking', 'Gatling gun mechanics', 'Kinetic energy defeat mechanism'],
    tags: ['CIWS', 'close-in', 'autonomous', 'anti-missile', 'gatling'],
    imageUrl: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&q=80',
  },

  // ── DETECTION SYSTEMS ─────────────────────────────────────────────
  {
    id: 'an-spy-6-amdr',
    name: 'AN/SPY-6(V) AMDR',
    designation: 'AN/SPY-6(V)1',
    category: 'detection-systems',
    subCategory: 'radar',
    country: 'United States',
    inService: '2021–Present',
    description: 'The most advanced naval radar system in the world, providing unprecedented detection range and discrimination capability for ballistic missile defense.',
    overview: 'The AN/SPY-6(V) Air and Missile Defense Radar (AMDR) represents a generational leap over the AN/SPY-1D it replaces on Flight III Arleigh Burke destroyers. Using Gallium Nitride (GaN) solid-state transmit/receive modules, the SPY-6 achieves 35 times the sensitivity of SPY-1D, enabling detection of smaller targets at greater ranges. The modular design uses Radar Modular Assemblies (RMAs) that can be scaled to different ship classes.',
    specifications: {
      'Frequency Band': 'S-band (2-4 GHz)',
      'Detection Range': '1,000+ km (classified)',
      'Sensitivity': '35× improvement over SPY-1D',
      'Technology': 'GaN solid-state AESA',
      'Tracking Capacity': '1,000+ simultaneous tracks',
      'Scanning Type': 'Active electronically scanned array',
      'RMA Size': '0.9 m × 0.9 m modules',
      'Array Configuration': '37 RMAs (DDG-51 Flt III)',
      'Power': 'Solid-state (no high-voltage)',
      'Cooling': 'Liquid cooling system',
    },
    capabilities: [
      'Ballistic missile defense discrimination',
      'Hypersonic glide vehicle tracking',
      'Low-observable target detection',
      'Electronic protection (ECCM)',
      'Simultaneous search, track, and fire control',
      'Scalable modular architecture',
    ],
    operationalHistory: 'First installed on USS Jack H. Lucas (DDG-125), commissioned 2023. Backfit program for earlier Flight IIA ships planned. Also selected for CVN-78 Ford-class carriers.',
    comparableSystems: ['SMART-L MM/N (Netherlands)', 'SAMPSON (UK)', 'Herakles (France)', 'APAR (Germany/Netherlands)'],
    engineeringPrinciples: ['GaN semiconductor physics', 'Active electronically scanned array (AESA)', 'Digital beamforming', 'Clutter rejection algorithms'],
    tags: ['AESA', 'radar', 'BMD', 'GaN', 'phased-array'],
    imageUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663393397427/2sv9VgNDVmgCjc4JvJ9onP/radar-system-2RiCELzpdBWDGFKe5jbDAx.webp',
  },
  {
    id: 'an-bqq-10-sonar',
    name: 'AN/BQQ-10 Sonar',
    designation: 'AN/BQQ-10 ARCI',
    category: 'detection-systems',
    subCategory: 'sonar',
    country: 'United States',
    inService: '1997–Present',
    description: 'Advanced submarine sonar suite providing broadband and narrowband detection of undersea threats across multiple array configurations.',
    overview: 'The AN/BQQ-10 Acoustic Rapid COTS Insertion (ARCI) sonar system is the primary sonar suite for US Navy nuclear submarines. Combining a Large Aperture Bow (LAB) array, a conformal array, towed arrays, and a high-frequency active sonar, the BQQ-10 provides comprehensive underwater situational awareness. The ARCI designation reflects its use of commercial off-the-shelf computing hardware, enabling rapid capability upgrades.',
    specifications: {
      'Array Types': 'Bow (LAB), Conformal, Towed (TB-16/29/33)',
      'Frequency Range': '0.1 Hz – 100 kHz',
      'Detection Mode': 'Passive broadband + narrowband',
      'Active Mode': 'High-frequency active (HFA)',
      'Processing': 'COTS-based signal processing',
      'Towed Array Length': '240 m (TB-29)',
      'Aperture': 'Large Aperture Bow (LAB)',
      'Classification': 'Automated target recognition',
      'Integration': 'AN/BSY-2 combat system',
      'Upgrade Path': 'ARCI spiral development',
    },
    capabilities: [
      'Long-range passive detection',
      'Narrowband frequency line analysis',
      'Broadband transient detection',
      'High-frequency active sonar',
      'Towed array beamforming',
      'Automated target classification',
    ],
    operationalHistory: 'Installed across Virginia and Los Angeles class submarines. Continuous spiral upgrades through ARCI program. Classified performance data.',
    comparableSystems: ['Sonar 2076 (UK)', 'DMUX 80 (France)', 'Atlas Elektronik DBQS (Germany)', 'MGK-540 (Russia)'],
    engineeringPrinciples: ['Acoustic wave propagation physics', 'Beamforming signal processing', 'Narrowband spectral analysis', 'Passive sonar detection theory'],
    tags: ['sonar', 'submarine', 'passive', 'broadband', 'towed-array'],
    imageUrl: 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=800&q=80',
  },
  {
    id: 'an-slq-32-ew',
    name: 'AN/SLQ-32(V)',
    designation: 'AN/SLQ-32(V)6 SEWIP',
    category: 'detection-systems',
    subCategory: 'electronic-warfare',
    country: 'United States',
    inService: '1979–Present',
    description: 'Surface ship electronic warfare system providing threat warning, electronic support, and electronic attack capabilities.',
    overview: 'The AN/SLQ-32 Surface Electronic Warfare Improvement Program (SEWIP) is the primary electronic warfare system for US Navy surface combatants. Block 3 (SEWIP Block 3) adds active electronic attack capability, allowing ships to jam and deceive incoming anti-ship missiles. The system intercepts, identifies, and responds to radar emissions across a wide frequency range, providing both defensive and offensive electronic warfare capabilities.',
    specifications: {
      'Frequency Coverage': '0.5 – 40 GHz (estimated)',
      'Functions': 'ESM, ECM, ECCM',
      'Detection': 'Instantaneous frequency measurement',
      'Jamming': 'Active (Block 3)',
      'Processing': 'Digital signal processing',
      'Reaction Time': '<1 second',
      'Integration': 'Ship Combat System',
      'Antennas': 'Phased array (Block 3)',
      'Variants': 'Block 1/2/3 (SEWIP)',
      'Platform': 'Surface combatants, amphibious ships',
    },
    capabilities: [
      'Electronic support measures (ESM)',
      'Radar warning receiver',
      'Active jamming (Block 3)',
      'Deception jamming',
      'Anti-ship missile defense',
      'Emitter identification library',
    ],
    operationalHistory: 'Continuous upgrades since 1979. SEWIP Block 2 provides enhanced ESM. Block 3 active jamming capability deployed from 2019 onwards.',
    comparableSystems: ['RESM/CESM (UK)', 'ARBR-21 (France)', 'FL-1800 (China)', 'TK-25 (Russia)'],
    engineeringPrinciples: ['Radar intercept and analysis', 'Electronic attack waveform generation', 'Frequency agile jamming', 'Emitter fingerprinting'],
    tags: ['electronic-warfare', 'EW', 'jamming', 'ESM', 'SEWIP'],
    imageUrl: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?w=800&q=80',
  },

  // ── PROPULSION SYSTEMS ────────────────────────────────────────────
  {
    id: 'ge-lm2500-gas-turbine',
    name: 'LM2500 Gas Turbine',
    designation: 'GE LM2500-30/+G4',
    category: 'propulsion-systems',
    subCategory: 'gas-turbine',
    country: 'United States',
    inService: '1969–Present',
    description: 'The world\'s most widely used naval gas turbine, powering over 500 ships across 35 navies worldwide.',
    overview: 'The General Electric LM2500 is a marine gas turbine derived from the CF6 aircraft engine. Its combination of high power density, reliability, and rapid startup capability has made it the standard propulsion plant for Western naval surface combatants. The LM2500+G4 variant produces 35,300 shp, enabling destroyers and frigates to achieve speeds exceeding 30 knots. The engine can reach full power from cold start in under 2 minutes.',
    specifications: {
      'Power Output': '35,300 shp (LM2500+G4)',
      'Thermal Efficiency': '39% (simple cycle)',
      'Fuel': 'F-76 naval distillate / JP-5',
      'Startup Time': '<2 minutes to full power',
      'Weight': '5,500 kg (bare engine)',
      'Length': '6.9 m',
      'Diameter': '2.4 m',
      'Compressor Stages': '16-stage axial',
      'Turbine Stages': '2-stage HP + 6-stage power',
      'TBO': '25,000 hours',
    },
    capabilities: [
      'Rapid acceleration to full power',
      'High power-to-weight ratio',
      'COGAG/CODAG/CODOG configurations',
      'Low maintenance requirements',
      'Aircraft engine heritage reliability',
      'Modular maintenance design',
    ],
    operationalHistory: 'Powers Arleigh Burke destroyers (4× LM2500-30), Ticonderoga cruisers, Oliver Hazard Perry frigates, and numerous international warships. Over 500 ships in 35+ navies.',
    comparableSystems: ['Rolls-Royce MT30 (UK)', 'Zorya-Mashproekt UGT25000 (Ukraine)', 'Rolls-Royce Olympus TM3B', 'GE LM6000'],
    engineeringPrinciples: ['Brayton cycle thermodynamics', 'Axial compressor aerodynamics', 'Combustion chamber design', 'Power turbine matching'],
    tags: ['gas-turbine', 'propulsion', 'COGAG', 'high-power-density'],
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  },
  {
    id: 'a1b-nuclear-reactor',
    name: 'A1B Naval Reactor',
    designation: 'A1B PWR',
    category: 'propulsion-systems',
    subCategory: 'nuclear',
    country: 'United States',
    inService: '2017–Present',
    description: 'Next-generation pressurized water reactor powering the Gerald R. Ford class aircraft carriers, delivering 25% more power than the A4W.',
    overview: 'The A1B reactor is the most advanced naval nuclear propulsion plant in service. Designed by Bechtel Naval Reactors for the Ford class, it produces approximately 700 MW of electrical power — 25% more than the A4W reactors in Nimitz-class carriers. This additional power enables the Electromagnetic Aircraft Launch System (EALS) and Advanced Arresting Gear (AAG). The A1B requires fewer personnel to operate and has a longer core life than its predecessor.',
    specifications: {
      'Type': 'Pressurized Water Reactor (PWR)',
      'Quantity': '2 per ship',
      'Power Output': '~700 MW (electrical)',
      'Increase over A4W': '+25% power',
      'Core Life': 'Designed for ship life (50 years)',
      'Fuel': 'Highly enriched uranium',
      'Coolant': 'Pressurized light water',
      'Steam Generators': 'Integral design',
      'Personnel': 'Reduced vs. A4W',
      'Refueling': 'None planned (life-of-ship core)',
    },
    capabilities: [
      'Unlimited range (fuel not limiting factor)',
      'Powers EALS electromagnetic catapults',
      'Powers Advanced Arresting Gear',
      'Life-of-ship core (no mid-life refueling)',
      'Reduced crew requirement',
      'Enhanced survivability (no fuel vulnerability)',
    ],
    operationalHistory: 'Two reactors installed in USS Gerald R. Ford (CVN-78), commissioned 2017. Will power all Ford-class carriers. Classified performance details.',
    comparableSystems: ['A4W (Nimitz-class)', 'S9G (Virginia-class SSN)', 'K-15 (France, Charles de Gaulle)', 'OK-650 (Russia, Yasen-class)'],
    engineeringPrinciples: ['Pressurized water reactor physics', 'Nuclear fission chain reaction', 'Steam Rankine cycle', 'Radiation shielding design'],
    tags: ['nuclear', 'reactor', 'PWR', 'aircraft-carrier', 'unlimited-range'],
    imageUrl: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80',
  },
  {
    id: 'type-212-diesel-electric',
    name: 'Type 212A Propulsion',
    designation: 'HDW Type 212A AIP',
    category: 'propulsion-systems',
    subCategory: 'diesel-electric',
    country: 'Germany',
    inService: '2005–Present',
    description: 'Advanced Air-Independent Propulsion (AIP) system combining diesel-electric with hydrogen fuel cells for ultra-quiet extended submerged operations.',
    overview: 'The Type 212A submarine\'s propulsion system represents the pinnacle of non-nuclear submarine technology. The Siemens Permasyn motor drives the boat on battery power for high-speed sprints, while the HDW/Siemens fuel cell system provides silent, vibration-free propulsion for extended periods. The fuel cell AIP system can sustain the submarine submerged for up to two weeks without snorkeling, making it virtually undetectable.',
    specifications: {
      'Diesel Engines': '2× MTU 16V-396 SE84 (2,800 kW each)',
      'Fuel Cells': '9× Siemens PEM fuel cells (30-50 kW each)',
      'Main Motor': 'Siemens Permasyn (1 shaft)',
      'Motor Power': '3,120 kW',
      'AIP Endurance': '14+ days submerged',
      'Hydrogen Storage': 'Metal hydride tanks',
      'Oxygen Storage': 'Liquid oxygen (LOX)',
      'Submerged Speed': '20 knots (sprint)',
      'AIP Speed': '8 knots (silent)',
      'Battery': 'Lead-acid (Li-ion in Type 212CD)',
    },
    capabilities: [
      'Air-independent propulsion (no snorkeling)',
      'Ultra-low acoustic signature',
      'Extended submerged endurance',
      'Zero exhaust emissions (fuel cell mode)',
      'Rapid battery recharge via diesel',
      'Vibration-free propulsion',
    ],
    operationalHistory: 'Operated by German and Italian navies. Type 212CD variant for Norway and Germany adds lithium-ion batteries and extended range. Considered the quietest conventional submarine in service.',
    comparableSystems: ['Gotland-class (Sweden, Stirling AIP)', 'Soryu-class (Japan, Stirling AIP)', 'S-80 Plus (Spain, biofuel AIP)', 'Dolphin II (Israel)'],
    engineeringPrinciples: ['PEM fuel cell electrochemistry', 'Metal hydride hydrogen storage', 'Permanent magnet motor design', 'Acoustic signature management'],
    tags: ['AIP', 'fuel-cell', 'diesel-electric', 'ultra-quiet', 'submarine'],
    imageUrl: 'https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=800&q=80',
  },
];

export function getSystemsByCategory(category: SystemCategory): NavalSystem[] {
  return navalSystems.filter(s => s.category === category);
}

export function getSystemsBySubCategory(subCategory: SystemSubCategory): NavalSystem[] {
  return navalSystems.filter(s => s.subCategory === subCategory);
}

export function getSystemById(id: string): NavalSystem | undefined {
  return navalSystems.find(s => s.id === id);
}

export function searchSystems(query: string): NavalSystem[] {
  const q = query.toLowerCase();
  return navalSystems.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.designation.toLowerCase().includes(q) ||
    s.description.toLowerCase().includes(q) ||
    s.tags.some(t => t.includes(q)) ||
    s.country.toLowerCase().includes(q)
  );
}

export const AI_RESPONSES: Record<string, string> = {
  default: `I am the Naval Defense Intelligence Assistant. I can help you understand and compare maritime defense systems, explain technical specifications, and provide engineering analysis.

**Example queries:**
- "Compare AEGIS with other combat management systems"
- "How does phased-array radar work?"
- "Explain nuclear vs. diesel-electric submarine propulsion"
- "What are the advantages of AIP submarines?"`,

  aegis: `## AEGIS Combat System Analysis

The **AEGIS Combat System** (AN/SPY-1/SPY-6) is the world's most capable naval integrated air defense system. It combines:

**Core Architecture:**
- **AN/SPY-1D/SPY-6 Phased Array Radar** — simultaneous 360° search and track
- **Mk 41 Vertical Launch System** — 96 cells for SM-2/3/6, ESSM, Tomahawk
- **Command and Decision System** — automated threat evaluation and weapon assignment

**Versus Comparable Systems:**
| System | Country | Radar | Key Advantage |
|--------|---------|-------|---------------|
| AEGIS (SPY-6) | USA | AESA GaN | BMD, 35× sensitivity |
| PAAMS (SAMPSON) | UK/France/Italy | AESA | Compact, frigate-sized |
| SMART-L MM/N | Netherlands | AESA | Long-range volume search |
| HHQ-9B/346B | China | AESA | Claimed 400km range |

**AEGIS Unique Capability:** Ballistic Missile Defense (BMD) — the SM-3 can intercept ballistic missiles in the exo-atmosphere at altitudes exceeding 500 km.`,

  phased_array: `## Phased-Array Radar: Engineering Principles

A **phased-array radar** achieves electronic beam steering by controlling the phase of signals emitted from hundreds or thousands of individual antenna elements.

**Operating Principle:**
1. Each antenna element has an independent phase shifter
2. By introducing progressive phase delays across the array, the wavefront is tilted
3. The beam steers to the direction of constructive interference
4. No mechanical movement required — beam can jump anywhere in <1 millisecond

**Key Advantages over Mechanically Scanned Radar:**
- **Beam agility**: Can track 1,000+ targets simultaneously
- **Reliability**: No moving parts to fail
- **Electronic counter-countermeasures**: Frequency agility, waveform diversity
- **Multi-function**: Simultaneous search, track, and fire control

**AESA vs. PESA:**
- **PESA** (Passive): Single transmitter, passive phase shifters (AN/SPY-1)
- **AESA** (Active): Each element has its own T/R module (AN/SPY-6, SAMPSON)
- AESA provides 10-100× improvement in sensitivity and reliability`,

  submarine_propulsion: `## Nuclear vs. Diesel-Electric Submarine Propulsion

### Nuclear Propulsion (e.g., Virginia-class SSN)
**Advantages:**
- Unlimited range — no fuel constraint
- Sustained high speed (25+ knots submerged indefinitely)
- No need to surface or snorkel
- Large crew and weapon load capacity

**Disadvantages:**
- Extremely expensive ($3.4B per Virginia-class)
- Requires highly trained nuclear personnel
- Acoustic signature from reactor coolant pumps
- Complex maintenance and refueling

### Diesel-Electric with AIP (e.g., Type 212A)
**Advantages:**
- Extremely quiet — near-zero acoustic signature on AIP
- Lower cost ($500M per Type 212A)
- Simpler maintenance
- Ideal for littoral/coastal operations

**Disadvantages:**
- Limited range and endurance
- Must snorkel periodically (diesel only)
- Lower speed than nuclear boats
- Smaller weapons load

### Strategic Conclusion
Nuclear submarines dominate **blue-water** operations requiring sustained high-speed transit and global reach. AIP submarines excel in **littoral** environments where stealth is paramount and range requirements are limited.`,
};
