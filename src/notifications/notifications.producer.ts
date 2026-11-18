import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import {
  eventsNotifications,
  LeadAssignedEvent,
  LeadClosedEvent,
  LeadStatusChangedEvent,
  permissions,
  TaskCreatedEvent,
  TaskDeletedEvent,
} from '@crm/shared';
import { EventsBus } from '../events/events-bus';
@Injectable()
export class NotificationsProducer {
  constructor(
    private readonly events: EventsBus,
    private readonly users: UsersService,
  ) {}
  private async getLeaderIds(): Promise<string[]> {
    const leaders = await this.users.findByPermission(
      permissions.notificationLeadEvents,
    );
    return leaders.map((leader) => leader.id);
  }
  async leadAssigned(params: Omit<LeadAssignedEvent, 'leaderIds'>) {
    const leaderIds = await this.getLeaderIds();
    return this.events.publish(eventsNotifications.leadAssigned, {
      ...params,
      leaderIds,
    });
  }
  async leadClosed(params: Omit<LeadClosedEvent, 'leaderIds'>) {
    const leaderIds = await this.getLeaderIds();
    return this.events.publish(eventsNotifications.leadClosed, {
      ...params,
      leaderIds,
    });
  }
  async leadStatusChanged(params: Omit<LeadStatusChangedEvent, 'leaderIds'>) {
    const leaderIds = await this.getLeaderIds();

    return this.events.publish(eventsNotifications.leadStatusChanged, {
      ...params,
      leaderIds,
    });
  }
  async taskCreated(params: Omit<TaskCreatedEvent, 'leaderIds'>) {
    const leaderIds = await this.getLeaderIds();

    return this.events.publish(eventsNotifications.taskCreated, {
      ...params,
      leaderIds,
    });
  }
  async taskDeleted(params: Omit<TaskDeletedEvent, 'leaderIds'>) {
    const leaderIds = await this.getLeaderIds();

    return this.events.publish(eventsNotifications.taskDeleted, {
      ...params,
      leaderIds,
    });
  }
}
