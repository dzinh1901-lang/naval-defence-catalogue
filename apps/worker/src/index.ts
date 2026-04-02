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

import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { assertWorkerRuntimeEnvironment, formatWorkerDatabaseTarget } from './runtime-env';

const prisma = new PrismaClient();
const DB_STARTUP_RETRIES = 10;
const DB_RETRY_DELAY_MS = 3_000;
const readyFile = process.env['WORKER_READY_FILE']?.trim();

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function writeReadyFile() {
  if (!readyFile) {
    return;
  }

  await mkdir(path.dirname(readyFile), { recursive: true });
  await writeFile(readyFile, new Date().toISOString(), 'utf8');
}

async function clearReadyFile() {
  if (!readyFile) {
    return;
  }

  await rm(readyFile, { force: true });
}

async function waitForDatabase() {
  for (let attempt = 1; attempt <= DB_STARTUP_RETRIES; attempt++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('[worker] Database connection OK');
      return;
    } catch (error) {
      if (attempt === DB_STARTUP_RETRIES) {
        throw error;
      }

      console.warn(
        `[worker] Database not reachable (attempt ${attempt}/${DB_STARTUP_RETRIES}); retrying in ${DB_RETRY_DELAY_MS}ms...`,
      );
      await sleep(DB_RETRY_DELAY_MS);
    }
  }
}

async function main() {
  const runtimeConfig = assertWorkerRuntimeEnvironment();
  await clearReadyFile();
  console.log(
    `[worker] Startup checks passed ${JSON.stringify({
      environment: process.env['NODE_ENV'] ?? 'development',
      databaseTarget: formatWorkerDatabaseTarget(runtimeConfig.databaseUrl),
      readyFile: runtimeConfig.readyFile ?? 'disabled',
    })}`,
  );
  console.log('[worker] Naval Digital Twin Platform — Worker starting...');
  await waitForDatabase();
  await writeReadyFile();

  console.log(
    `[worker] Ready ${JSON.stringify({
      database: 'ok',
      readyFile: runtimeConfig.readyFile ?? 'disabled',
    })}`,
  );
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
    void clearReadyFile()
      .catch(() => undefined)
      .then(() => prisma.$disconnect())
      .then(() => {
        console.log('[worker] Shutdown complete');
        process.exit(0);
      });
  });

  process.on('SIGTERM', () => {
    clearInterval(interval);
    void clearReadyFile()
      .catch(() => undefined)
      .then(() => prisma.$disconnect())
      .then(() => {
        console.log('[worker] Shutdown complete');
        process.exit(0);
      });
  });
}

main().catch((err) => {
  void clearReadyFile().catch(() => undefined);
  console.error('[worker] Fatal startup error:', err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
