import test from 'node:test';
import assert from 'node:assert/strict';
import {
  describeHttpEndpoint,
  formatDatabaseTarget,
  getNodeEnvironment,
  parseDatabaseUrl,
  parsePort,
  readOptionalReadyFile,
  validateWebAuthConfig,
} from './startup-runtime.mjs';

test('parseDatabaseUrl accepts postgres connection strings', () => {
  const url = parseDatabaseUrl('postgresql://naval:naval_dev@db:5432/naval_dt');
  assert.equal(formatDatabaseTarget(url), 'db:5432/naval_dt');
});

test('parseDatabaseUrl rejects non-postgres protocols', () => {
  assert.throws(() => parseDatabaseUrl('mysql://localhost:3306/naval_dt'), /postgresql:\/\/ or postgres:\/\//);
});

test('parsePort validates integer range', () => {
  assert.equal(parsePort({ PORT: '4100' }, 4000), 4100);
  assert.throws(() => parsePort({ PORT: '70000' }, 4000), /between 1 and 65535/);
});

test('getNodeEnvironment rejects unknown runtime names', () => {
  assert.equal(getNodeEnvironment({ NODE_ENV: 'staging' }), 'staging');
  assert.throws(() => getNodeEnvironment({ NODE_ENV: 'qa' }), /must be one of/);
});

test('describeHttpEndpoint rejects container-only hostnames for public urls', () => {
  assert.equal(
    describeHttpEndpoint('API_URL', 'http://api.internal.example.com:4000').target,
    'public-network',
  );
  assert.throws(
    () => describeHttpEndpoint('NEXT_PUBLIC_API_URL', 'http://api:4000', { publicEndpoint: true }),
    /browser-reachable/,
  );
});

test('readOptionalReadyFile requires an absolute path', () => {
  assert.equal(readOptionalReadyFile({ WORKER_READY_FILE: '/tmp/naval-ready' }), '/tmp/naval-ready');
  assert.throws(() => readOptionalReadyFile({ WORKER_READY_FILE: 'tmp/naval-ready' }), /absolute path/);
});

test('validateWebAuthConfig accepts explicit tokens or full bootstrap configuration', () => {
  assert.equal(validateWebAuthConfig({ API_AUTH_TOKEN: 'token-value' }), 'token');
  assert.equal(
    validateWebAuthConfig({
      AUTH_BOOTSTRAP_SECRET: 'bootstrap-secret',
      API_SERVICE_USER_ID: 'user-1',
      API_SERVICE_EMAIL: 'ops@example.com',
      API_SERVICE_ORGANIZATION_ID: 'org-1',
      API_SERVICE_ROLE: 'ADMIN',
    }),
    'bootstrap',
  );
  assert.throws(
    () =>
      validateWebAuthConfig({
        AUTH_BOOTSTRAP_SECRET: 'short',
        API_SERVICE_USER_ID: 'user-1',
        API_SERVICE_EMAIL: 'ops@example.com',
        API_SERVICE_ORGANIZATION_ID: 'org-1',
        API_SERVICE_ROLE: 'ADMIN',
      }),
    /at least 8 characters/,
  );
});
