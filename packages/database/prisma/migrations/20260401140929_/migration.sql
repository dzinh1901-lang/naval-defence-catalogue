-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "OrgPlan" AS ENUM ('FREE', 'PROFESSIONAL', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('ADMIN', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'DRAFT');

-- CreateEnum
CREATE TYPE "TwinStatus" AS ENUM ('DRAFT', 'ACTIVE', 'LOCKED', 'DEPRECATED');

-- CreateEnum
CREATE TYPE "SubsystemStatus" AS ENUM ('DRAFT', 'DEFINED', 'VERIFIED', 'DEPRECATED');

-- CreateEnum
CREATE TYPE "IfaceDirection" AS ENUM ('INPUT', 'OUTPUT', 'BIDIRECTIONAL');

-- CreateEnum
CREATE TYPE "RequirementPriority" AS ENUM ('MUST', 'SHOULD', 'MAY');

-- CreateEnum
CREATE TYPE "RequirementStatus" AS ENUM ('DRAFT', 'REVIEW', 'APPROVED', 'REJECTED', 'DEPRECATED');

-- CreateEnum
CREATE TYPE "SimulationType" AS ENUM ('STATIC', 'DYNAMIC', 'MONTE_CARLO');

-- CreateEnum
CREATE TYPE "SimRunStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReviewType" AS ENUM ('DESIGN', 'SAFETY', 'COMPLIANCE', 'INTERFACE');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('DOCUMENT', 'TEST_RESULT', 'ANALYSIS', 'SIMULATION_RESULT', 'PHOTO');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plan" "OrgPlan" NOT NULL DEFAULT 'FREE',
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'VIEWER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMember" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'VIEWER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigitalTwin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "status" "TwinStatus" NOT NULL DEFAULT 'DRAFT',
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DigitalTwin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subsystem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "description" TEXT,
    "depth" INTEGER NOT NULL DEFAULT 0,
    "status" "SubsystemStatus" NOT NULL DEFAULT 'DRAFT',
    "twinId" TEXT NOT NULL,
    "parentId" TEXT,
    "embedding" vector(1536),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subsystem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interface" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "protocol" TEXT,
    "direction" "IfaceDirection" NOT NULL DEFAULT 'BIDIRECTIONAL',
    "subsystemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interface_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Requirement" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "rationale" TEXT,
    "priority" "RequirementPriority" NOT NULL DEFAULT 'SHOULD',
    "status" "RequirementStatus" NOT NULL DEFAULT 'DRAFT',
    "projectId" TEXT NOT NULL,
    "subsystemId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Requirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Variant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isBaseline" BOOLEAN NOT NULL DEFAULT false,
    "configuration" JSONB NOT NULL DEFAULT '{}',
    "twinId" TEXT NOT NULL,
    "embedding" vector(1536),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Variant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Simulation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "SimulationType" NOT NULL DEFAULT 'STATIC',
    "config" JSONB NOT NULL DEFAULT '{}',
    "twinId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Simulation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulationRun" (
    "id" TEXT NOT NULL,
    "status" "SimRunStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "result" JSONB,
    "errorMessage" TEXT,
    "simulationId" TEXT NOT NULL,
    "requestedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SimulationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "ReviewType" NOT NULL DEFAULT 'DESIGN',
    "status" "ReviewStatus" NOT NULL DEFAULT 'OPEN',
    "projectId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "EvidenceType" NOT NULL DEFAULT 'DOCUMENT',
    "uri" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "embedding" vector(1536),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "reviewId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialPreset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "thumbnailUrl" TEXT,
    "colorHex" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialPreset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LightingPreset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "thumbnailUrl" TEXT,
    "intensity" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LightingPreset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceViewConfig" (
    "id" TEXT NOT NULL,
    "twinId" TEXT NOT NULL,
    "selectedMaterialId" TEXT,
    "selectedLightingId" TEXT,
    "camDof" DOUBLE PRECISION NOT NULL DEFAULT 3.0,
    "camFstop" DOUBLE PRECISION NOT NULL DEFAULT 30.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceViewConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViewportHotspot" (
    "id" TEXT NOT NULL,
    "twinId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "subsystemId" TEXT,
    "posX" DOUBLE PRECISION NOT NULL,
    "posY" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ViewportHotspot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertEvent" (
    "id" TEXT NOT NULL,
    "twinId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "severity" "AlertSeverity" NOT NULL DEFAULT 'INFO',
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlertEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TwinActivityLog" (
    "id" TEXT NOT NULL,
    "twinId" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "detail" TEXT,
    "version" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TwinActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_slug_idx" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "OrganizationMember_organizationId_idx" ON "OrganizationMember"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationMember_userId_idx" ON "OrganizationMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_organizationId_userId_key" ON "OrganizationMember"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "Project_organizationId_idx" ON "Project"("organizationId");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Project_organizationId_slug_key" ON "Project"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "ProjectMember_projectId_idx" ON "ProjectMember"("projectId");

-- CreateIndex
CREATE INDEX "ProjectMember_userId_idx" ON "ProjectMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_projectId_userId_key" ON "ProjectMember"("projectId", "userId");

-- CreateIndex
CREATE INDEX "DigitalTwin_projectId_idx" ON "DigitalTwin"("projectId");

-- CreateIndex
CREATE INDEX "DigitalTwin_status_idx" ON "DigitalTwin"("status");

-- CreateIndex
CREATE INDEX "Subsystem_twinId_idx" ON "Subsystem"("twinId");

-- CreateIndex
CREATE INDEX "Subsystem_parentId_idx" ON "Subsystem"("parentId");

-- CreateIndex
CREATE INDEX "Subsystem_identifier_idx" ON "Subsystem"("identifier");

-- CreateIndex
CREATE INDEX "Interface_subsystemId_idx" ON "Interface"("subsystemId");

-- CreateIndex
CREATE INDEX "Requirement_projectId_idx" ON "Requirement"("projectId");

-- CreateIndex
CREATE INDEX "Requirement_subsystemId_idx" ON "Requirement"("subsystemId");

-- CreateIndex
CREATE INDEX "Requirement_status_idx" ON "Requirement"("status");

-- CreateIndex
CREATE INDEX "Requirement_identifier_idx" ON "Requirement"("identifier");

-- CreateIndex
CREATE INDEX "Variant_twinId_idx" ON "Variant"("twinId");

-- CreateIndex
CREATE INDEX "Simulation_twinId_idx" ON "Simulation"("twinId");

-- CreateIndex
CREATE INDEX "SimulationRun_simulationId_idx" ON "SimulationRun"("simulationId");

-- CreateIndex
CREATE INDEX "SimulationRun_status_idx" ON "SimulationRun"("status");

-- CreateIndex
CREATE INDEX "SimulationRun_requestedById_idx" ON "SimulationRun"("requestedById");

-- CreateIndex
CREATE INDEX "Review_projectId_idx" ON "Review"("projectId");

-- CreateIndex
CREATE INDEX "Review_createdById_idx" ON "Review"("createdById");

-- CreateIndex
CREATE INDEX "Review_status_idx" ON "Review"("status");

-- CreateIndex
CREATE INDEX "Evidence_reviewId_idx" ON "Evidence"("reviewId");

-- CreateIndex
CREATE INDEX "Attachment_reviewId_idx" ON "Attachment"("reviewId");

-- CreateIndex
CREATE INDEX "AuditEvent_actorId_idx" ON "AuditEvent"("actorId");

-- CreateIndex
CREATE INDEX "AuditEvent_entity_entityId_idx" ON "AuditEvent"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");

-- CreateIndex
CREATE INDEX "MaterialPreset_name_idx" ON "MaterialPreset"("name");

-- CreateIndex
CREATE INDEX "LightingPreset_name_idx" ON "LightingPreset"("name");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceViewConfig_twinId_key" ON "WorkspaceViewConfig"("twinId");

-- CreateIndex
CREATE INDEX "WorkspaceViewConfig_twinId_idx" ON "WorkspaceViewConfig"("twinId");

-- CreateIndex
CREATE INDEX "ViewportHotspot_twinId_idx" ON "ViewportHotspot"("twinId");

-- CreateIndex
CREATE INDEX "AlertEvent_twinId_idx" ON "AlertEvent"("twinId");

-- CreateIndex
CREATE INDEX "AlertEvent_severity_idx" ON "AlertEvent"("severity");

-- CreateIndex
CREATE INDEX "AlertEvent_createdAt_idx" ON "AlertEvent"("createdAt");

-- CreateIndex
CREATE INDEX "TwinActivityLog_twinId_idx" ON "TwinActivityLog"("twinId");

-- CreateIndex
CREATE INDEX "TwinActivityLog_createdAt_idx" ON "TwinActivityLog"("createdAt");

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalTwin" ADD CONSTRAINT "DigitalTwin_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subsystem" ADD CONSTRAINT "Subsystem_twinId_fkey" FOREIGN KEY ("twinId") REFERENCES "DigitalTwin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subsystem" ADD CONSTRAINT "Subsystem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Subsystem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interface" ADD CONSTRAINT "Interface_subsystemId_fkey" FOREIGN KEY ("subsystemId") REFERENCES "Subsystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_subsystemId_fkey" FOREIGN KEY ("subsystemId") REFERENCES "Subsystem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_twinId_fkey" FOREIGN KEY ("twinId") REFERENCES "DigitalTwin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Simulation" ADD CONSTRAINT "Simulation_twinId_fkey" FOREIGN KEY ("twinId") REFERENCES "DigitalTwin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationRun" ADD CONSTRAINT "SimulationRun_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "Simulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationRun" ADD CONSTRAINT "SimulationRun_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceViewConfig" ADD CONSTRAINT "WorkspaceViewConfig_twinId_fkey" FOREIGN KEY ("twinId") REFERENCES "DigitalTwin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceViewConfig" ADD CONSTRAINT "WorkspaceViewConfig_selectedMaterialId_fkey" FOREIGN KEY ("selectedMaterialId") REFERENCES "MaterialPreset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceViewConfig" ADD CONSTRAINT "WorkspaceViewConfig_selectedLightingId_fkey" FOREIGN KEY ("selectedLightingId") REFERENCES "LightingPreset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewportHotspot" ADD CONSTRAINT "ViewportHotspot_twinId_fkey" FOREIGN KEY ("twinId") REFERENCES "DigitalTwin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewportHotspot" ADD CONSTRAINT "ViewportHotspot_subsystemId_fkey" FOREIGN KEY ("subsystemId") REFERENCES "Subsystem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertEvent" ADD CONSTRAINT "AlertEvent_twinId_fkey" FOREIGN KEY ("twinId") REFERENCES "DigitalTwin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwinActivityLog" ADD CONSTRAINT "TwinActivityLog_twinId_fkey" FOREIGN KEY ("twinId") REFERENCES "DigitalTwin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwinActivityLog" ADD CONSTRAINT "TwinActivityLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
