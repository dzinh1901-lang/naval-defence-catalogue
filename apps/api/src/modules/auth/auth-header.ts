export function extractBearerToken(
  authorizationHeader: string | string[] | undefined,
): string | undefined {
  const header = Array.isArray(authorizationHeader)
    ? authorizationHeader.find((value) => value.trim().length > 0)
    : authorizationHeader;

  if (!header) {
    return undefined;
  }

  const [scheme, token, ...rest] = header.trim().split(/\s+/);
  if (scheme !== 'Bearer' || !token || rest.length > 0) {
    return undefined;
  }

  return token;
}
