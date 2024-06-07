import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dtos/CreateMessageDto';
import { LoginGuard, StudentGuard } from 'src/authentication/utils/Guards';
import { JWTGuard } from 'src/authentication/utils/jwt.gurad';

@Controller('message')
@UseGuards(JWTGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('contacts')
  async getContacts(@Request() req: Request) {
    console.log('from contacts controller');
    return this.messageService.getContacts(
      req['user']['userEmail'],
      req['user']['role'],
    );
  }

  @Get(':id')
  async getMessageById(@Param('id', ParseIntPipe) id: number) {
    return await this.messageService.getMessageById(id);
  }

  @Get('chat/student/:id')
  async getChatStudent(
    @Request() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.messageService.getChat(req['user']['id'], id, false);
  }

  @Get('chat/advisor/:id')
  async getChat(
    @Request() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.messageService.getChat(req['user']['id'], id, true);
  }

  @Post('advisor')
  @UsePipes(ValidationPipe)
  async createMessageStudent(
    @Body() createMessageDto: CreateMessageDto,
    @Request() req: Request,
  ) {
    return this.messageService.createMessageAdvisor(
      createMessageDto,
      req['user']['id'],
    );
  }

  @Post('student')
  @UsePipes(ValidationPipe)
  async createMessage(
    @Body() createMessageDto: CreateMessageDto,
    @Request() req: Request,
  ) {
    return this.messageService.createMessageStudent(
      createMessageDto,
      req['user']['id'],
    );
  }
}
