import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Announcement } from 'src/typeorm/Announcement';
import { Repository } from 'typeorm';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepo: Repository<Announcement>,
  ) {}

  async create(announcement: any): Promise<Announcement> {
    return await this.announcementRepo.save(announcement);
  }

  async findAll(page: number) {
    const limit = 15;
    const offset = (page - 1) * limit;

    const payload = await this.announcementRepo.find({
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });

    const count = await this.announcementRepo.count();
    const pages = Math.ceil(count / limit);
    return { payload, pages };
  }

  async findOne(id: any) {
    console.log(id?.id);
    return await this.announcementRepo.findOneBy({ id: id.id });
  }

  async remove(id) {
    const announcement = await this.findOne(id);
    return await this.announcementRepo.remove(announcement);
  }

  async edit(id, announcementDetails) {
    const announcementToUpdate = await this.findOne(id);
    console.log(announcementToUpdate, 'announcementToUpdate');
    announcementToUpdate.title = announcementDetails.announcement.title;
    announcementToUpdate.announcement =
      announcementDetails.announcement.announcement;
    return await this.announcementRepo.save(announcementToUpdate);
  }
}
