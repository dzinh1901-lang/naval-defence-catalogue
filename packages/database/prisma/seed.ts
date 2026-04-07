import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ids = {
  orgPrimary: 'org-naval-systems-command',
  orgSecondary: 'org-oceanic-research-directorate',
  userAdmin: 'user-cmdr-lee',
  userEngineer: 'user-dr-chen',
  userAnalyst: 'user-p-kowalski',
  userArchitect: 'user-lt-singh',
  projectPrimary: 'proj-type-52-frigate',
  projectSecondary: 'proj-bluewater-corvette-study',
  twinPrimary: 'twin-t52-baseline',
  subsystemCombat: 'ss-combat',
  subsystemRadar: 'ss-radar',
  subsystemVls: 'ss-vls',
  subsystemCic: 'ss-cic',
  subsystemPropulsion: 'ss-propulsion',
  subsystemEngines: 'ss-engines',
  subsystemElectricDrive: 'ss-electric-drive',
  subsystemShaft: 'ss-shaft',
  subsystemPlatform: 'ss-platform',
  subsystemHull: 'ss-hull',
  subsystemPowerCooling: 'ss-power-cooling',
  subsystemMissionBay: 'ss-mission-bay',
  simulationEnvelope: 'sim-propulsion-envelope',
  simulationRunLatest: 'simrun-propulsion-envelope-20260331',
  reviewCms: 'review-cms-integration',
  evidenceArch: 'evidence-cms-architecture',
  evidenceRadar: 'evidence-radar-latency',
  viewConfig: 'workspace-view-t52',
} as const;

async function main() {
  console.log('Seeding Naval Digital Twin Platform workspace dataset...');

  await seedOrganizations();
  await seedUsers();
  await seedOrganizationMembers();
  await seedProjects();
  await seedProjectMembers();
  await seedTwins();
  await seedSubsystems();
  await seedInterfaces();
  await seedRequirements();
  await seedVariants();
  await seedSimulation();
  await seedReview();
  await seedAuditEvents();
  await seedWorkspaceAssets();

  console.log('Seed complete.');
}

async function seedOrganizations() {
  await prisma.organization.upsert({
    where: { id: ids.orgPrimary },
    update: {
      name: 'Naval Systems Command',
      slug: 'naval-systems-command',
      plan: 'ENTERPRISE',
    },
    create: {
      id: ids.orgPrimary,
      name: 'Naval Systems Command',
      slug: 'naval-systems-command',
      plan: 'ENTERPRISE',
    },
  });

  await prisma.organization.upsert({
    where: { id: ids.orgSecondary },
    update: {
      name: 'Oceanic Research Directorate',
      slug: 'oceanic-research-directorate',
      plan: 'PROFESSIONAL',
    },
    create: {
      id: ids.orgSecondary,
      name: 'Oceanic Research Directorate',
      slug: 'oceanic-research-directorate',
      plan: 'PROFESSIONAL',
    },
  });
}

async function seedUsers() {
  await prisma.user.upsert({
    where: { id: ids.userAdmin },
    update: {},
    create: {
      id: ids.userAdmin,
      email: 'cmdr.lee@naval-systems.dev',
      name: 'Commander S. Lee',
      title: 'Program Director',
      passwordHash: null,
    },
  });

  await prisma.user.upsert({
    where: { id: ids.userEngineer },
    update: {},
    create: {
      id: ids.userEngineer,
      email: 'eng.chen@naval-systems.dev',
      name: 'Dr. M. Chen',
      title: 'Hydrodynamics Lead',
      passwordHash: null,
    },
  });

  await prisma.user.upsert({
    where: { id: ids.userAnalyst },
    update: {},
    create: {
      id: ids.userAnalyst,
      email: 'analyst.kowalski@naval-systems.dev',
      name: 'P. Kowalski',
      title: 'Systems Analyst',
      passwordHash: null,
    },
  });

  await prisma.user.upsert({
    where: { id: ids.userArchitect },
    update: {},
    create: {
      id: ids.userArchitect,
      email: 'lt.singh@naval-systems.dev',
      name: 'Lt. A. Singh',
      title: 'Platform Architect',
      passwordHash: null,
    },
  });
}

async function seedOrganizationMembers() {
  const memberships = [
    { organizationId: ids.orgPrimary, userId: ids.userAdmin, role: 'ADMIN' as const },
    { organizationId: ids.orgPrimary, userId: ids.userEngineer, role: 'MEMBER' as const },
    { organizationId: ids.orgPrimary, userId: ids.userAnalyst, role: 'VIEWER' as const },
    { organizationId: ids.orgPrimary, userId: ids.userArchitect, role: 'MEMBER' as const },
    { organizationId: ids.orgSecondary, userId: ids.userAnalyst, role: 'ADMIN' as const },
  ];

  for (const membership of memberships) {
    await prisma.organizationMember.upsert({
      where: {
        organizationId_userId: {
          organizationId: membership.organizationId,
          userId: membership.userId,
        },
      },
      update: { role: membership.role },
      create: membership,
    });
  }
}

async function seedProjects() {
  await prisma.project.upsert({
    where: { id: ids.projectPrimary },
    update: {
      name: 'Type 52 Guided Missile Frigate',
      slug: 'type-52-frigate',
      description:
        'Flagship engineering programme for a multi-mission surface combatant digital twin and design studio workspace.',
      status: 'ACTIVE',
      organizationId: ids.orgPrimary,
    },
    create: {
      id: ids.projectPrimary,
      name: 'Type 52 Guided Missile Frigate',
      slug: 'type-52-frigate',
      description:
        'Flagship engineering programme for a multi-mission surface combatant digital twin and design studio workspace.',
      status: 'ACTIVE',
      organizationId: ids.orgPrimary,
    },
  });

  await prisma.project.upsert({
    where: { id: ids.projectSecondary },
    update: {
      name: 'Bluewater Corvette Concept Study',
      slug: 'bluewater-corvette-study',
      description: 'Fast-turn concept study for a low-signature corvette mission package.',
      status: 'DRAFT',
      organizationId: ids.orgSecondary,
    },
    create: {
      id: ids.projectSecondary,
      name: 'Bluewater Corvette Concept Study',
      slug: 'bluewater-corvette-study',
      description: 'Fast-turn concept study for a low-signature corvette mission package.',
      status: 'DRAFT',
      organizationId: ids.orgSecondary,
    },
  });
}

async function seedProjectMembers() {
  await prisma.projectMember.deleteMany({ where: { projectId: ids.projectPrimary } });

  await prisma.projectMember.createMany({
    data: [
      { projectId: ids.projectPrimary, userId: ids.userAdmin, role: 'ADMIN' },
      { projectId: ids.projectPrimary, userId: ids.userEngineer, role: 'MEMBER' },
      { projectId: ids.projectPrimary, userId: ids.userAnalyst, role: 'VIEWER' },
      { projectId: ids.projectPrimary, userId: ids.userArchitect, role: 'MEMBER' },
    ],
  });
}

async function seedTwins() {
  await prisma.digitalTwin.upsert({
    where: { id: ids.twinPrimary },
    update: {
      name: 'T52 Baseline Digital Twin',
      description:
        'Primary single-ship workspace for the Type 52 programme, tuned for layout review, subsystem inspection, and studio iteration.',
      version: '2.4.1',
      status: 'ACTIVE',
      hullCode: 'FFG-218',
      className: 'Type 52 Guided Missile Frigate',
      runtimeStatus: 'Sea trial replay',
      syncStatus: 'SYNCED',
      lastSyncedAt: new Date('2026-03-31T23:48:00Z'),
      locationLabel: 'Philippine Sea · 14°32′N / 124°06′E',
      missionProfile: 'Carrier escort · Littoral air defence',
      projectId: ids.projectPrimary,
    },
    create: {
      id: ids.twinPrimary,
      name: 'T52 Baseline Digital Twin',
      description:
        'Primary single-ship workspace for the Type 52 programme, tuned for layout review, subsystem inspection, and studio iteration.',
      version: '2.4.1',
      status: 'ACTIVE',
      hullCode: 'FFG-218',
      className: 'Type 52 Guided Missile Frigate',
      runtimeStatus: 'Sea trial replay',
      syncStatus: 'SYNCED',
      lastSyncedAt: new Date('2026-03-31T23:48:00Z'),
      locationLabel: 'Philippine Sea · 14°32′N / 124°06′E',
      missionProfile: 'Carrier escort · Littoral air defence',
      projectId: ids.projectPrimary,
    },
  });
}

async function seedSubsystems() {
  const subsystems = [
    {
      id: ids.subsystemCombat,
      name: 'Combat Management System',
      identifier: 'SYS-CMS',
      description: 'Sensor fusion, tactical decision aids, and weapons coordination.',
      depth: 0,
      status: 'DEFINED' as const,
      parentId: null,
    },
    {
      id: ids.subsystemRadar,
      name: 'Integrated Sensor Mast',
      identifier: 'SYS-CMS-RDR',
      description: 'AESA radar, EO/IR, and ESM package in the upper mast.',
      depth: 1,
      status: 'VERIFIED' as const,
      parentId: ids.subsystemCombat,
    },
    {
      id: ids.subsystemVls,
      name: 'Vertical Launch Battery',
      identifier: 'SYS-CMS-VLS',
      description: 'Forward strike cell array with thermal and launcher health telemetry.',
      depth: 1,
      status: 'DEFINED' as const,
      parentId: ids.subsystemCombat,
    },
    {
      id: ids.subsystemCic,
      name: 'Bridge and CIC Network',
      identifier: 'SYS-CMS-CIC',
      description: 'Navigation bridge, combat information centre, and data-link backbone.',
      depth: 1,
      status: 'DEFINED' as const,
      parentId: ids.subsystemCombat,
    },
    {
      id: ids.subsystemPropulsion,
      name: 'Propulsion Plant',
      identifier: 'SYS-PROP',
      description: 'CODLAG propulsion envelope with shaft-line and vibration monitoring.',
      depth: 0,
      status: 'VERIFIED' as const,
      parentId: null,
    },
    {
      id: ids.subsystemEngines,
      name: 'Gas Turbine Modules',
      identifier: 'SYS-PROP-GTM',
      description: 'Sprint mode MT30 gas turbines.',
      depth: 1,
      status: 'VERIFIED' as const,
      parentId: ids.subsystemPropulsion,
    },
    {
      id: ids.subsystemElectricDrive,
      name: 'Electric Drive Pods',
      identifier: 'SYS-PROP-EPD',
      description: 'Quiet electric propulsion for patrol and ASW approach profiles.',
      depth: 1,
      status: 'DEFINED' as const,
      parentId: ids.subsystemPropulsion,
    },
    {
      id: ids.subsystemShaft,
      name: 'Shaft Line Monitoring',
      identifier: 'SYS-PROP-SFT',
      description: 'Bearing temperature, torque, and vibration instrumentation.',
      depth: 1,
      status: 'DEFINED' as const,
      parentId: ids.subsystemPropulsion,
    },
    {
      id: ids.subsystemPlatform,
      name: 'Platform Systems',
      identifier: 'SYS-PLT',
      description: 'Hull, survivability, and mission support services.',
      depth: 0,
      status: 'DEFINED' as const,
      parentId: null,
    },
    {
      id: ids.subsystemHull,
      name: 'Hull and Signature Management',
      identifier: 'SYS-PLT-HSM',
      description: 'Composite structures, IR treatment, and radar cross-section shaping.',
      depth: 1,
      status: 'DEFINED' as const,
      parentId: ids.subsystemPlatform,
    },
    {
      id: ids.subsystemPowerCooling,
      name: 'Power and Cooling Loop',
      identifier: 'SYS-PLT-PCL',
      description: 'Integrated chilled water and power conditioning for mission systems.',
      depth: 1,
      status: 'DEFINED' as const,
      parentId: ids.subsystemPlatform,
    },
    {
      id: ids.subsystemMissionBay,
      name: 'Mission Bay Automation',
      identifier: 'SYS-PLT-MBA',
      description: 'Autonomous handling for RHIB, UAV, and mission container support.',
      depth: 1,
      status: 'DRAFT' as const,
      parentId: ids.subsystemPlatform,
    },
  ];

  for (const subsystem of subsystems) {
    await prisma.subsystem.upsert({
      where: { id: subsystem.id },
      update: { ...subsystem, twinId: ids.twinPrimary },
      create: { ...subsystem, twinId: ids.twinPrimary },
    });
  }
}

async function seedInterfaces() {
  await prisma.interface.deleteMany({
    where: {
      subsystemId: {
        in: [
          ids.subsystemRadar,
          ids.subsystemVls,
          ids.subsystemCic,
          ids.subsystemShaft,
          ids.subsystemPowerCooling,
        ],
      },
    },
  });

  await prisma.interface.createMany({
    data: [
      {
        name: 'AESA track feed',
        description: 'Track updates from the integrated mast to the combat manager.',
        protocol: 'DDS/RTPS',
        direction: 'OUTPUT',
        subsystemId: ids.subsystemRadar,
      },
      {
        name: 'Launcher thermal telemetry',
        description: 'Thermal and hatch-status stream from the VLS battery.',
        protocol: 'MIL-STD-1553B',
        direction: 'OUTPUT',
        subsystemId: ids.subsystemVls,
      },
      {
        name: 'Bridge/CIC tactical bus',
        description: 'Shared operational picture and tactical messaging between bridge and CIC.',
        protocol: 'TSN Ethernet',
        direction: 'BIDIRECTIONAL',
        subsystemId: ids.subsystemCic,
      },
      {
        name: 'Shaft vibration profile',
        description: 'Bearing vibration and torque data from the shaft monitoring package.',
        protocol: 'OPC-UA',
        direction: 'OUTPUT',
        subsystemId: ids.subsystemShaft,
      },
      {
        name: 'Cooling demand arbitration',
        description: 'Priority loop control between combat loads and propulsion support systems.',
        protocol: 'Modbus TCP',
        direction: 'BIDIRECTIONAL',
        subsystemId: ids.subsystemPowerCooling,
      },
    ],
  });
}

async function seedRequirements() {
  await prisma.requirement.deleteMany({
    where: {
      identifier: {
        in: ['REQ-001', 'REQ-002', 'REQ-003', 'REQ-004', 'REQ-005', 'REQ-006', 'REQ-007', 'REQ-008'],
      },
    },
  });

  await prisma.requirement.createMany({
    data: [
      {
        identifier: 'REQ-001',
        text: 'The integrated sensor mast SHALL maintain composite air track latency below 650 ms in Sea State 4.',
        rationale: 'Required for supersonic threat reaction margin.',
        priority: 'MUST',
        status: 'APPROVED',
        projectId: ids.projectPrimary,
        subsystemId: ids.subsystemRadar,
      },
      {
        identifier: 'REQ-002',
        text: 'The vertical launch battery SHALL sustain magazine thermal spread below 9°C during ripple-fire events.',
        rationale: 'Thermal stability is required to protect launcher reliability.',
        priority: 'MUST',
        status: 'REVIEW',
        projectId: ids.projectPrimary,
        subsystemId: ids.subsystemVls,
      },
      {
        identifier: 'REQ-003',
        text: 'The propulsion plant SHALL sustain 31 knots in Sea State 4 with acoustic margin above 6 dB.',
        rationale: 'Supports task-group sprint and quiet patrol transitions.',
        priority: 'MUST',
        status: 'APPROVED',
        projectId: ids.projectPrimary,
        subsystemId: ids.subsystemPropulsion,
      },
      {
        identifier: 'REQ-004',
        text: 'The bridge and CIC network SHALL recover tactical data-link services within 12 seconds after a segmented fault.',
        rationale: 'Maintains operational picture continuity during battle damage.',
        priority: 'MUST',
        status: 'APPROVED',
        projectId: ids.projectPrimary,
        subsystemId: ids.subsystemCic,
      },
      {
        identifier: 'REQ-005',
        text: 'The hull and signature management package SHOULD maintain IR plume reduction below the Type 52 baseline envelope.',
        rationale: 'Supports survivability against terminal seeker lock.',
        priority: 'SHOULD',
        status: 'DRAFT',
        projectId: ids.projectPrimary,
        subsystemId: ids.subsystemHull,
      },
      {
        identifier: 'REQ-006',
        text: 'The power and cooling loop SHALL isolate a damaged mission-system segment without loss of primary radar service.',
        rationale: 'Cooling continuity is critical for radar persistence.',
        priority: 'MUST',
        status: 'APPROVED',
        projectId: ids.projectPrimary,
        subsystemId: ids.subsystemPowerCooling,
      },
      {
        identifier: 'REQ-007',
        text: 'Mission bay automation MAY support autonomous UAV pallet exchange in under 18 minutes.',
        rationale: 'Desirable mission turnaround objective for modular payloads.',
        priority: 'MAY',
        status: 'DRAFT',
        projectId: ids.projectPrimary,
        subsystemId: ids.subsystemMissionBay,
      },
      {
        identifier: 'REQ-008',
        text: 'The shaft line monitoring package SHALL flag bearing vibration excursions above 4.5 mm/s within one telemetry cycle.',
        rationale: 'Protects propulsion survivability and predictive maintenance response.',
        priority: 'MUST',
        status: 'APPROVED',
        projectId: ids.projectPrimary,
        subsystemId: ids.subsystemShaft,
      },
    ],
  });
}

async function seedVariants() {
  await prisma.variant.deleteMany({ where: { twinId: ids.twinPrimary } });

  await prisma.variant.createMany({
    data: [
      {
        id: 'variant-baseline-aaw',
        name: 'Baseline AAW',
        description: 'Primary task-group escort loadout for the current engineering baseline.',
        isBaseline: true,
        twinId: ids.twinPrimary,
        configuration: {
          radarMode: 'VOLUME_SEARCH',
          launcherCellsReady: 48,
          missionBayPayload: 'UAV + RHIB',
        },
      },
      {
        id: 'variant-asw-escort',
        name: 'ASW Escort',
        description: 'ASW-biased configuration with enhanced quiet-drive posture.',
        isBaseline: false,
        twinId: ids.twinPrimary,
        configuration: {
          radarMode: 'HORIZON_TRACK',
          launcherCellsReady: 32,
          quietDrive: true,
          towedArray: 'CAPTAS-4',
        },
      },
      {
        id: 'variant-littoral-strike',
        name: 'Littoral Strike',
        description: 'Mission-bay heavy strike package for near-shore operations.',
        isBaseline: false,
        twinId: ids.twinPrimary,
        configuration: {
          radarMode: 'LITTORAL_FILTER',
          launcherCellsReady: 40,
          missionBayPayload: 'USV swarm package',
        },
      },
    ],
  });
}

async function seedSimulation() {
  await prisma.simulationRun.deleteMany({ where: { simulationId: ids.simulationEnvelope } });

  await prisma.simulation.upsert({
    where: { id: ids.simulationEnvelope },
    update: {
      name: 'Propulsion Performance Envelope',
      description: 'Dynamic sprint and endurance validation across sea states 3-5.',
      type: 'DYNAMIC',
      config: {
        seaStates: [3, 4, 5],
        speedRangeKnots: { min: 6, max: 32, step: 2 },
        model: 'CODLAG-MT30-v4',
      },
      twinId: ids.twinPrimary,
    },
    create: {
      id: ids.simulationEnvelope,
      name: 'Propulsion Performance Envelope',
      description: 'Dynamic sprint and endurance validation across sea states 3-5.',
      type: 'DYNAMIC',
      config: {
        seaStates: [3, 4, 5],
        speedRangeKnots: { min: 6, max: 32, step: 2 },
        model: 'CODLAG-MT30-v4',
      },
      twinId: ids.twinPrimary,
    },
  });

  await prisma.simulationRun.create({
    data: {
      id: ids.simulationRunLatest,
      status: 'COMPLETED',
      startedAt: new Date('2026-03-31T21:10:00Z'),
      completedAt: new Date('2026-03-31T21:46:00Z'),
      result: {
        readinessScore: 91,
        maxSpeed: 31.2,
        endurance16kt: 7180,
        acousticMarginDb: 7.8,
        hullStressMarginPct: 18,
        combatLatencyMs: 620,
      },
      simulationId: ids.simulationEnvelope,
      requestedById: ids.userEngineer,
    },
  });
}

async function seedReview() {
  await prisma.evidence.deleteMany({
    where: { id: { in: [ids.evidenceArch, ids.evidenceRadar] } },
  });

  await prisma.review.upsert({
    where: { id: ids.reviewCms },
    update: {
      title: 'CMS Integration Readiness Review',
      description: 'Focused review on mast latency, launcher thermal margins, and CIC failover posture.',
      type: 'COMPLIANCE',
      status: 'IN_REVIEW',
      projectId: ids.projectPrimary,
      createdById: ids.userAdmin,
    },
    create: {
      id: ids.reviewCms,
      title: 'CMS Integration Readiness Review',
      description: 'Focused review on mast latency, launcher thermal margins, and CIC failover posture.',
      type: 'COMPLIANCE',
      status: 'IN_REVIEW',
      projectId: ids.projectPrimary,
      createdById: ids.userAdmin,
    },
  });

  await prisma.evidence.createMany({
    data: [
      {
        id: ids.evidenceArch,
        title: 'CMS architecture pack v4.2',
        description: 'Updated bridge/CIC failover and tactical bus partitioning package.',
        type: 'DOCUMENT',
        uri: 's3://naval-dt-dev/reviews/cms-architecture-v4-2.pdf',
        reviewId: ids.reviewCms,
      },
      {
        id: ids.evidenceRadar,
        title: 'Radar latency replay set',
        description: 'AESA timing replay dataset from sea-state four mission rehearsal.',
        type: 'SIMULATION_RESULT',
        uri: 's3://naval-dt-dev/reviews/radar-latency-replay-set.json',
        reviewId: ids.reviewCms,
      },
    ],
  });
}

async function seedAuditEvents() {
  await prisma.auditEvent.deleteMany({
    where: {
      entityId: {
        in: [ids.projectPrimary, ids.twinPrimary, ids.reviewCms],
      },
    },
  });

  await prisma.auditEvent.createMany({
    data: [
      {
        action: 'PROJECT_REFRESH',
        entity: 'Project',
        entityId: ids.projectPrimary,
        actorId: ids.userAdmin,
        metadata: { note: 'Seed refreshed for workspace demo' },
      },
      {
        action: 'WORKSPACE_SYNC',
        entity: 'DigitalTwin',
        entityId: ids.twinPrimary,
        actorId: ids.userEngineer,
        metadata: { syncState: 'SYNCED', replay: 'Sea trial 31A' },
      },
      {
        action: 'REVIEW_STATUS_CHANGE',
        entity: 'Review',
        entityId: ids.reviewCms,
        actorId: ids.userArchitect,
        metadata: { from: 'OPEN', to: 'IN_REVIEW' },
      },
    ],
  });

  console.log(`  ✔ AuditEvents: 3 seed events\n`);

  // ── Workspace: Material presets ────────────────────────────────────────────

  const matOak = await prisma.materialPreset.upsert({
    where: { id: 'mat-malta-oak' },
    update: {},
    create: {
      id: 'mat-malta-oak',
      name: 'Malta Oak',
      description: 'Warm teak-finish hull plating.',
      colorHex: '#8B5E3C',
    },
  });

  const matSteel = await prisma.materialPreset.upsert({
    where: { id: 'mat-brushed-steel' },
    update: {},
    create: {
      id: 'mat-brushed-steel',
      name: 'Brushed Steel',
      description: 'High-tensile marine-grade brushed steel.',
      colorHex: '#A8A9AD',
    },
  });

  const matConcrete = await prisma.materialPreset.upsert({
    where: { id: 'mat-raw-concrete' },
    update: {},
    create: {
      id: 'mat-raw-concrete',
      name: 'Raw Concrete',
      description: 'Exposed aggregate composite panel.',
      colorHex: '#9EA3A8',
    },
  });

  console.log(`  ✔ MaterialPresets: Malta Oak, Brushed Steel, Raw Concrete`);

  // ── Workspace: Lighting presets ────────────────────────────────────────────

  const lightGolden = await prisma.lightingPreset.upsert({
    where: { id: 'light-golden-hour' },
    update: {},
    create: {
      id: 'light-golden-hour',
      name: 'Golden Hour',
      description: 'Warm dusk lighting for visual identity renders.',
      intensity: 0.85,
    },
  });

  const lightMidnight = await prisma.lightingPreset.upsert({
    where: { id: 'light-midnight-stealth' },
    update: {},
    create: {
      id: 'light-midnight-stealth',
      name: 'Midnight Stealth',
      description: 'Zero-emission low-visibility night profile.',
      intensity: 0.2,
    },
  });

  const lightScandi = await prisma.lightingPreset.upsert({
    where: { id: 'light-scandinavian-natural' },
    update: {},
    create: {
      id: 'light-scandinavian-natural',
      name: 'Scandinavian Natural',
      description: 'Cool northern overcast daylight.',
      intensity: 1.0,
    },
  });

  console.log(`  ✔ LightingPresets: Golden Hour, Midnight Stealth, Scandinavian Natural`);

  // ── Workspace: View config ─────────────────────────────────────────────────

  await prisma.workspaceViewConfig.upsert({
    where: { twinId: ids.twinPrimary },
    update: {},
    create: {
      twinId: ids.twinPrimary,
      selectedMaterialId: matSteel.id,
      selectedLightingId: lightGolden.id,
      camDof: 3.0,
      camFstop: 30,
    },
  });

  console.log(`  ✔ WorkspaceViewConfig: Brushed Steel + Golden Hour, DoF=3.0 F30`);

  // ── Workspace: Viewport hotspots ──────────────────────────────────────────

  await prisma.viewportHotspot.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'hs-radar',
        twinId: ids.twinPrimary,
        label: 'APAR Radar',
        description: 'S-band active phased array radar — horizon and volume search.',
        subsystemId: 'ss-radar',
        posX: 43,
        posY: 32,
      },
      {
        id: 'hs-bridge',
        twinId: ids.twinPrimary,
        label: 'Bridge / CMS',
        description: 'Combat Management System operator consoles.',
        subsystemId: 'ss-combat',
        posX: 52,
        posY: 52,
      },
      {
        id: 'hs-vls',
        twinId: ids.twinPrimary,
        label: 'VLS Cells',
        description: 'Sylver A50 vertical launch system — 48 cells.',
        subsystemId: 'ss-weapons',
        posX: 30,
        posY: 62,
      },
      {
        id: 'hs-propulsion',
        twinId: ids.twinPrimary,
        label: 'Propulsion',
        description: 'CODLAG plant — gas turbines and electric drives.',
        subsystemId: 'ss-propulsion',
        posX: 68,
        posY: 68,
      },
      {
        id: 'hs-sonar',
        twinId: ids.twinPrimary,
        label: 'Hull Sonar',
        description: 'Medium-frequency hull-mounted sonar.',
        subsystemId: 'ss-sonar',
        posX: 22,
        posY: 72,
      },
    ],
  });

  console.log(`  ✔ ViewportHotspots: 5 hotspots (radar, bridge, VLS, propulsion, sonar)`);

  // ── Workspace: Alert events ───────────────────────────────────────────────

  await prisma.alertEvent.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'alert-001',
        twinId: ids.twinPrimary,
        title: 'Critical Alerts',
        message: 'Sonar Status Active — bearing 247° unidentified contact.',
        severity: 'CRITICAL',
      },
      {
        id: 'alert-002',
        twinId: ids.twinPrimary,
        title: 'Critical Alerts',
        message: `Coord: 43.17° N, 7.42° E — propulsion temperature threshold exceeded.`,
        severity: 'CRITICAL',
      },
      {
        id: 'alert-003',
        twinId: ids.twinPrimary,
        title: 'Structural Stress Warning',
        message: 'Frame 48–52 stress sensor above 85% threshold at current heading.',
        severity: 'WARNING',
      },
      {
        id: 'alert-004',
        twinId: ids.twinPrimary,
        title: 'Link-16 Degraded',
        message: 'Data link uplink quality below 60% — check antenna alignment.',
        severity: 'WARNING',
        resolvedAt: new Date('2025-12-01T08:00:00Z'),
      },
      {
        id: 'alert-005',
        twinId: ids.twinPrimary,
        title: 'Simulation Result Available',
        message: 'Propulsion envelope run #3 completed — review output data.',
        severity: 'INFO',
        resolvedAt: new Date('2025-12-01T09:00:00Z'),
      },
    ],
  });

  console.log(`  ✔ AlertEvents: 5 alerts (2 critical, 2 warning, 1 info)`);

  // ── Workspace: Activity log ───────────────────────────────────────────────

  await prisma.twinActivityLog.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'log-001',
        twinId: ids.twinPrimary,
        actorId: ids.userEngineer,
        action: 'Structural decimation updated',
        detail: 'Frame mesh reduced 40% — no fidelity loss at system boundary.',
        version: 'v2.41',
      },
      {
        id: 'log-002',
        twinId: ids.twinPrimary,
        actorId: ids.userEngineer,
        action: 'Structural decimation updated',
        detail: 'Secondary hull sections re-meshed for simulation performance.',
        version: 'v2.41',
      },
      {
        id: 'log-003',
        twinId: ids.twinPrimary,
        actorId: ids.userAnalyst,
        action: 'Structural users updated',
        detail: 'Access permissions aligned with PDR gate checklist.',
        version: 'v2.41',
      },
      {
        id: 'log-004',
        twinId: ids.twinPrimary,
        actorId: ids.userAdmin,
        action: 'Structural events updated',
        detail: 'Event timeline synced to simulation run schedule.',
        version: 'v2.41',
      },
      {
        id: 'log-005',
        twinId: ids.twinPrimary,
        actorId: ids.userEngineer,
        action: 'Structural geometry added',
        detail: 'Added forward deck geometry from revised hull lines.',
        version: 'v2.41',
      },
      {
        id: 'log-006',
        twinId: ids.twinPrimary,
        actorId: ids.userEngineer,
        action: 'Structural decimation updated',
        detail: 'Superstructure mesh optimised for render export.',
        version: 'v2.41',
      },
      {
        id: 'log-007',
        twinId: ids.twinPrimary,
        actorId: ids.userAnalyst,
        action: 'REQ-003 status updated',
        detail: 'Acoustic requirement moved to REVIEW — evidence package submitted.',
        version: 'v2.40',
      },
      {
        id: 'log-008',
        twinId: ids.twinPrimary,
        actorId: ids.userAdmin,
        action: 'Design review opened',
        detail: 'PDR for CMS architecture initiated.',
        version: 'v2.39',
      },
    ],
  });

  console.log(`  ✔ TwinActivityLog: 8 activity entries\n`);

  console.log('✅  Seed complete.\n');
}

async function seedWorkspaceAssets() {
  await prisma.workspaceViewConfig.deleteMany({ where: { twinId: ids.twinPrimary } });
  await prisma.viewportHotspot.deleteMany({ where: { twinId: ids.twinPrimary } });
  await prisma.alertEvent.deleteMany({ where: { twinId: ids.twinPrimary } });
  await prisma.twinActivityLog.deleteMany({ where: { twinId: ids.twinPrimary } });
  await prisma.materialPreset.deleteMany({ where: { twinId: ids.twinPrimary } });
  await prisma.lightingPreset.deleteMany({ where: { twinId: ids.twinPrimary } });
  await prisma.cameraPreset.deleteMany({ where: { twinId: ids.twinPrimary } });
  await prisma.keyframeSequence.deleteMany({ where: { twinId: ids.twinPrimary } });

  await prisma.materialPreset.createMany({
    data: [
      {
        id: 'mat-battle-ready',
        twinId: ids.twinPrimary,
        key: 'battle-ready',
        name: 'Battle Ready',
        description: 'Low-glare combat finish with balanced thermal signature treatment.',
        hullColor: '#4F5A68',
        deckColor: '#28303A',
        accentColor: '#1DD6E4',
        finish: 'Ceramic stealth coat',
        roughness: 0.62,
        reflectivity: 0.21,
        thermalProfile: 'Operational low-observable',
        isDefault: true,
      },
      {
        id: 'mat-storm-trial',
        twinId: ids.twinPrimary,
        key: 'storm-trial',
        name: 'Storm Trial',
        description: 'Wet-deck calibration material set for heavy-weather wash conditions.',
        hullColor: '#596676',
        deckColor: '#202833',
        accentColor: '#6EE7F2',
        finish: 'Hydrophobic salt-shed coat',
        roughness: 0.74,
        reflectivity: 0.18,
        thermalProfile: 'Cold deck bias',
        isDefault: false,
      },
      {
        id: 'mat-thermal-contrast',
        twinId: ids.twinPrimary,
        key: 'thermal-contrast',
        name: 'Thermal Contrast',
        description: 'Inspection pass tuned to expose exhaust and launcher heat maps.',
        hullColor: '#404852',
        deckColor: '#1D222A',
        accentColor: '#FF8A4C',
        finish: 'Diagnostics emissive overlay',
        roughness: 0.48,
        reflectivity: 0.33,
        thermalProfile: 'Expanded thermal signature',
        isDefault: false,
      },
    ],
  });

  await prisma.lightingPreset.createMany({
    data: [
      {
        id: 'light-dawn-watch',
        twinId: ids.twinPrimary,
        key: 'dawn-watch',
        name: 'Dawn Watch',
        description: 'Cool dawn lighting tuned for bridge and mast inspection.',
        environmentPreset: 'Overcast horizon',
        accentColor: '#2DE0E8',
        ambientIntensity: 0.58,
        directionalIntensity: 0.82,
        fogDensity: 0.16,
        shadowBias: 0.24,
        isDefault: true,
      },
      {
        id: 'light-night-ops',
        twinId: ids.twinPrimary,
        key: 'night-ops',
        name: 'Night Ops',
        description: 'Blue-shifted night profile highlighting low-visibility mission lighting.',
        environmentPreset: 'Moonlit sea state',
        accentColor: '#56B7FF',
        ambientIntensity: 0.32,
        directionalIntensity: 0.54,
        fogDensity: 0.24,
        shadowBias: 0.35,
        isDefault: false,
      },
      {
        id: 'light-yard-inspection',
        twinId: ids.twinPrimary,
        key: 'yard-inspection',
        name: 'Yard Inspection',
        description: 'High-clarity white light used during maintenance package review.',
        environmentPreset: 'Dry dock inspection',
        accentColor: '#9FF3FF',
        ambientIntensity: 0.72,
        directionalIntensity: 0.94,
        fogDensity: 0.08,
        shadowBias: 0.16,
        isDefault: false,
      },
    ],
  });

  await prisma.cameraPreset.createMany({
    data: [
      {
        id: 'cam-broadside',
        twinId: ids.twinPrimary,
        key: 'broadside',
        name: 'Broadside Overview',
        description: 'Balanced whole-ship composition for design review and hot-zone scanning.',
        focusLabel: 'Port broadside',
        yaw: 12,
        pitch: -7,
        zoom: 1.03,
        fieldOfView: 34,
        transitionMs: 900,
        isDefault: true,
      },
      {
        id: 'cam-mast-focus',
        twinId: ids.twinPrimary,
        key: 'mast-focus',
        name: 'Mast Focus',
        description: 'Tighter camera framing for radar and electronic warfare workpacks.',
        focusLabel: 'Integrated sensor mast',
        yaw: 24,
        pitch: -15,
        zoom: 1.22,
        fieldOfView: 28,
        transitionMs: 820,
        isDefault: false,
      },
      {
        id: 'cam-propulsion-cutaway',
        twinId: ids.twinPrimary,
        key: 'propulsion-cutaway',
        name: 'Propulsion Cutaway',
        description: 'Lower stern orbit used for shaft and electric drive trend review.',
        focusLabel: 'Stern propulsion bay',
        yaw: -18,
        pitch: 6,
        zoom: 1.18,
        fieldOfView: 30,
        transitionMs: 980,
        isDefault: false,
      },
    ],
  });

  await prisma.keyframeSequence.createMany({
    data: [
      {
        id: 'kf-escort-loop',
        twinId: ids.twinPrimary,
        key: 'escort-loop',
        name: 'Escort Patrol Loop',
        description: 'Smooth orbit across mast, VLS, and stern systems for executive playback.',
        durationSeconds: 42,
        keyframes: [
          { at: 0, yaw: 12, pitch: -7, zoom: 1.03 },
          { at: 14, yaw: 28, pitch: -12, zoom: 1.16 },
          { at: 28, yaw: -12, pitch: 4, zoom: 1.14 },
          { at: 42, yaw: 12, pitch: -7, zoom: 1.03 },
        ],
        isDefault: true,
      },
      {
        id: 'kf-damage-control',
        twinId: ids.twinPrimary,
        key: 'damage-control',
        name: 'Damage Control Sweep',
        description: 'Fast stern-to-bow scan for alert triage and rules follow-up.',
        durationSeconds: 24,
        keyframes: [
          { at: 0, yaw: -18, pitch: 6, zoom: 1.18 },
          { at: 10, yaw: 5, pitch: -2, zoom: 1.08 },
          { at: 24, yaw: 24, pitch: -15, zoom: 1.22 },
        ],
        isDefault: false,
      },
    ],
  });

  await prisma.viewportHotspot.createMany({
    data: [
      {
        id: 'hotspot-mast',
        twinId: ids.twinPrimary,
        subsystemId: ids.subsystemRadar,
        slug: 'integrated-mast',
        title: 'Integrated Sensor Mast',
        description: 'Primary radar and EW cluster with the highest fusion load in the current replay.',
        category: 'SENSOR',
        status: 'Nominal with latency watch',
        anchorX: 49,
        anchorY: 26,
        calloutX: 69,
        calloutY: 14,
        healthScore: 94,
        telemetry: {
          latencyMs: 612,
          trackFusion: '92%',
          thermalMargin: '11°C',
        },
        displayOrder: 1,
      },
      {
        id: 'hotspot-vls',
        twinId: ids.twinPrimary,
        subsystemId: ids.subsystemVls,
        slug: 'vls-battery',
        title: 'Forward VLS Battery',
        description: 'Launcher thermal distribution and hatch telemetry under ripple-fire rehearsal.',
        category: 'WEAPON',
        status: 'Thermal imbalance review',
        anchorX: 36,
        anchorY: 49,
        calloutX: 14,
        calloutY: 31,
        healthScore: 78,
        telemetry: {
          cellsReady: 46,
          thermalSpread: '8.6°C',
          hatchStatus: 'All green',
        },
        displayOrder: 2,
      },
      {
        id: 'hotspot-cic',
        twinId: ids.twinPrimary,
        subsystemId: ids.subsystemCic,
        slug: 'bridge-cic',
        title: 'Bridge and CIC',
        description: 'Command-layer handoff, data-link routing, and tactical bus segmentation.',
        category: 'COMMUNICATION',
        status: 'Load sharing stable',
        anchorX: 48,
        anchorY: 42,
        calloutX: 73,
        calloutY: 48,
        healthScore: 88,
        telemetry: {
          failover: '9.4 s',
          linksOnline: 6,
          crewStations: 18,
        },
        displayOrder: 3,
      },
      {
        id: 'hotspot-shaft',
        twinId: ids.twinPrimary,
        subsystemId: ids.subsystemShaft,
        slug: 'shaft-line',
        title: 'Shaft Line Monitoring',
        description: 'Bearing temperature and vibration spike detected during the last sprint profile.',
        category: 'PROPULSION',
        status: 'Bearing trend elevated',
        anchorX: 68,
        anchorY: 62,
        calloutX: 82,
        calloutY: 69,
        healthScore: 72,
        telemetry: {
          vibration: '4.1 mm/s',
          torque: '89%',
          bearingTemp: '76°C',
        },
        displayOrder: 4,
      },
      {
        id: 'hotspot-mission-bay',
        twinId: ids.twinPrimary,
        subsystemId: ids.subsystemMissionBay,
        slug: 'mission-bay',
        title: 'Mission Bay Automation',
        description: 'Autonomous payload handling remains draft but is included for layout validation.',
        category: 'SUPPORT',
        status: 'Draft integration',
        anchorX: 58,
        anchorY: 55,
        calloutX: 31,
        calloutY: 72,
        healthScore: 65,
        telemetry: {
          cycleTime: '19.6 min',
          payloadMode: 'UAV + RHIB',
          safetyInterlocks: 'Pending',
        },
        displayOrder: 5,
      },
    ],
  });

  await prisma.alertEvent.createMany({
    data: [
      {
        id: 'alert-cooling-critical',
        twinId: ids.twinPrimary,
        subsystemId: ids.subsystemPowerCooling,
        severity: 'CRITICAL',
        title: 'Cooling loop temperature excursion',
        message: 'Mission-system branch C breached the 84°C threshold for 96 seconds during radar dwell surge.',
        source: 'Thermal management controller',
        acknowledged: false,
        raisedAt: new Date('2026-03-31T23:44:00Z'),
      },
      {
        id: 'alert-vls-high',
        twinId: ids.twinPrimary,
        subsystemId: ids.subsystemVls,
        severity: 'HIGH',
        title: 'Launcher thermal spread above review margin',
        message: 'Forward cell grouping exceeded the preferred ripple-fire spread by 0.6°C.',
        source: 'Launcher diagnostics',
        acknowledged: false,
        raisedAt: new Date('2026-03-31T23:18:00Z'),
      },
      {
        id: 'alert-shaft-medium',
        twinId: ids.twinPrimary,
        subsystemId: ids.subsystemShaft,
        severity: 'MEDIUM',
        title: 'Shaft vibration trend rising',
        message: 'Aft bearing vibration climbed toward the maintenance trigger during the final sprint segment.',
        source: 'Predictive maintenance engine',
        acknowledged: true,
        raisedAt: new Date('2026-03-31T22:52:00Z'),
      },
      {
        id: 'alert-cic-low',
        twinId: ids.twinPrimary,
        subsystemId: ids.subsystemCic,
        severity: 'LOW',
        title: 'Data-link jitter outside target window',
        message: 'Transient packet jitter exceeded the preferred bridge/CIC handoff target by 14 ms.',
        source: 'Tactical network monitor',
        acknowledged: true,
        raisedAt: new Date('2026-03-31T21:58:00Z'),
      },
    ],
  });

  await prisma.twinActivityLog.createMany({
    data: [
      {
        id: 'activity-sync',
        twinId: ids.twinPrimary,
        actorId: ids.userEngineer,
        subsystemId: ids.subsystemRadar,
        eventType: 'SYNC',
        summary: 'Sea trial replay 31A synchronized into the mast and propulsion workspaces.',
        detail: 'Replay package included latency traces, launcher thermal curves, and propulsion sprint telemetry.',
        occurredAt: new Date('2026-03-31T23:48:00Z'),
      },
      {
        id: 'activity-alert-review',
        twinId: ids.twinPrimary,
        actorId: ids.userArchitect,
        subsystemId: ids.subsystemPowerCooling,
        eventType: 'ALERT_REVIEW',
        summary: 'Cooling branch C flagged for immediate isolation study.',
        detail: 'Platform architecture team opened a follow-up action for valve sequencing and radar load shedding.',
        occurredAt: new Date('2026-03-31T23:42:00Z'),
      },
      {
        id: 'activity-material',
        twinId: ids.twinPrimary,
        actorId: ids.userAdmin,
        subsystemId: ids.subsystemHull,
        eventType: 'DESIGN_STUDIO',
        summary: 'Battle Ready material preset approved for the latest executive review export.',
        detail: 'Thermal contrast preset retained as the alternate inspection mode for follow-up analysis.',
        occurredAt: new Date('2026-03-31T23:20:00Z'),
      },
      {
        id: 'activity-rules',
        twinId: ids.twinPrimary,
        actorId: ids.userAnalyst,
        subsystemId: ids.subsystemVls,
        eventType: 'RULES_CHECK',
        summary: 'REQ-002 remains in review pending launcher thermal spread retest.',
        detail: 'Evidence package updated with ripple-fire chamber traces and revised acceptance margin.',
        occurredAt: new Date('2026-03-31T22:57:00Z'),
      },
      {
        id: 'activity-performance',
        twinId: ids.twinPrimary,
        actorId: ids.userEngineer,
        subsystemId: ids.subsystemPropulsion,
        eventType: 'PERFORMANCE_TEST',
        summary: 'Propulsion envelope run completed with 31.2-knot peak speed and 7.8 dB acoustic margin.',
        detail: 'No convergence issues were observed in the final sea-state four solve.',
        occurredAt: new Date('2026-03-31T21:46:00Z'),
      },
      {
        id: 'activity-team',
        twinId: ids.twinPrimary,
        actorId: ids.userArchitect,
        subsystemId: ids.subsystemMissionBay,
        eventType: 'TEAM_BRIEF',
        summary: 'Mission bay automation draft queued for Friday design huddle.',
        detail: 'Payload exchange cycle-time remains above the desired stretch target.',
        occurredAt: new Date('2026-03-31T20:30:00Z'),
      },
    ],
  });

  await prisma.workspaceViewConfig.create({
    data: {
      id: ids.viewConfig,
      twinId: ids.twinPrimary,
      selectedHotspotId: 'hotspot-mast',
      selectedMaterialPresetId: 'mat-battle-ready',
      selectedLightingPresetId: 'light-dawn-watch',
      selectedCameraPresetId: 'cam-broadside',
      activeKeyframeSequenceId: 'kf-escort-loop',
      activeSection: 'design-studio',
      cameraState: {
        yaw: 12,
        pitch: -7,
        zoom: 1.03,
        fieldOfView: 34,
      },
    },
  });
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
