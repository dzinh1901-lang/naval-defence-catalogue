import type { Project, DigitalTwin, Subsystem, Requirement } from '@naval/domain';
import { ProjectStatus, TwinStatus, SubsystemStatus, RequirementPriority, RequirementStatus } from '@naval/domain';

// ── Subsystem tree ─────────────────────────────────────────────────────────

const NOW = new Date().toISOString();

const radar: Subsystem = {
  id: 'ss-radar', name: 'Active Phased Array Radar', identifier: 'SYS-CMS-SEN-RAD',
  description: 'S-band APAR with horizon and volume search modes.',
  depth: 2, status: SubsystemStatus.DEFINED, twinId: 'twin-t52-baseline',
  parentId: 'ss-sensors', createdAt: NOW, updatedAt: NOW,
};

const sonar: Subsystem = {
  id: 'ss-sonar', name: 'Hull-Mounted Sonar', identifier: 'SYS-CMS-SEN-SON',
  description: 'Medium-frequency HMS with towed array interface.',
  depth: 2, status: SubsystemStatus.DRAFT, twinId: 'twin-t52-baseline',
  parentId: 'ss-sensors', createdAt: NOW, updatedAt: NOW,
};

const sensors: Subsystem = {
  id: 'ss-sensors', name: 'Sensor Suite', identifier: 'SYS-CMS-SEN',
  description: 'Active/passive radar, sonar, EO/IR, and ESM.',
  depth: 1, status: SubsystemStatus.DEFINED, twinId: 'twin-t52-baseline',
  parentId: 'ss-combat', children: [radar, sonar], createdAt: NOW, updatedAt: NOW,
};

const weapons: Subsystem = {
  id: 'ss-weapons', name: 'Weapons Systems', identifier: 'SYS-CMS-WPN',
  description: 'Missile launch, gun, and torpedo management.',
  depth: 1, status: SubsystemStatus.DRAFT, twinId: 'twin-t52-baseline',
  parentId: 'ss-combat', createdAt: NOW, updatedAt: NOW,
};

const datalinks: Subsystem = {
  id: 'ss-datalinks', name: 'Data Links & Comms', identifier: 'SYS-CMS-DL',
  description: 'Link-16, Link-22, HF/VHF/UHF and satellite links.',
  depth: 1, status: SubsystemStatus.DRAFT, twinId: 'twin-t52-baseline',
  parentId: 'ss-combat', createdAt: NOW, updatedAt: NOW,
};

const combat: Subsystem = {
  id: 'ss-combat', name: 'Combat Management System', identifier: 'SYS-CMS',
  description: 'Integrated CMS: sensors, weapons, and command interfaces.',
  depth: 0, status: SubsystemStatus.DEFINED, twinId: 'twin-t52-baseline',
  parentId: null, children: [sensors, weapons, datalinks], createdAt: NOW, updatedAt: NOW,
};

const propulsion: Subsystem = {
  id: 'ss-propulsion', name: 'Propulsion System', identifier: 'SYS-PROP',
  description: 'CODLAG — combined diesel-electric and gas turbine plant.',
  depth: 0, status: SubsystemStatus.VERIFIED, twinId: 'twin-t52-baseline',
  parentId: null, createdAt: NOW, updatedAt: NOW,
};

const platform: Subsystem = {
  id: 'ss-platform', name: 'Platform Systems', identifier: 'SYS-PLT',
  description: 'Hull, structure, and damage control.',
  depth: 0, status: SubsystemStatus.DEFINED, twinId: 'twin-t52-baseline',
  parentId: null, createdAt: NOW, updatedAt: NOW,
};

// ── Requirements ──────────────────────────────────────────────────────────

const MOCK_REQUIREMENTS: Requirement[] = [
  {
    id: 'req-001', identifier: 'REQ-001', text: 'The CMS SHALL detect and track air targets up to 200 NM.',
    rationale: 'Area air defence against supersonic threats.', priority: RequirementPriority.MUST,
    status: RequirementStatus.APPROVED, projectId: 'proj-t52', subsystemId: 'ss-sensors',
    createdAt: NOW, updatedAt: NOW,
  },
  {
    id: 'req-002', identifier: 'REQ-002', text: 'Propulsion SHALL sustain 30 knots in Sea State 4.',
    rationale: 'Sprint capability for fleet escort.', priority: RequirementPriority.MUST,
    status: RequirementStatus.APPROVED, projectId: 'proj-t52', subsystemId: 'ss-propulsion',
    createdAt: NOW, updatedAt: NOW,
  },
  {
    id: 'req-003', identifier: 'REQ-003', text: 'Acoustic signature SHALL be below STANAG 1234 at 12 knots.',
    rationale: 'ASW mission effectiveness.', priority: RequirementPriority.MUST,
    status: RequirementStatus.REVIEW, projectId: 'proj-t52', subsystemId: null,
    createdAt: NOW, updatedAt: NOW,
  },
  {
    id: 'req-004', identifier: 'REQ-004', text: 'Reaction time SHALL be <3 s from track to engagement auth.',
    rationale: 'Anti-ship missile defence.', priority: RequirementPriority.MUST,
    status: RequirementStatus.DRAFT, projectId: 'proj-t52', subsystemId: 'ss-combat',
    createdAt: NOW, updatedAt: NOW,
  },
  {
    id: 'req-005', identifier: 'REQ-005', text: 'Data links SHOULD support simultaneous Link-16 and Link-22.',
    rationale: 'Allied task group interoperability.', priority: RequirementPriority.SHOULD,
    status: RequirementStatus.APPROVED, projectId: 'proj-t52', subsystemId: 'ss-datalinks',
    createdAt: NOW, updatedAt: NOW,
  },
  {
    id: 'req-006', identifier: 'REQ-006', text: 'Ship SHALL achieve 7,000 NM endurance at 16 knots.',
    rationale: 'Pacific theatre patrol tasking.', priority: RequirementPriority.MUST,
    status: RequirementStatus.APPROVED, projectId: 'proj-t52', subsystemId: 'ss-propulsion',
    createdAt: NOW, updatedAt: NOW,
  },
];

// ── Digital Twin ──────────────────────────────────────────────────────────

const FRIGATE_TWIN: DigitalTwin = {
  id: 'twin-t52-baseline',
  name: 'T52 Baseline Digital Twin',
  description: 'Full-ship digital twin — combat system integration baseline.',
  version: '1.0.0',
  status: TwinStatus.ACTIVE,
  projectId: 'proj-t52',
  subsystems: [combat, propulsion, platform],
  createdAt: NOW,
  updatedAt: NOW,
};

// ── Projects ──────────────────────────────────────────────────────────────

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-t52',
    name: 'Type 52 Guided Missile Frigate',
    slug: 'type-52-frigate',
    description: 'Next-generation surface combatant digital twin: systems definition, requirements traceability, and simulation baseline.',
    status: ProjectStatus.ACTIVE,
    organizationId: 'org-nsc',
    twins: [FRIGATE_TWIN],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'proj-sub',
    name: 'Attack Submarine Concept Study',
    slug: 'attack-submarine-concept',
    description: 'Early concept exploration for next-generation diesel-electric attack submarine.',
    status: ProjectStatus.DRAFT,
    organizationId: 'org-nsc',
    twins: [],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'proj-mcm',
    name: 'Mine Counter-Measures Vessel',
    slug: 'mcm-vessel',
    description: 'Autonomous mine-hunting and disposal vessel digital thread.',
    status: ProjectStatus.DRAFT,
    organizationId: 'org-nsc',
    twins: [],
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export { MOCK_REQUIREMENTS, FRIGATE_TWIN, combat, propulsion, platform, sensors, weapons, datalinks };
