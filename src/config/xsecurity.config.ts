import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { XSecurityConfig } from 'nestjs-xsecurity';
import { getConfigValue } from '../utils/helper';

// Load environment variables for CLI usage
config();

export class XsecurityConfig {
  constructor(private readonly configService?: ConfigService) {}

  configureOptions(): XSecurityConfig {
    return {
      enabled: !!getConfigValue<boolean>(
        'XSECURITY_ENABLED',
        false,
        this.configService,
      ),
      secret: getConfigValue<string>(
        'XSECURITY_SECRET',
        '',
        this.configService,
      ),
      token: {
        headerName: 'X-SECURITY-TOKEN',
      },
      rateLimit: {
        enabled: !!getConfigValue<boolean>(
          'XSECURITY_RATE_LIMIT_ENABLED',
          false,
          this.configService,
        ),
        maxAttempts: Number(
          getConfigValue<string>(
            'XSECURITY_MAX_ATTEMPTS',
            '0',
            this.configService,
          ),
        ),
        decayMinutes: Number(
          getConfigValue<string>(
            'XSECURITY_DECAY_MINUTES',
            '0',
            this.configService,
          ),
        ),
        storeLimit: Number(
          getConfigValue<string>(
            'XSECURITY_RATE_LIMIT_STORE_LIMIT',
            '10000',
            this.configService,
          ),
        ),
      },
      exclude: ['/health', '/api/v1/ping'],
    };
  }
}

export default (configService?: ConfigService) =>
  new XsecurityConfig(configService).configureOptions();
