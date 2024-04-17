import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { calendar_v3, google, Auth } from 'googleapis';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { MonitoringSession } from 'src/typeorm/MonitoringSession';
import { DataSource, Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { ScheduleSessionDto } from './dtos/ScheduleSessionDto';
import { ConfigService } from '@nestjs/config';
import { Student } from 'src/typeorm/Student';
import { Advisor } from 'src/typeorm/Advisor';
import { User } from 'src/typeorm';
import { StudentAdvisorAssignment } from 'src/typeorm/StudentAdvisorAssignment';

@Injectable()
export class MonitorService {
  constructor(
    @InjectRepository(MonitoringSession)
    private readonly monitoringSessionRepo: Repository<MonitoringSession>,
    private readonly authService: AuthenticationService,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    private configService: ConfigService,
    @InjectRepository(Advisor)
    private readonly advisorRepo: Repository<Advisor>,
    private readonly dataSource: DataSource,
  ) {}

  initializeClient(
    accessToken: string,
    refreshToken: string,
  ): Auth.OAuth2Client {
    const client = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
    );

    client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    return client;
  }

  initizlizeCalendar(client: Auth.OAuth2Client) {
    return google.calendar({ version: 'v3', auth: client });
  }

  async getAllstudentsByAdvisorId(email: string) {
    const students = await this.dataSource
      .createQueryBuilder(User, 'u')
      .select(['s.student_id', 's.firstName', 's.lastName', 'u.userEmail'])
      .innerJoin('students', 's', 's.user_id = u.user_id')
      .where((qb) => {
        const sub = qb
          .subQuery()
          .select('saa.student_email')
          .from(StudentAdvisorAssignment, 'saa')
          .innerJoin('assignments', 'a', 'a.assignmentId = saa.assignmentId')
          .where('a.status = :status', { status: 'approved' })
          .andWhere('saa.advisor_email = :email', { email })
          .getQuery();
        return 'u.userEmail IN ' + sub;
      })
      .getRawMany();

    console.log(students);
    const studentsRes = students.map((student) => {
      return {
        userEmail: student.u_user_email,
        firstName: student.s_first_name,
        lastName: student.s_last_name,
        studentId: student.student_id,
      };
    });
    return studentsRes;
  }

  async getAdvisorEvents(advisorId: number, page: number, limit: number) {
    const advisor = await this.authService.findAdvisorByUserId(advisorId, {
      user: true,
    });
    const pages = await this.monitoringSessionRepo.count({
      where: { advisorId: advisor.id },
    });
    const sessions = await this.monitoringSessionRepo.find({
      where: { advisorId: advisor.id },
      order: { id: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });
    const res = [];

    for (const session of sessions) {
      console.log('studentId', session.studentId);
      // const student = await this.authService.findStudentByUserId(
      //   session.studentId,
      //   {
      //     user: true,
      //   },
      // );
      const student = await this.studentRepo.findOne({
        where: { id: session.studentId },
        relations: { user: true },
      });
      console.log(session.advisorId);
      res.push({
        studentId: session.studentId,
        advisorEmail: advisor.user.userEmail,
        studentEmail: student.user.userEmail,
        date: session.date,
        startTime: session.timeStart,
        endTime: session.timeEnd,
        isOnline: session.isOnline,
        venue: session.venue,
        eventId: session.googleId,
        sessionId: session.id,
      });
    }
    return {
      pages: Math.ceil(pages / limit),
      payload: res,
    };
  }

  async getStudentsEvents(studentId: number, page: number, limit: number) {
    const student = await this.authService.findStudentByUserId(studentId, {
      user: true,
    });
    const pages = await this.monitoringSessionRepo.count({
      where: { studentId: student.id },
    });
    const sessions = await this.monitoringSessionRepo.find({
      where: { studentId: student.id },
      order: { id: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });
    const res = [];

    for (const session of sessions) {
      const advisor = await this.advisorRepo.findOne({
        where: { id: session.advisorId },
        relations: { user: true },
      });

      res.push({
        studentId: student.id,
        advisorEmail: advisor.user.userEmail,
        studentEmail: student.user.userEmail,
        date: session.date,
        startTime: session.timeStart,
        endTime: session.timeEnd,
        isOnline: session.isOnline,
        venue: session.venue,
        eventId: session.googleId,
      });
    }
    return {
      pages: Math.ceil(pages / limit),
      payload: res,
    };
  }

  async createEvent(
    createEventDto: ScheduleSessionDto,
    advisorId: number,
    accessToken: string,
    refreshToken: string,
  ) {
    const client = this.initializeClient(accessToken, refreshToken);
    const { hangoutLink, eventId } = await this.insertGoogleCalender(
      await this.constructEventBody(createEventDto),
      client,
    );

    const advisor = await this.authService.findAdvisorByUserId(advisorId);

    const monitoringSession = this.monitoringSessionRepo.create({
      advisorId: advisor.id,
      googleId: eventId,
      studentId: createEventDto.studentId,
      date: createEventDto.date,
      isOnline: createEventDto.isOnline,
      venue: createEventDto.isOnline ? hangoutLink : createEventDto.venue,
      timeStart: createEventDto.startTime,
      timeEnd: createEventDto.endTime,
    });

    return await this.monitoringSessionRepo.save(monitoringSession);
  }

  async constructEventBody(createEventDto: ScheduleSessionDto) {
    const student = await this.studentRepo.findOne({
      where: { id: createEventDto.studentId },
      relations: { user: true },
    });
    const event: calendar_v3.Schema$Event = {
      summary:
        (createEventDto.isOnline ? 'Online' : 'Physical') +
        ' Monitoring Session with Advisor',
      location: createEventDto.isOnline ? 'Google Meet' : '',
      attendees: [{ email: student.user.userEmail }],
      start: {
        dateTime: `${createEventDto.date}T${createEventDto.startTime}:00`, // '2024-05-14T11:00:00',
        timeZone: 'Asia/Kuala_Lumpur',
      },
      end: {
        dateTime: `${createEventDto.date}T${createEventDto.endTime}:00`, // '2024-05-14T11:00:00',
        timeZone: 'Asia/Kuala_Lumpur',
      },
      conferenceData: {},
      reminders: {
        useDefault: true,
      },
    };

    if (createEventDto.isOnline) {
      console.log('isOnline');
      event.conferenceData = {
        createRequest: {
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
          requestId: uuid(),
        },
      };
    }
    return event;
  }

  async insertGoogleCalender(
    event: calendar_v3.Schema$Event,
    client: Auth.OAuth2Client,
  ) {
    const calendar = this.initizlizeCalendar(client);
    const calendarEvent = await calendar.events.insert({
      conferenceDataVersion: 1,
      auth: client,
      calendarId: 'primary',
      requestBody: event,
    });

    return {
      hangoutLink: calendarEvent.data.hangoutLink,
      eventId: calendarEvent.data.id,
    };
  }

  async editEvent(
    event: ScheduleSessionDto,
    eventId: string,
    accessToken: string,
    refreshToken: string,
  ) {
    const client = this.initializeClient(accessToken, refreshToken);
    const hangoutLink = await this.editGoogleCalender(
      await this.constructEventBody(event),
      eventId,
      client,
    );

    const monitoringSession = await this.monitoringSessionRepo.findOneBy({
      googleId: eventId,
    });

    monitoringSession.studentId = event.studentId;
    monitoringSession.date = event.date;
    monitoringSession.isOnline = event.isOnline;
    monitoringSession.venue = event.isOnline ? hangoutLink : event.venue;
    monitoringSession.timeStart = event.startTime;
    monitoringSession.timeEnd = event.endTime;

    return await this.monitoringSessionRepo.save(monitoringSession);
  }

  async editGoogleCalender(
    event: calendar_v3.Schema$Event,
    eventId: string,
    client: Auth.OAuth2Client,
  ) {
    const calendar = this.initizlizeCalendar(client);
    const calenderEvent = await calendar.events.update({
      conferenceDataVersion: 1,
      auth: client,
      calendarId: 'primary',
      eventId,
      requestBody: event,
    });
    return calenderEvent.data.hangoutLink;
  }

  async deleteEvent(
    eventId: string,
    accessToken: string,
    refreshToken: string,
  ) {
    const client = this.initializeClient(accessToken, refreshToken);
    await this.deleteGoogleCalender(eventId, client);
    return await this.monitoringSessionRepo.delete({ googleId: eventId });
  }

  async deleteGoogleCalender(eventId: string, client: Auth.OAuth2Client) {
    const calendar = this.initizlizeCalendar(client);
    return await calendar.events.delete({
      auth: client,
      calendarId: 'primary',
      eventId,
    });
  }
}
