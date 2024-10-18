import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class XSecurityMiddleware implements NestMiddleware {
  private readonly maxAttempts = 5;
  private readonly decayMinutes = 1;
  private readonly rateLimitStore = new Map<
    string,
    { count: number; resetTime: number }
  >();

  use(req: Request, res: Response, next: NextFunction) {
    if (process.env.XSECURITY_ENABLED !== 'true') {
      return next();
    }

    const clientIp = req.ip;
    const currentTime = Date.now();

    // Check rate limit
    if (this.isRateLimited(clientIp, currentTime)) {
      throw new HttpException(
        'Too many requests. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const token = req.header('X-SECURITY-TOKEN');
    if (!token || !this.isValidXSecureToken(token)) {
      this.incrementFailedAttempts(clientIp, currentTime);
      throw new HttpException('Invalid XSECURITY token', HttpStatus.FORBIDDEN);
    }

    // Reset failed attempts for the client
    this.rateLimitStore.delete(clientIp);

    next();
  }

  private isRateLimited(clientIp: string, currentTime: number): boolean {
    const rateLimit = this.rateLimitStore.get(clientIp);
    if (!rateLimit) return false;

    if (currentTime > rateLimit.resetTime) {
      this.rateLimitStore.delete(clientIp);
      return false;
    }

    return rateLimit.count >= this.maxAttempts;
  }

  private incrementFailedAttempts(clientIp: string, currentTime: number): void {
    const rateLimit = this.rateLimitStore.get(clientIp) || {
      count: 0,
      resetTime: currentTime + this.decayMinutes * 60 * 1000,
    };
    rateLimit.count++;
    this.rateLimitStore.set(clientIp, rateLimit);
  }

  private isValidXSecureToken(signedToken: string): boolean {
    const sharedSecretKey = process.env.XSECURITY_SECRET;
    const parts = signedToken.split('.');
    if (parts.length !== 2) return false;

    const [token, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', sharedSecretKey)
      .update(token)
      .digest('hex');

    if (
      !crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signature),
      )
    ) {
      return false;
    }

    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    if (!payload || !payload.expiry) return false;

    return Date.now() / 1000 < payload.expiry;
  }
}
