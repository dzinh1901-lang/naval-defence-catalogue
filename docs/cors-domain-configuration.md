# CORS Domain Configuration

## Overview

This document describes the Cross-Origin Resource Sharing (CORS) configuration for the Naval Defence Catalogue API to support connections from the production workspace domain and DNS parking subdomains.

## Configured Domains

The following domains are configured to access the API via CORS:

1. **Primary Workspace Domain**: `https://auren-workspace.com`
   - Main production workspace interface

2. **DNS Parking Subdomains**:
   - `https://byte.dns-parking.com`
   - `https://pixel.dns-parking.com`

## Configuration

### Environment Variable

The CORS configuration is controlled via the `CORS_ALLOWED_ORIGINS` environment variable in the API runtime.

**Example Configuration:**
```bash
CORS_ALLOWED_ORIGINS=https://auren-workspace.com,https://byte.dns-parking.com,https://pixel.dns-parking.com
```

### Deployment Environments

#### Local Development
For local development, the `.env.example` file has been updated with the production CORS configuration. Copy it to `.env` and adjust as needed for your local setup:

```bash
cp .env.example .env
# Edit .env to adjust CORS_ALLOWED_ORIGINS if needed for local development
```

#### Staging
Set the `CORS_ALLOWED_ORIGINS` environment variable in your staging deployment configuration with the staging equivalents of these domains, or use the production domains if staging shares the same frontend hosts.

#### Production
Ensure the `CORS_ALLOWED_ORIGINS` environment variable is set in your production deployment with:
```
CORS_ALLOWED_ORIGINS=https://auren-workspace.com,https://byte.dns-parking.com,https://pixel.dns-parking.com
```

## How It Works

1. The API runtime environment parser (`apps/api/src/config/runtime-env.ts`) reads the `CORS_ALLOWED_ORIGINS` value
2. Each origin is validated to ensure it's a valid absolute HTTP(S) URL
3. The parsed origins are passed to NestJS's `app.enableCors()` configuration
4. Only requests from these specific origins will be allowed to access the API from browsers

## Security Considerations

- **Protocol**: Only `https://` origins are recommended for production (HTTP is technically supported but discouraged)
- **Exact Match**: CORS origins must match exactly - subdomains and ports are treated as different origins
- **Wildcard Not Supported**: For security, wildcard origins are not supported in the current configuration
- **Credentials**: CORS is configured with `credentials: true` to support authenticated requests

## Validation

The configuration includes validation that ensures:
- All origins are valid absolute URLs
- All origins use HTTP or HTTPS protocol
- Invalid origins will cause the API to fail at startup with a clear error message

## Testing CORS Configuration

To test that CORS is working correctly:

1. **From Browser Console** (when accessing from an allowed origin):
```javascript
fetch('https://your-api-url/api/v1/health', {
  method: 'GET',
  credentials: 'include'
})
  .then(r => r.json())
  .then(console.log);
```

2. **Expected Behavior**:
   - Requests from allowed origins: Succeed with proper response
   - Requests from disallowed origins: Blocked by browser with CORS error

## Troubleshooting

### Issue: CORS errors in browser
**Symptoms**: Browser console shows "blocked by CORS policy" errors

**Solutions**:
1. Verify `CORS_ALLOWED_ORIGINS` includes the exact origin (including protocol and port)
2. Check API startup logs for the parsed `corsAllowedOrigins` array
3. Ensure the origin in the browser matches exactly (check protocol, subdomain, port)

### Issue: API fails to start
**Symptoms**: API crashes on startup with CORS-related error

**Solutions**:
1. Check that all origins in `CORS_ALLOWED_ORIGINS` are valid absolute URLs
2. Ensure origins use `http://` or `https://` protocol
3. Remove any trailing slashes or invalid characters

## Related Files

- `.env.example` - Example environment configuration with CORS settings
- `apps/api/src/config/runtime-env.ts` - Runtime environment parser
- `apps/api/src/main.ts` - CORS configuration implementation
- `docs/deployment-readiness.md` - Deployment environment requirements
- `docs/production-deploy-setup.md` - Production deployment guide
- `README.md` - Main repository documentation

## References

- [NestJS CORS Documentation](https://docs.nestjs.com/security/cors)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [OWASP CORS Security Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#cross-origin-resource-sharing)
