import { Injectable } from '@nestjs/common';
import { activitiesMessages, type ActivityDto } from '@crm/shared';
import { ActivityClient } from './activity.client';

@Injectable()
export class ActivitiesService {
  constructor(private readonly activity: ActivityClient) {}

  findByLead(leadId: string): Promise<ActivityDto[]> {
    return this.activity.send(activitiesMessages.activitiesFindByLead, {
      leadId,
    });
  }
}
