import { Advisor } from './Advisor';
import { Announcement } from './Announcement';
import { SessionEntity } from './Session';
import { Student } from './Student';
import { User } from './User';
import { Coordinator } from './Coordinator';
import { StudentAdvisorAssignment } from './StudentAdvisorAssignment';
import { Assignment } from './Assignment';
import { Message } from './Message';
import { MonitoringSession } from './MonitoringSession';
import { Feedback } from './Feedback';

const entities = [
  User,
  SessionEntity,
  Announcement,
  Student,
  Advisor,
  StudentAdvisorAssignment,
  Coordinator,
  Assignment,
  Message,
  MonitoringSession,
  Feedback,
];

export { User };
export default entities;
