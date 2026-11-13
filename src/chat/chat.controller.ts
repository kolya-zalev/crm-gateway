import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { ChatSseHub } from './chat-sse.hub';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { ChatClient } from './chat.client';
import { chatMessages } from '@crm/shared';
import { CurrentUser, type Actor } from '../auth/current-user.decorator';

@Controller('api/chat')
export class ChatController {
  constructor(
    private readonly chatClient: ChatClient,
    private readonly sseHub: ChatSseHub,
  ) {}

  @Get('messages')
  listMessages() {
    return this.chatClient.send(chatMessages.chatList, {});
  }

  @Post('messages')
  async createMessage(
    @CurrentUser() actor: Actor,
    @Body() dto: CreateChatMessageDto,
  ) {
    const message = await this.chatClient.send(chatMessages.chatCreate, {
      actor,
      text: dto.text,
    });
    this.sseHub.broadcast(message, 'message');
    return message;
  }

  @Get('sse')
  stream(@Req() req: Request, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const connectionId = randomUUID();
    this.sseHub.add(connectionId, res);
    this.sseHub.send(
      res,
      {
        message: 'Connected to chat',
        connectionCount: this.sseHub.count(),
      },
      'connected',
    );

    const cleanup = () => this.sseHub.remove(connectionId);
    req.on('close', cleanup);
  }
}
