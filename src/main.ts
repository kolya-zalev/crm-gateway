import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { toNodeHandler } from 'better-auth/node';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { AUTH, type Auth } from './auth/better-auth';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { GATEWAY_EVENTS_QUEUE } from '@crm/shared';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const auth = app.get<Auth>(AUTH);
  app.getHttpAdapter().getInstance().all('/api/auth/*', toNodeHandler(auth));

  app.useBodyParser('json');
  app.useBodyParser('urlencoded', { extended: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // отрезать неизвестные поля
      forbidNonWhitelisted: true, // ошибка если неизвестное поле
      transform: true, // автопреобразование типов
    }),
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBIT_URL ?? 'amqp://localhost:5672'],
      queue: GATEWAY_EVENTS_QUEUE,
      queueOptions: {
        durable: true,
      },
    },
  });
  await app.startAllMicroservices();
  const config = new DocumentBuilder()
    .setTitle('CRM API')
    .setDescription('Leads, Notes, Activities, Tasks')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port);
  console.log(`🚀 Server: http://localhost:${port}`);
  console.log(`📖 Swagger: http://localhost:${port}/api/docs`);
}
bootstrap();
