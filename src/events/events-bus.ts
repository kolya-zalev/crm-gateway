import {
  EventsPublisher,
  RABBIT_URL,
  type CrmEventName,
  type CrmEvents,
} from '@crm/shared';
import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
@Injectable()
export class EventsBus implements OnModuleInit, OnApplicationShutdown {
  private readonly publisher = new EventsPublisher(
    process.env[RABBIT_URL] ?? 'amqp://localhost:5672',
  );

  async onModuleInit() {
    await this.publisher.connect();
  }

  publish<K extends CrmEventName>(event: K, data: CrmEvents[K]) {
    return this.publisher.publish(event, data);
  }
  async onApplicationShutdown() {
    await this.publisher.close();
  }
}
