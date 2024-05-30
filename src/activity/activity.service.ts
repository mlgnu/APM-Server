import { Injectable } from '@nestjs/common';
import { createActivityDto } from './dtos/createActivity.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from 'src/typeorm/Activity';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { User } from 'src/typeorm';
import { Student } from 'src/typeorm/Student';
import { Roles } from 'src/authentication/utils/roles.decorator';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
    private readonly authService: AuthenticationService,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
  ) {}
  async createActivity(createActivityDto: createActivityDto, userId: number) {
    const advisor = await this.authService.findAdvisorByUserId(userId);
    const student = await this.studentRepo.findOneBy({
      id: createActivityDto.studentId,
    });

    const activity = this.activityRepo.create({
      studentId: student,
      advisorId: advisor,
      description: createActivityDto.description,
      dateStart: createActivityDto.startDate,
      dateEnd: createActivityDto.endDate,
    });
    return await this.activityRepo.save(activity);
  }

  @Roles('advisor')
  async getActivities(userId: number, page: number, limit: number) {
    const advisor = await this.authService.findAdvisorByUserId(userId);
    const count = await this.activityRepo.count({
      where: {
        advisorId: advisor,
      },
    });
    const payload = await this.activityRepo.find({
      where: { advisorId: advisor },
      take: limit,
      skip: (page - 1) * limit,
      relations: {
        studentId: {
          user: true,
        },
        advisorId: {
          user: true,
        },
      },
    });
    const pages = Math.ceil(count / limit);
    return { payload, pages };
  }
}
