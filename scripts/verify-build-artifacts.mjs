import { access } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const requiredArtifacts = [
  'apps/api/dist/main.js',
  'apps/worker/dist/index.js',
  'apps/web/.next/BUILD_ID',
  'apps/web/.next/standalone/apps/web/server.js',
  'packages/domain/dist/index.js',
  'packages/ui/dist/index.js',
];

async function main() {
  await Promise.all(
    requiredArtifacts.map(async (relativePath) => {
      const artifactPath = path.join(rootDir, relativePath);
      await access(artifactPath);
    }),
  );

  console.log(`Verified build artifacts:\n- ${requiredArtifacts.join('\n- ')}`);
}

main().catch((error) => {
  console.error('Build artifact verification failed.');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
