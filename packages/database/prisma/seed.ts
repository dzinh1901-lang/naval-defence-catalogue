/**
 * Naval Digital Twin Platform — Database Seed
 *
 * Creates a realistic baseline dataset based on the naval defence catalogue
 * domain: a surface combatant digital twin with subsystem hierarchy,
 * requirements, variants, simulation, and review records.
 *
 * Usage:  pnpm --filter @naval/database db:seed
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱  Seeding Naval Digital Twin Platform database...\n');

  // ── Organization ──────────────────────────────────────────────────────────

  const org = await prisma.organization.upsert({
    where: { slug: 'naval-systems-command' },
    update: {},
    create: {
      name: 'Naval Systems Command',
      slug: 'naval-systems-command',
      plan: 'PROFESSIONAL',
    },
  });

  console.log(`  ✔ Organization: ${org.name}`);

  // ── Users ─────────────────────────────────────────────────────────────────

  const adminUser = await prisma.user.upsert({
    where: { email: 'cmdr.lee@naval-systems.dev' },
    update: {},
    create: {
      email: 'cmdr.lee@naval-systems.dev',
      name: 'Commander S. Lee',
      passwordHash: null, // placeholder — JWT/OAuth to be implemented in M2
    },
  });

  const engineerUser = await prisma.user.upsert({
    where: { email: 'eng.chen@naval-systems.dev' },
    update: {},
    create: {
      email: 'eng.chen@naval-systems.dev',
      name: 'Dr. M. Chen',
      passwordHash: null,
    },
  });

  const analystUser = await prisma.user.upsert({
    where: { email: 'analyst.kowalski@naval-systems.dev' },
    update: {},
    create: {
      email: 'analyst.kowalski@naval-systems.dev',
      name: 'P. Kowalski',
      passwordHash: null,
    },
  });

  console.log(`  ✔ Users: ${adminUser.name}, ${engineerUser.name}, ${analystUser.name}`);

  // ── Memberships ───────────────────────────────────────────────────────────

  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: adminUser.id } },
    update: {},
    create: { organizationId: org.id, userId: adminUser.id, role: 'ADMIN' },
  });
  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: engineerUser.id } },
    update: {},
    create: { organizationId: org.id, userId: engineerUser.id, role: 'MEMBER' },
  });
  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: analystUser.id } },
    update: {},
    create: { organizationId: org.id, userId: analystUser.id, role: 'VIEWER' },
  });

  // ── Projects ──────────────────────────────────────────────────────────────

  const frigateProject = await prisma.project.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: 'type-52-frigate' } },
    update: {},
    create: {
      name: 'Type 52 Guided Missile Frigate',
      slug: 'type-52-frigate',
      description:
        'Next-generation surface combatant digital twin: systems definition, ' +
        'requirements traceability, and simulation baseline.',
      status: 'ACTIVE',
      organizationId: org.id,
    },
  });

  const subProject = await prisma.project.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: 'attack-submarine-concept' } },
    update: {},
    create: {
      name: 'Attack Submarine Concept Study',
      slug: 'attack-submarine-concept',
      description: 'Early concept exploration for next-generation diesel-electric attack submarine.',
      status: 'DRAFT',
      organizationId: org.id,
    },
  });

  console.log(`  ✔ Projects: ${frigateProject.name}, ${subProject.name}`);

  // ── Digital Twin ──────────────────────────────────────────────────────────

  const frigateTwin = await prisma.digitalTwin.upsert({
    where: { id: 'twin-t52-baseline' },
    update: {},
    create: {
      id: 'twin-t52-baseline',
      name: 'T52 Baseline Digital Twin',
      description: 'Full-ship digital twin baseline for the Type 52 frigate — combat system integration.',
      version: '1.0.0',
      status: 'ACTIVE',
      projectId: frigateProject.id,
    },
  });

  console.log(`  ✔ DigitalTwin: ${frigateTwin.name} v${frigateTwin.version}`);

  // ── Subsystems (hierarchical) ─────────────────────────────────────────────

  // Root subsystem
  const combatSystem = await upsertSubsystem({
    id: 'ss-combat',
    name: 'Combat Management System',
    identifier: 'SYS-CMS',
    description: 'Integrated combat management system: sensors, weapons, and command interfaces.',
    depth: 0,
    status: 'DEFINED',
    twinId: frigateTwin.id,
    parentId: null,
  });

  const propulsion = await upsertSubsystem({
    id: 'ss-propulsion',
    name: 'Propulsion System',
    identifier: 'SYS-PROP',
    description: 'Combined diesel-electric and gas turbine (CODLAG) propulsion plant.',
    depth: 0,
    status: 'VERIFIED',
    twinId: frigateTwin.id,
    parentId: null,
  });

  const platform = await upsertSubsystem({
    id: 'ss-platform',
    name: 'Platform Systems',
    identifier: 'SYS-PLT',
    description: 'Ship hull, structure, and damage control systems.',
    depth: 0,
    status: 'DEFINED',
    twinId: frigateTwin.id,
    parentId: null,
  });

  // CMS children
  const sensors = await upsertSubsystem({
    id: 'ss-sensors',
    name: 'Sensor Suite',
    identifier: 'SYS-CMS-SEN',
    description: 'Active/passive radar, sonar, EO/IR, and ESM sensor integration.',
    depth: 1,
    status: 'DEFINED',
    twinId: frigateTwin.id,
    parentId: combatSystem.id,
  });

  const weapons = await upsertSubsystem({
    id: 'ss-weapons',
    name: 'Weapons Systems',
    identifier: 'SYS-CMS-WPN',
    description: 'Missile launch, gun, and torpedo weapons management.',
    depth: 1,
    status: 'DRAFT',
    twinId: frigateTwin.id,
    parentId: combatSystem.id,
  });

  const datalinks = await upsertSubsystem({
    id: 'ss-datalinks',
    name: 'Data Links & Comms',
    identifier: 'SYS-CMS-DL',
    description: 'Link-16, Link-22, HF/VHF/UHF communications and satellite links.',
    depth: 1,
    status: 'DRAFT',
    twinId: frigateTwin.id,
    parentId: combatSystem.id,
  });

  // Sensors children
  await upsertSubsystem({
    id: 'ss-radar',
    name: 'Active Phased Array Radar',
    identifier: 'SYS-CMS-SEN-RAD',
    description: 'S-band APAR with horizon and volume search modes.',
    depth: 2,
    status: 'DEFINED',
    twinId: frigateTwin.id,
    parentId: sensors.id,
  });

  await upsertSubsystem({
    id: 'ss-sonar',
    name: 'Hull-Mounted Sonar',
    identifier: 'SYS-CMS-SEN-SON',
    description: 'Medium-frequency hull-mounted sonar (HMS) with towed array interface.',
    depth: 2,
    status: 'DRAFT',
    twinId: frigateTwin.id,
    parentId: sensors.id,
  });

  // Propulsion children
  await upsertSubsystem({
    id: 'ss-engines',
    name: 'Gas Turbine Modules',
    identifier: 'SYS-PROP-GT',
    description: 'Twin Rolls-Royce MT30 gas turbine modules for sprint speed.',
    depth: 1,
    status: 'VERIFIED',
    twinId: frigateTwin.id,
    parentId: propulsion.id,
  });

  await upsertSubsystem({
    id: 'ss-electric-drive',
    name: 'Electric Propulsion Drive',
    identifier: 'SYS-PROP-EPD',
    description: 'Permanent magnet motors for quiet low-speed operation.',
    depth: 1,
    status: 'DEFINED',
    twinId: frigateTwin.id,
    parentId: propulsion.id,
  });

  console.log(`  ✔ Subsystems: combat system hierarchy (depth 0–2), propulsion, platform`);

  // ── Interfaces ────────────────────────────────────────────────────────────

  await prisma.interface.createMany({
    skipDuplicates: true,
    data: [
      {
        name: 'Radar Track Feed',
        description: 'Real-time track data from APAR to CMS track manager.',
        protocol: 'DDS/RTPS',
        direction: 'OUTPUT',
        subsystemId: sensors.id,
      },
      {
        name: 'Fire Control Order',
        description: 'Engagement order from CMS to weapons fire control.',
        protocol: 'MIL-STD-1553B',
        direction: 'INPUT',
        subsystemId: weapons.id,
      },
      {
        name: 'Link-16 Data Bus',
        description: 'NATO tactical data link for air picture and targeting.',
        protocol: 'TADIL J / Link-16',
        direction: 'BIDIRECTIONAL',
        subsystemId: datalinks.id,
      },
      {
        name: 'Shaft Power Output',
        description: 'Mechanical power from gas turbines to gearbox.',
        protocol: 'Mechanical',
        direction: 'OUTPUT',
        subsystemId: propulsion.id,
      },
    ],
  });

  console.log(`  ✔ Interfaces: radar feed, fire control, Link-16, shaft power`);

  // ── Requirements ──────────────────────────────────────────────────────────

  await prisma.requirement.createMany({
    skipDuplicates: true,
    data: [
      {
        identifier: 'REQ-001',
        text: 'The combat management system SHALL detect and track air targets at ranges up to 200 NM.',
        rationale: 'Required to achieve area air defence tasking against supersonic threats.',
        priority: 'MUST',
        status: 'APPROVED',
        projectId: frigateProject.id,
        subsystemId: sensors.id,
      },
      {
        identifier: 'REQ-002',
        text: 'The propulsion system SHALL sustain a maximum speed of 30 knots in Sea State 4.',
        rationale: 'Sprint capability required for fleet escort and intercept missions.',
        priority: 'MUST',
        status: 'APPROVED',
        projectId: frigateProject.id,
        subsystemId: propulsion.id,
      },
      {
        identifier: 'REQ-003',
        text: 'The ship SHALL maintain acoustic signature below NATO STANAG 1234 threshold at 12 knots.',
        rationale: 'Anti-submarine mission effectiveness depends on low radiated noise.',
        priority: 'MUST',
        status: 'REVIEW',
        projectId: frigateProject.id,
        subsystemId: null,
      },
      {
        identifier: 'REQ-004',
        text: 'The combat system SHALL achieve a reaction time of less than 3 seconds from track to engagement authorisation.',
        rationale: 'Anti-ship missile defence requirement derived from threat TLE analysis.',
        priority: 'MUST',
        status: 'DRAFT',
        projectId: frigateProject.id,
        subsystemId: combatSystem.id,
      },
      {
        identifier: 'REQ-005',
        text: 'The data link system SHOULD support simultaneous Link-16 and Link-22 operations.',
        rationale: 'Interoperability with allied task group assets.',
        priority: 'SHOULD',
        status: 'APPROVED',
        projectId: frigateProject.id,
        subsystemId: datalinks.id,
      },
      {
        identifier: 'REQ-006',
        text: 'The ship SHALL provide harbour and underway endurance of 7,000 NM at 16 knots.',
        rationale: 'Long-range patrol and escort tasking in the Pacific theatre.',
        priority: 'MUST',
        status: 'APPROVED',
        projectId: frigateProject.id,
        subsystemId: propulsion.id,
      },
    ],
  });

  console.log(`  ✔ Requirements: 6 naval requirements (REQ-001 to REQ-006)`);

  // ── Variants ──────────────────────────────────────────────────────────────

  await prisma.variant.createMany({
    skipDuplicates: true,
    data: [
      {
        name: 'Baseline (AAW)',
        description: 'Area air warfare configuration — standard production fit.',
        isBaseline: true,
        twinId: frigateTwin.id,
      },
      {
        name: 'ASW Enhanced',
        description: 'Anti-submarine warfare enhanced fit with towed array and VDS.',
        isBaseline: false,
        twinId: frigateTwin.id,
      },
      {
        name: 'Export Variant A',
        description: 'Reduced-capability export configuration for partner nation FMS.',
        isBaseline: false,
        twinId: frigateTwin.id,
      },
    ],
  });

  console.log(`  ✔ Variants: Baseline (AAW), ASW Enhanced, Export Variant A`);

  // ── Simulation ────────────────────────────────────────────────────────────

  const propSim = await prisma.simulation.create({
    data: {
      name: 'Propulsion Performance Envelope',
      description: 'Speed-power curve simulation across sea states 2–5.',
      type: 'DYNAMIC',
      config: {
        seaStates: [2, 3, 4, 5],
        speedRange: { minKnots: 4, maxKnots: 32, stepKnots: 2 },
        model: 'CODLAG-MT30-v2',
      },
      twinId: frigateTwin.id,
    },
  });

  await prisma.simulationRun.create({
    data: {
      status: 'COMPLETED',
      startedAt: new Date('2025-11-01T09:00:00Z'),
      completedAt: new Date('2025-11-01T09:42:11Z'),
      result: {
        maxSpeed: 30.4,
        endurance16kt: 7250,
        acousticProfile: 'WITHIN_STANAG',
        convergence: true,
      },
      simulationId: propSim.id,
    },
  });

  console.log(`  ✔ Simulation: ${propSim.name} — 1 completed run`);

  // ── Review ────────────────────────────────────────────────────────────────

  const designReview = await prisma.review.create({
    data: {
      title: 'Preliminary Design Review — CMS Architecture',
      description: 'PDR for the Combat Management System software architecture and sensor interfaces.',
      type: 'DESIGN',
      status: 'IN_REVIEW',
      projectId: frigateProject.id,
      createdById: adminUser.id,
    },
  });

  await prisma.evidence.createMany({
    data: [
      {
        title: 'CMS Architecture Document v2.3',
        description: 'Software architecture description per DO-178C.',
        type: 'DOCUMENT',
        uri: 's3://naval-dt-dev/reviews/cms-arch-v2.3.pdf',
        reviewId: designReview.id,
      },
      {
        title: 'Radar Interface Analysis',
        description: 'Hardware-software interface analysis for APAR integration.',
        type: 'ANALYSIS',
        uri: 's3://naval-dt-dev/reviews/radar-hsia-v1.pdf',
        reviewId: designReview.id,
      },
    ],
  });

  console.log(`  ✔ Review: ${designReview.title} — 2 evidence items`);

  // ── Audit Events ──────────────────────────────────────────────────────────

  await prisma.auditEvent.createMany({
    data: [
      {
        action: 'CREATE',
        entity: 'Project',
        entityId: frigateProject.id,
        actorId: adminUser.id,
        metadata: { note: 'Initial project creation from seed' },
      },
      {
        action: 'CREATE',
        entity: 'DigitalTwin',
        entityId: frigateTwin.id,
        actorId: adminUser.id,
        metadata: { note: 'Baseline twin created from seed' },
      },
      {
        action: 'REVIEW_STATUS_CHANGE',
        entity: 'Review',
        entityId: designReview.id,
        actorId: engineerUser.id,
        metadata: { from: 'OPEN', to: 'IN_REVIEW' },
      },
    ],
  });

  console.log(`  ✔ AuditEvents: 3 seed events\n`);
  console.log('✅  Seed complete.\n');
}

async function upsertSubsystem(data: {
  id: string;
  name: string;
  identifier: string;
  description?: string;
  depth: number;
  status: 'DRAFT' | 'DEFINED' | 'VERIFIED' | 'DEPRECATED';
  twinId: string;
  parentId: string | null;
}) {
  return prisma.subsystem.upsert({
    where: { id: data.id },
    update: {},
    create: data,
  });
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
