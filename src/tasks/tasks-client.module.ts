import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TASKS_QUEUE, TASKS_SERVICE } from '@crm/shared';
import { TasksClient } from './tasks.client';
@Module({
  imports: [
    ClientsModule.register([
      {
        name: TASKS_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBIT_URL ?? 'amqp://localhost:5672'],
          queue: TASKS_QUEUE,
          persistent: true,
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  providers: [TasksClient],
  exports: [TasksClient],
})
export class TasksClientModule {}
