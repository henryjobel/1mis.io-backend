import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';

let app: any;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule);
    app.enableCors();
    app.use(helmet());
    app.use(json({ limit: '25mb' }));
    app.use(urlencoded({ extended: true, limit: '25mb' }));
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  }
  return app;
}

// Vercel serverless handler
module.exports = async (req: any, res: any) => {
  const nestApp = await bootstrap();
  const expressApp = nestApp.getHttpAdapter().getInstance();
  expressApp(req, res);
};

// Local dev
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  bootstrap().then(async (nestApp) => {
    await nestApp.listen(process.env.PORT ?? 4000);
  });
}
