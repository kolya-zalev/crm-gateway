import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatSseHub } from './chat-sse.hub';
import { ChatClient } from './chat.client';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CHAT_QUEUE, CHAT_SERVICE, RABBIT_URL } from '@crm/shared';
@Module({
  imports: [
    ClientsModule.register([
      {
        name: CHAT_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [process.env[RABBIT_URL] ?? 'amqp://localhost:5672'],
          queue: CHAT_QUEUE,
          persistent: true,
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatClient, ChatSseHub],
})
export class ChatModule {}
