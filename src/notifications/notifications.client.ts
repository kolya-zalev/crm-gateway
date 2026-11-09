import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  NOTIFICATIONS_SERVICE,
  NotificationsContract,
  NotificationsEvents,
  ServiceClient,
} from '@crm/shared';

@Injectable()
export class NotificationsClient extends ServiceClient<
  NotificationsContract,
  NotificationsEvents
> {
  constructor(@Inject(NOTIFICATIONS_SERVICE) client: ClientProxy) {
    super(client, 'notifications-service');
  }
}
