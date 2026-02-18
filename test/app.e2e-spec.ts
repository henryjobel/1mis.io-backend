import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';

describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/health (GET)', () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    return request(server)
      .get('/health')
      .expect(200)
      .expect((res) => {
        const body = res.body as { status: string; service: string };
        expect(body.status).toBe('ok');
        expect(body.service).toBe('backend');
      });
  });
});
