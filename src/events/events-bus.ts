import {
  EventsPublisher,
  RABBIT_URL,
  type CrmEventName,
  type CrmEvents,
} from '@crm/shared';
import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';

@Injectable()
export class EventsBus implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(EventsBus.name);
  private readonly publisher = new EventsPublisher(
    process.env[RABBIT_URL] ?? 'amqp://localhost:5672',
  );

  async onModuleInit() {
    await this.publisher.connect();
  }

  publish<K extends CrmEventName>(event: K, data: CrmEvents[K]): Promise<void> {
    return this.publisher.publish(event, data);
  }

  async tryPublish<K extends CrmEventName>(
    event: K,
    data: CrmEvents[K],
  ): Promise<void> {
    try {
      await this.publisher.publish(event, data);
    } catch (error) {
      this.logger.warn(
        `Failed to publish ${event}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async onApplicationShutdown() {
    await this.publisher.close();
  }
}
