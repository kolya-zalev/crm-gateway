import { Injectable } from '@nestjs/common';
import type { Actor } from '../auth/current-user.decorator';
import { UsersService } from '../users/users.service';
import { CreateLeadDto, UpdateLeadDto } from './dto/lead.dto';
import {
  leadsEvents,
  leadsMessages,
  permissions,
  type LeadChanges,
} from '@crm/shared';
import { LeadsClient } from './leads.client';
import { NotificationsProducer } from '../notifications/notifications.producer';
import { Logger } from '@nestjs/common';
import { EventsBus } from '../events/events-bus';
@Injectable()
export class LeadsFacade {
  private readonly logger = new Logger(LeadsFacade.name);
  constructor(
    private readonly leads: LeadsClient,
    private readonly users: UsersService,
    private readonly events: EventsBus,
    private readonly notificationsProducer: NotificationsProducer,
  ) {}
  async findAll() {
    return this.attachAssignees(
      await this.leads.send(leadsMessages.leadsFindAll, {}),
    );
  }
  async findOne(id: string) {
    return this.attachAssignee(
      await this.leads.send(leadsMessages.leadsFindOne, { id }),
    );
  }
  async create(dto: CreateLeadDto, actor: Actor) {
    const lead = await this.leads.send(leadsMessages.leadsCreate, {
      actor,
      data: dto,
    });

    await this.events.tryPublish(leadsEvents.leadCreated, {
      actor,
      leadId: lead.id,
      leadName: lead.name,
      occurredAt: new Date().toISOString(),
    });

    return this.attachAssignee(lead);
  }
  async remove(id: string) {
    const result = await this.leads.send(leadsMessages.leadsRemove, { id });

    await this.events.tryPublish(leadsEvents.leadDeleted, { leadId: id });

    return result;
  }
  async update(id: string, dto: UpdateLeadDto, actor: Actor) {
    let assignee: { id: string; name: string } | null | undefined;
    if (typeof dto.assignedToId === 'string') {
      const canAssign =
        dto.assignedToId === actor.id ||
        actor.permissions.includes(permissions.leadAssign);

      assignee = canAssign
        ? await this.users.getAssignable(dto.assignedToId)
        : { id: dto.assignedToId, name: '' };
    } else if (dto.assignedToId === null) {
      assignee = null;
    }
    const { lead, changes } = await this.leads.send(leadsMessages.leadsUpdate, {
      actor,
      id,
      data: dto,
      assignee,
    });
    try {
      await this.publishUpdateEvents({
        actor,
        lead: { id: lead.id, name: lead.name },
        occurredAt: new Date().toISOString(),
        ...changes,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to publish update events for lead ${lead.id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
    return this.attachAssignee(lead);
  }
  private async attachAssignees<T extends { assignedToId: string | null }>(
    leads: T[],
  ) {
    const ids = leads.flatMap((lead) =>
      lead.assignedToId ? [lead.assignedToId] : [],
    );
    const users = await this.users.findByIds(ids);
    const usersById = new Map(users.map((user) => [user.id, user]));
    return leads.map((lead) => ({
      ...lead,
      assignedTo: lead.assignedToId
        ? (usersById.get(lead.assignedToId) ?? null)
        : null,
    }));
  }

  private async attachAssignee<T extends { assignedToId: string | null }>(
    lead: T,
  ) {
    const [withAssignee] = await this.attachAssignees([lead]);
    return withAssignee;
  }

  private async publishUpdateEvents(
    params: LeadChanges & {
      actor: Actor;
      lead: { id: string; name: string };
      occurredAt: string;
    },
  ): Promise<void> {
    const {
      actor,
      lead,
      occurredAt,
      assignedChanged,
      nextAssignee,
      statusChanged,
      closing,
      newStatus,
      previousStatus,
      previousAssigneeName,
    } = params;
    const base = { actor, leadId: lead.id, leadName: lead.name, occurredAt };

    if (assignedChanged && nextAssignee) {
      await this.notificationsProducer.leadAssigned({
        ...base,
        assignedId: nextAssignee.id,
        assignedName: nextAssignee.name,
        previousAssigneeName,
      });
    }

    if (assignedChanged && !nextAssignee) {
      await this.events.publish(leadsEvents.leadUnassigned, {
        ...base,
        previousAssigneeName,
      });
    }

    if (closing && newStatus) {
      await this.notificationsProducer.leadClosed({
        ...base,
        status: newStatus,
        previousStatus,
      });
    }

    if (statusChanged && !closing && newStatus) {
      await this.notificationsProducer.leadStatusChanged({
        ...base,
        status: newStatus,
        previousStatus,
      });
    }

    if (!statusChanged && !assignedChanged) {
      await this.events.publish(leadsEvents.leadUpdated, base);
    }
  }
}
