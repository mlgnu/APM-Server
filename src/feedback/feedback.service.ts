import { Injectable } from '@nestjs/common';
import { SubmitFeedbackDto } from './dtos/SubmitFeedbackDto';
import { InjectRepository } from '@nestjs/typeorm';
import { Feedback } from 'src/typeorm/Feedback';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepo: Repository<Feedback>,
    private readonly dataSource: DataSource,
  ) {}
  async submitFeedback(feedbackDto: SubmitFeedbackDto) {
    if (await this.getFeedback(feedbackDto.sessionId)) {
      return this.feedbackRepo.update(feedbackDto.sessionId, feedbackDto);
    }
    const feedback = this.feedbackRepo.create(feedbackDto);
    return this.feedbackRepo.save(feedback);
  }

  async getFeedback(sessionId: number) {
    return this.feedbackRepo.findOne({
      where: { sessionId },
    });
  }

  async getDashboardFeedback(advisorId: number) {
    const feedbacks = await this.dataSource
      .createQueryBuilder(Feedback, 'feedback')
      .select([
        'student.first_name, user.user_email',
        "Extract('month' FROM sessions.date) As month",
        "EXTRACT('year' FROM sessions.date) As year",
        'AVG(feedback.rating) as avg_rating',
      ])
      .innerJoin(
        'monitoring_sessions',
        'sessions',
        'feedback.session_id = sessions.id',
      )
      .innerJoin(
        'students',
        'student',
        'sessions.student_id = student.student_id',
      )
      .innerJoin('users', 'user', 'student.user_id = user.user_id')
      .innerJoin(
        'advisors',
        'advisor',
        'advisor.advisor_id = sessions.advisor_id',
      )
      .where('advisor.user_id = :advisorId', { advisorId })
      .groupBy('month, year, student.first_name, user.user_email')
      .andWhere(
        "sessions.date BETWEEN CURRENT_DATE - INTERVAL '1 year' AND CURRENT_DATE",
      )
      .getRawMany();

    console.log(feedbacks, 'feedbacks');

    return feedbacks.map((feedback) => {
      return {
        rating: Number(feedback.avg_rating),
        student: {
          first_name: feedback.first_name,
          email: feedback.user_email,
        },
        month: feedback.month,
        year: feedback.year,
      };
    });
  }
  // to assure accuray TODO
  async getStudentDashboardFeedback(studentId: number) {
      .createQueryBuilder(Feedback, 'feedback')
      .select([
        'student.first_name, user.user_email',
        "Extract('month' FROM sessions.date) As month",
        "EXTRACT('year' FROM sessions.date) As year",
        'AVG(feedback.rating) as avg_rating',
      ])
      .innerJoin(
        'monitoring_sessions',
        'sessions',
        'feedback.session_id = sessions.id',
      )
      .innerJoin(
        'students',
        'student',
        'sessions.student_id = student.student_id',
      )
      .innerJoin('users', 'user', 'student.user_id = user.user_id')
      .innerJoin(
        'advisors',
        'advisor',
        'advisor.advisor_id = sessions.advisor_id',
      )
      .where('advisor.user_id = :advisorId', { advisorId })
      .groupBy('month, year, student.first_name, user.user_email')
      .andWhere(
        "sessions.date BETWEEN CURRENT_DATE - INTERVAL '1 year' AND CURRENT_DATE",
      )
      .getRawMany();

  }
}
