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

  async getActivities(userId: number, page: number, limit: number) {
    const advisor = await this.authService.findAdvisorByUserId(userId);
    const count = await this.activityRepo.count({
      where: {
        advisorId: advisor,
      },
    });
    const payload = await this.activityRepo.find({
      where: { advisorId: advisor },
      order: { id: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
      relations: {
        studentId: {
          user: true,
        },
        advisorId: {
          user: true,
        },
        coordinatorId: {
          user: true,
        },
      },
      select: {
        studentId: {
          id: true,
          user: {
            id: true,
            userEmail: true,
          },
        },
        advisorId: {
          id: true,
          user: {
            userEmail: true,
          },
        },
        coordinatorId: {
          id: true,
          user: {
            userEmail: true,
          },
        },
      },
    });
    const pages = Math.ceil(count / limit);
    return { payload, pages };
  }

  async getCoordinatorActivities(page: number, limit: number) {
    const count = await this.activityRepo.count();
    const payload = await this.activityRepo.find({
      take: limit,
      skip: (page - 1) * limit,
      relations: {
        studentId: {
          user: true,
        },
        advisorId: {
          user: true,
        },
        coordinatorId: {
          user: true,
        },
      },
      select: {
        studentId: {
          id: true,
          user: {
            id: true,
            userEmail: true,
          },
        },
        advisorId: {
          id: true,
          user: {
            userEmail: true,
          },
        },
        coordinatorId: {
          id: true,
          user: {
            userEmail: true,
          },
        },
      },
    });
    const pages = Math.ceil(count / limit);
    return { payload, pages };
  }

  async getStudentActivities(userId: number, page: number, limit: number) {
    const student = await this.authService.findStudentByUserId(userId);
    const count = await this.activityRepo.count({
      where: {
        studentId: student,
        status: 1,
      },
    });
    const payload = await this.activityRepo.find({
      where: { studentId: student, status: 1 },
      take: limit,
      skip: (page - 1) * limit,
      relations: {
        studentId: {
          user: true,
        },
        advisorId: {
          user: true,
        },
        coordinatorId: {
          user: true,
        },
      },
      select: {
        studentId: {
          id: true,
          user: {
            id: true,
            userEmail: true,
          },
        },
        advisorId: {
          id: true,
          user: {
            userEmail: true,
          },
        },
        coordinatorId: {
          id: true,
          user: {
            userEmail: true,
          },
        },
      },
    });
    const pages = Math.ceil(count / limit);
    return { payload, pages };
  }

  async updateActivity(id: number, createActivityDto: createActivityDto) {
    const student = await this.studentRepo.findOneBy({
      id: createActivityDto.studentId,
    });
    const activity = await this.activityRepo.findOneBy({
      id,
    });
    if (!activity) {
      throw new Error('Activity not found');
    }
    activity.createdAt = new Date();
    activity.studentId = student;
    activity.description = createActivityDto.description;
    activity.dateStart = createActivityDto.startDate;
    activity.dateEnd = createActivityDto.endDate;
    activity.status = 0;
    return await this.activityRepo.save(activity);
  }

  async deleteActivity(id: number) {
    const activity = await this.activityRepo.findOneBy({
      id,
    });
    if (!activity) {
      throw new Error('Activity not found');
    }
    return await this.activityRepo.remove(activity);
  }

  async approveActivity(id: number, userId: number) {
    const coordinator = await this.authService.findCoordinatorByUserId(userId);
    const activity = await this.activityRepo.findOneBy({
      id,
    });
    if (!activity) {
      throw new Error('Activity not found');
    }
    activity.coordinatorId = coordinator;
    activity.updatedAt = new Date();
    activity.status = 1;
    return await this.activityRepo.save(activity);
  }

  async rejectActivity(id: number, message: string, userId: number) {
    const coordinator = await this.authService.findCoordinatorByUserId(userId);
    const activity = await this.activityRepo.findOneBy({
      id,
    });
    if (!activity) {
      throw new Error('Activity not found');
    }
    activity.coordinatorId = coordinator;
    activity.updatedAt = new Date();
    activity.status = -1;
    activity.message = message;
    return await this.activityRepo.save(activity);
  }
}
