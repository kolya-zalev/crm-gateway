import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ServiceClient } from "@crm/shared";
import { LEADS_SERVICE, type LeadsContract } from "@crm/shared";

@Injectable()
export class LeadsClient extends ServiceClient<LeadsContract> {
  constructor(@Inject(LEADS_SERVICE) client: ClientProxy) {
    super(client, "leads-service");
  }
}
