import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  root() {
    return {
      message: '🚀 Backend is live!',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  health() {
    return {
      status: 'ok',
      service: 'backend',
      timestamp: new Date().toISOString(),
    };
  }
}
