import { Injectable } from '@nestjs/common';
import { Actor, leadsMessages, tasksMessages } from '@crm/shared';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { NotificationsProducer } from '../notifications/notifications.producer';
import { LeadsClient } from '../leads/leads.client';
import { TasksClient } from './tasks.client';
import { Logger } from '@nestjs/common';
@Injectable()
export class TasksFacade {
  private readonly logger = new Logger(TasksFacade.name);

  constructor(
    private readonly tasks: TasksClient,
    private readonly leads: LeadsClient,
    private readonly notifications: NotificationsProducer,
  ) {}

  findAll() {
    return this.tasks.send(tasksMessages.tasksFindAll, {});
  }

  findByLead(leadId: string) {
    return this.tasks.send(tasksMessages.tasksFindByLead, { leadId });
  }

  update(taskId: string, dto: UpdateTaskDto) {
    return this.tasks.send(tasksMessages.tasksUpdate, {
      taskId,
      data: dto,
    });
  }

  async create(leadId: string, dto: CreateTaskDto, actor: Actor) {
    const lead = await this.leads.send(leadsMessages.leadsFindOne, {
      id: leadId,
    });

    const task = await this.tasks.send(tasksMessages.tasksCreate, {
      leadId,
      data: dto,
    });

    await this.notifications.taskCreated({
      actor,
      leadId,
      leadName: lead.name,
      taskTitle: task.title,
    });

    return task;
  }

  async remove(taskId: string, actor: Actor) {
    const task = await this.tasks.send(tasksMessages.tasksRemove, { taskId });

    try {
      const lead = await this.leads.send(leadsMessages.leadsFindOne, {
        id: task.leadId,
      });

      await this.notifications.taskDeleted({
        actor,
        leadId: task.leadId,
        leadName: lead.name,
        assignTask: task.title,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to emit taskDeleted event for task ${taskId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    return task;
  }
}
