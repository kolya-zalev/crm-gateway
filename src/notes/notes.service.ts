import { Injectable } from '@nestjs/common';
import {
  leadsEvents,
  leadsMessages,
  type Actor,
  type NoteDto,
} from '@crm/shared';
import { LeadsClient } from '../leads/leads.client';
import { EventsBus } from '../events/events-bus';
import { CreateNoteDto } from './dto/note.dto';

@Injectable()
export class NotesService {
  constructor(
    private readonly leads: LeadsClient,
    private readonly events: EventsBus,
  ) {}

  findByLead(leadId: string): Promise<NoteDto[]> {
    return this.leads.send(leadsMessages.notesFindByLead, { leadId });
  }

  async create(
    leadId: string,
    dto: CreateNoteDto,
    actor: Actor,
  ): Promise<NoteDto> {
    const note = await this.leads.send(leadsMessages.notesCreate, {
      actor,
      leadId,
      text: dto.text,
    });

    await this.events.tryPublish(leadsEvents.noteAdded, {
      actor,
      leadId,
      noteId: note.id,
      occurredAt: new Date().toISOString(),
    });

    return note;
  }

  async remove(leadId: string, noteId: string, actor: Actor): Promise<void> {
    await this.leads.send(leadsMessages.notesRemove, { actor, leadId, noteId });

    await this.events.tryPublish(leadsEvents.noteDeleted, {
      actor,
      leadId,
      noteId,
      occurredAt: new Date().toISOString(),
    });
  }
}
