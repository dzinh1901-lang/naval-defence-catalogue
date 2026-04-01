/**
 * Naval Digital Twin Platform — Worker
 *
 * Milestone 1 scaffold: minimal background worker process.
 *
 * Planned responsibilities (future milestones):
 *  - Simulation job dispatch and result ingestion
 *  - Evidence processing and indexing
 *  - Notification and alert dispatch
 *  - Audit event compaction
 *  - Scheduled data exports
 *
 * For Milestone 1 this process simply starts, logs its readiness,
 * and exposes a heartbeat ticker. Real job processors will be added
 * as NestJS modules or BullMQ workers in Milestone 2+.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[worker] Naval Digital Twin Platform — Worker starting...');

  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('[worker] Database connection OK');
  } catch (err) {
    console.warn('[worker] Database not reachable — worker will retry passively.', err);
  }

  console.log('[worker] Milestone 1 scaffold ready. Job processors will be registered in M2.');

  // Heartbeat — keeps process alive, simulates a poll loop
  let ticks = 0;
  const interval = setInterval(() => {
    ticks++;
    if (ticks % 12 === 0) {
      // Every 60 s in a 5 s tick
      console.log(`[worker] Heartbeat — ${new Date().toISOString()} — no pending jobs`);
    }
  }, 5_000);

  // Graceful shutdown
  process.on('SIGINT', () => {
    clearInterval(interval);
    void prisma.$disconnect().then(() => {
      console.log('[worker] Shutdown complete');
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    clearInterval(interval);
    void prisma.$disconnect().then(() => {
      console.log('[worker] Shutdown complete');
      process.exit(0);
    });
  });
}

main().catch((err) => {
  console.error('[worker] Fatal startup error:', err);
  process.exit(1);
});
