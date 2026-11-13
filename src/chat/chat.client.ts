import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CHAT_SERVICE, ChatContract, ServiceClient } from '@crm/shared';

@Injectable()
export class ChatClient extends ServiceClient<ChatContract> {
  constructor(@Inject(CHAT_SERVICE) client: ClientProxy) {
    super(client, 'chat-service');
  }
}
