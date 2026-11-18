import { Global, Module } from '@nestjs/common';
import { EventsBus } from './events-bus';
import { RABBIT_URL } from '@crm/shared';

@Global()
@Module({
  providers: [
    EventsBus,
    {
      provide: RABBIT_URL,
      useValue: process.env[RABBIT_URL] ?? 'amqp://localhost:5672',
    },
  ],
  exports: [EventsBus],
})
export class EventsModule {}
