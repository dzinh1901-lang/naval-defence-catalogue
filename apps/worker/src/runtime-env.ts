export function assertWorkerRuntimeEnvironment(): void {
  const databaseUrl = process.env['DATABASE_URL']?.trim();
  if (!databaseUrl) {
    throw new Error('DATABASE_URL must be set before the worker can start.');
  }
}
