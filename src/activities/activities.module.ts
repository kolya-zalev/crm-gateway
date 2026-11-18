import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ACTIVITY_QUEUE, ACTIVITY_SERVICE, RABBIT_URL } from '@crm/shared';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { ActivityClient } from './activity.client';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: ACTIVITY_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [process.env[RABBIT_URL] ?? 'amqp://localhost:5672'],
          queue: ACTIVITY_QUEUE,
          persistent: true,
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService, ActivityClient],
})
export class ActivitiesModule {}
