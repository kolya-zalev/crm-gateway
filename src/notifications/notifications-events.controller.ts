import { Controller } from '@nestjs/common';
import { NotificationsSseHub } from './notifications-sse.hub';
import { EventPattern, Payload } from '@nestjs/microservices';
import { eventsNotifications, NotificationCreatedEvent } from '@crm/shared';
import { notificationSseEvents } from './notifications.constants';
@Controller()
export class NotificationsEventsController {
  constructor(private readonly sseHub: NotificationsSseHub) {}

  @EventPattern(eventsNotifications.notificationCreated)
  notificationsCreated(
    @Payload() { userId, notification }: NotificationCreatedEvent,
  ) {
    return this.sseHub.sendToUser(
      userId,
      notification,
      notificationSseEvents.notification,
    );
  }
}
