import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ServiceClient,
  TASKS_SERVICE,
  TasksContract,
  TasksEvents,
} from '@crm/shared';

@Injectable()
export class TasksClient extends ServiceClient<TasksContract, TasksEvents> {
  constructor(@Inject(TASKS_SERVICE) client: ClientProxy) {
    super(client, 'tasks-service');
  }
}
