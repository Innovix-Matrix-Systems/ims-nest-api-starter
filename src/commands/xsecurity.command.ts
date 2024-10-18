import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { Command } from 'nestjs-command';

@Injectable()
export class XSecureInstallCommand {
  @Command({
    command: 'xsecurity:install',
    describe: 'Install XSecurity',
  })
  async run() {
    // Generate a secret
    const secret = crypto.randomBytes(64).toString('base64');

    // Update .env file
    const envPath = '.env';
    let envContent = fs.existsSync(envPath)
      ? fs.readFileSync(envPath, 'utf8')
      : '';

    // Update or add XSECURITY_SECRET
    const regex = /^XSECURITY_SECRET=.*/m;
    const newLine = `XSECURITY_SECRET=${secret}`;

    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, newLine);
    } else {
      envContent += `\n${newLine}`;
    }

    // Update or add XSECURITY_ENABLED
    const enabledRegex = /^XSECURITY_ENABLED=.*/m;
    const enabledLine = 'XSECURITY_ENABLED=true';

    if (enabledRegex.test(envContent)) {
      envContent = envContent.replace(enabledRegex, enabledLine);
    } else {
      envContent += `\n${enabledLine}`;
    }

    fs.writeFileSync(envPath, envContent);

    console.log(`Generated secret: ${secret}`);
    console.log('XSECURITY_SECRET key has been updated in the .env file.');

    // Reload environment variables
    dotenv.config();
  }
}
