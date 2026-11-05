import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ServiceClient } from "@crm/shared";
import { USERS_SERVICE, type UsersContract } from "@crm/shared";

@Injectable()
export class UsersClient extends ServiceClient<UsersContract> {
  constructor(@Inject(USERS_SERVICE) client: ClientProxy) {
    super(client, "users-service");
  }
}
