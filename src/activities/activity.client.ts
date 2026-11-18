import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ACTIVITY_SERVICE,
  ServiceClient,
  type ActivitiesContract,
} from '@crm/shared';

@Injectable()
export class ActivityClient extends ServiceClient<ActivitiesContract> {
  constructor(@Inject(ACTIVITY_SERVICE) client: ClientProxy) {
    super(client, 'activity-service');
  }
}
