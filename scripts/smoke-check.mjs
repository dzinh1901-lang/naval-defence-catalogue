const apiBase = (process.env.API_SMOKE_URL ?? 'http://localhost:4000').replace(/\/$/, '');
const webBase = (process.env.WEB_SMOKE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

async function expectOk(url, description) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${description} failed with ${response.status} ${response.statusText}`);
  }

  return response;
}

async function main() {
  const healthResponse = await expectOk(`${apiBase}/api/v1/health`, 'API health check');
  const healthBody = await healthResponse.json();

  if (!healthBody || !['ok', 'degraded'].includes(healthBody.status)) {
    throw new Error(`Unexpected API health payload: ${JSON.stringify(healthBody)}`);
  }

  const webResponse = await expectOk(webBase, 'Web root check');
  const html = await webResponse.text();

  if (!html.includes('Digital Twin Platform')) {
    throw new Error('Web root check did not render the expected shell content');
  }

  console.log(`Smoke checks passed for API (${apiBase}) and web (${webBase}).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
