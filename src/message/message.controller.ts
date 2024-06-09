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
import { JWTGuard } from 'src/authentication/utils/jwt.gurad';
import { RolesGuards } from 'src/authentication/utils/roles.guard';
import { Roles } from 'src/authentication/utils/roles.decorator';

@Controller('message')
@UseGuards(JWTGuard, RolesGuards)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Roles('student', 'advisor')
  @Get('contacts')
  async getContacts(@Request() req: Request) {
    console.log('from contacts controller');
    return this.messageService.getContacts(
      req['user']['userEmail'],
      req['user']['role'],
    );
  }

  @Roles('student', 'advisor')
  @Get(':id')
  async getMessageById(@Param('id', ParseIntPipe) id: number) {
    return await this.messageService.getMessageById(id);
  }

  @Roles('student')
  @Get('chat/student/:id')
  async getChatStudent(
    @Request() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.messageService.getChat(req['user']['id'], id, false);
  }

  @Roles('advisor')
  @Get('chat/advisor/:id')
  async getChat(
    @Request() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.messageService.getChat(req['user']['id'], id, true);
  }

  @Roles('advisor')
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

  @Roles('student')
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
