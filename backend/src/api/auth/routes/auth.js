'use strict';

/**
 * auth routes
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/auth/2fa/generate',
      handler: 'auth.generate2FA',
      config: {
        description: 'Generate 2FA secret and QR code',
        prefix: '',
      },
    },
    {
      method: 'POST',
      path: '/auth/2fa/verify',
      handler: 'auth.verify2FA',
      config: {
        description: 'Verify and enable 2FA',
        prefix: '',
      },
    },
    {
      method: 'POST',
      path: '/auth/2fa/login',
      handler: 'auth.login2FA',
      config: {
        description: 'Login step 2 with TOTP',
        prefix: '',
      },
    },
    {
      method: 'GET',
      path: '/auth/2fa/status',
      handler: 'auth.getStatus',
      config: {
        description: 'Check 2FA status',
        prefix: '',
      },
    },
  ],
};
