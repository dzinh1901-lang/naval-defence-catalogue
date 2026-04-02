import { spawn } from 'node:child_process';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const projectRoot = process.cwd();
const distDir = path.join(projectRoot, 'dist');
const tsBuildInfoPath = path.join(projectRoot, 'node_modules/.cache/tsbuildinfo');
const readyMarkerPath = path.join(projectRoot, 'node_modules/.cache/watch-build.ready');
const tscCliPath = path.join(projectRoot, '../../node_modules/typescript/bin/tsc');

async function main() {
  await mkdir(distDir, { recursive: true });
  const existingDistEntries = await readdir(distDir).catch(() => []);
  await Promise.all(
    existingDistEntries.map((entry) => rm(path.join(distDir, entry), { recursive: true, force: true })),
  );
  await rm(tsBuildInfoPath, { force: true });
  await rm(readyMarkerPath, { force: true });
  await mkdir(path.dirname(readyMarkerPath), { recursive: true });
  await writeFile(readyMarkerPath, 'ready\n');

  const child = spawn(
    process.execPath,
    [tscCliPath, '--project', 'tsconfig.json', '--watch', '--preserveWatchOutput'],
    {
      stdio: 'inherit',
      env: process.env,
    },
  );

  const forwardSignal = (signal) => {
    child.kill(signal);
  };

  process.on('SIGINT', forwardSignal);
  process.on('SIGTERM', forwardSignal);

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
