import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post('make')
  createAnnouncement(@Body() announcement: any) {
    return this.announcementsService.create(announcement?.announcement);
  }

  @Get(':page')
  getAnnouncements(@Param('page', ParseIntPipe) page: number){
    return this.announcementsService.findAll(page);
  }

  @Get('remove/:id')
  removeAnnouncement(@Param() id: string) {
    return this.announcementsService.remove(id);
  }

  @Post('edit/:id')
  editAnnouncement(@Param() id: string, @Body() announcement: string) {
    console.log(id, announcement);
    return this.announcementsService.edit(id, announcement);
  }
}
