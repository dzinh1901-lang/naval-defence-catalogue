import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  validateUser(token: string) {
    // TODO: replace with real JWT verification
    if (!token) return null;

    return {
      userId: 'dev-user',
      organizationId: 'dev-org',
      roles: ['admin'],
    };
  }
}
