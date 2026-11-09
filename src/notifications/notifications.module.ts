import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsSseHub } from './notifications-sse.hub';
import { UsersModule } from '../users/users.module';
import { NotificationsProducer } from './notifications.producer';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NOTIFICATIONS_QUEUE, NOTIFICATIONS_SERVICE } from '@crm/shared';
import { NotificationsClient } from './notifications.client';
import { NotificationsEventsController } from './notifications-events.controller';
@Module({
  imports: [
    UsersModule,
    ClientsModule.register([
      {
        name: NOTIFICATIONS_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBIT_URL ?? 'amqp://localhost:5672'],
          queue: NOTIFICATIONS_QUEUE,
          persistent: true,
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [NotificationsController, NotificationsEventsController],
  providers: [NotificationsSseHub, NotificationsClient, NotificationsProducer],
  exports: [NotificationsProducer],
})
export class NotificationsModule {}
