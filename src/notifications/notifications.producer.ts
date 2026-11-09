import { Injectable } from '@nestjs/common';
import { NotificationsClient } from './notifications.client';
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
@Injectable()
export class NotificationsProducer {
  constructor(
    private readonly notificationsClient: NotificationsClient,
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
    return this.notificationsClient.emit(eventsNotifications.leadAssigned, {
      ...params,
      leaderIds,
    });
  }
  async leadClosed(params: Omit<LeadClosedEvent, 'leaderIds'>) {
    const leaderIds = await this.getLeaderIds();
    return this.notificationsClient.emit(eventsNotifications.leadClosed, {
      ...params,
      leaderIds,
    });
  }
  async leadStatusChanged(params: Omit<LeadStatusChangedEvent, 'leaderIds'>) {
    const leaderIds = await this.getLeaderIds();

    return this.notificationsClient.emit(
      eventsNotifications.leadStatusChanged,
      {
        ...params,
        leaderIds,
      },
    );
  }
  async taskCreated(params: Omit<TaskCreatedEvent, 'leaderIds'>) {
    const leaderIds = await this.getLeaderIds();

    return this.notificationsClient.emit(eventsNotifications.taskCreated, {
      ...params,
      leaderIds,
    });
  }
  async taskDeleted(params: Omit<TaskDeletedEvent, 'leaderIds'>) {
    const leaderIds = await this.getLeaderIds();

    return this.notificationsClient.emit(eventsNotifications.taskDeleted, {
      ...params,
      leaderIds,
    });
  }
}
