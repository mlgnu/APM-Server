import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/typeorm/User';
import { Advisor } from 'src/typeorm/Advisor';
import { DataSource, Repository } from 'typeorm';
import { Student } from 'src/typeorm/Student';
import { AssignmentDetailsDto } from './dtos/AssignmentDetailsDto';
import { Department } from 'types';
import { Assignment, AssignmentStatus } from 'src/typeorm/Assignment';
import { StudentAdvisorAssignment } from 'src/typeorm/StudentAdvisorAssignment';
import { Coordinator } from 'src/typeorm/Coordinator';
import { EditAssignmentDto } from './dtos/EditAssignmentDto';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepo: Repository<Assignment>,
    private readonly dataSource: DataSource,
    @InjectRepository(Coordinator)
    private readonly coordinatorRepo: Repository<Coordinator>,
    @InjectRepository(StudentAdvisorAssignment)
    private readonly studentAdvisorRepo: Repository<StudentAdvisorAssignment>,
  ) {}

  async getAssignmentsDashboard() {
    const approvedAss = this.dataSource
      .createQueryBuilder(Assignment, 'assignments')
      .select('assignments.assignmentId')
      .where('assignments.status = :status', { status: 'approved' });
    const assignments = await this.dataSource
      .createQueryBuilder(Assignment, 'a')
      .select(['a.department', 'a.year', 'a.assignmentId'])
      .distinctOn(['a.department', 'a.year'])
      .where('a.assignmentId IN (' + approvedAss.getQuery() + ')')
      .setParameters(approvedAss.getParameters())
      .getRawMany();
    return assignments.map((assignment) => {
      return {
        department: assignment.a_department,
        year: assignment.a_year,
        id: assignment.a_assignmentId,
      };
    });
  }

  async getAssignmentsByYearAndDepartment(year: number, department: string) {
    const filteredAssignments = this.dataSource
      .createQueryBuilder(Assignment, 'assignments')
      .select('assignments.assignmentId')
      .where('assignments.department = :department', { department })
      .andWhere('assignments.year = :year', { year })
      .andWhere('assignments.status = :status', { status: 'approved' });

    const view = await this.dataSource
      .createQueryBuilder(Assignment, 'assignments')
      .select([
        'assignments.year As year',
        'assignments.department As department',
        'saa.student_email',
        'saa.advisor_email',
        'saa.id As id',
      ])
      .where(
        'assignments.assignmentId IN (' + filteredAssignments.getQuery() + ')',
      )
      .setParameters(filteredAssignments.getParameters())
      .innerJoin(
        'student_advisor_assignments',
        'saa',
        'saa.assignmentId = assignments.assignmentId',
      )
      .getRawMany();

    return view.map((assignment) => {
      return {
        year: assignment.year,
        department: assignment.department,
        studentEmail: assignment.student_email,
        advisorEmail: assignment.advisor_email,
        id: assignment.id,
      };
    });
  }

  async makeAssignment(
    assignment: AssignmentDetailsDto,
    coordinatorId: number,
  ) {
    console.log(JSON.stringify(assignment, null, 2));

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const assignmentRepo = queryRunner.manager.getRepository(Assignment);
      const studentAdvisorRepo = queryRunner.manager.getRepository(
        StudentAdvisorAssignment,
      );
      const userRepo = queryRunner.manager.getRepository(User);
      const studentRepo = queryRunner.manager.getRepository(Student);
      const advisorRepo = queryRunner.manager.getRepository(Advisor);

      const coordinator = await this.coordinatorRepo.findOneBy({
        user: {
          id: coordinatorId,
        },
      });
      if (!coordinator) {
        return new BadRequestException('Coordinator not found');
      }
      const newAssignment = assignmentRepo.create({
        coordinator: coordinator,
        year: parseInt(assignment.batchYear),
        status: AssignmentStatus.PENDING,
        department:
          Department[assignment.department as keyof typeof Department],
      });
      const savedAssignment = await assignmentRepo.save(newAssignment);
      console.log(savedAssignment, 'saved assignment');

      for (const studentAdvisorAssignment of assignment.assignments) {
        const assignmentData = studentAdvisorRepo.create({
          assignment: savedAssignment,
          year: parseInt(assignment.batchYear),
          studentEmail: studentAdvisorAssignment.studentId + '@siswa.um.edu.my',
          advisorEmail: studentAdvisorAssignment.advisorId + '@um.edu.my',
          assignmentId: savedAssignment.assignmentId,
        });
        await studentAdvisorRepo.save(assignmentData);
        let userStudent = await userRepo.findOneBy({
          userEmail: studentAdvisorAssignment.studentId + '@siswa.um.edu.my',
        });

        if (!userStudent) {
          userStudent = userRepo.create({
            userEmail: studentAdvisorAssignment.studentId + '@siswa.um.edu.my',
            role: 0,
          });
          await userRepo.save(userStudent);
        }

        let userAdvisor = await userRepo.findOneBy({
          userEmail: studentAdvisorAssignment.advisorId + '@um.edu.my',
        });

        if (!userAdvisor) {
          userAdvisor = userRepo.create({
            userEmail: studentAdvisorAssignment.advisorId + '@um.edu.my',
            role: 1,
          });
          await userRepo.save(userAdvisor);
        }

        let advisor = await advisorRepo.findOneBy({ user: userAdvisor });
        let student = await studentRepo.findOneBy({ user: userStudent });
        if (!student) {
          student = studentRepo.create({
            user: userStudent,
            firstName: 'Student',
            lastName: studentAdvisorAssignment.studentId,
            department:
              Department[assignment.department as keyof typeof Department],
          });
          await studentRepo.save(student);
        }

        if (!advisor) {
          advisor = advisorRepo.create({
            user: userAdvisor,
            firstName: 'Advisor',
            lastName: studentAdvisorAssignment.advisorId,
            department:
              Department[assignment.department as keyof typeof Department],
          });
          await advisorRepo.save(advisor);
        }
        student.advisor = advisor;
        await studentRepo.save(student);
      }

      await queryRunner.commitTransaction();
      console.log('Transaction committed');
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
    }
  }

  async getAssignments(page: number, limit: number) {
    const totalAssignments = await this.assignmentRepo.count();
    const assignments = await this.assignmentRepo.find({
      take: limit,
      skip: (page - 1) * limit,
    });
    return { payload: assignments, pages: Math.ceil(totalAssignments / limit) };
  }

  async getAssignmentsByCoordinatorId(
    coordinatorId: number,
    page: number,
    limit: number,
  ) {
    const totalAssignments = await this.assignmentRepo.count();
    const assignments = await this.assignmentRepo.find({
      // where coordinator id is 125
      relations: {
        coordinator: {
          user: true,
        },
      },
      where: {
        coordinator: {
          user: {
            id: coordinatorId,
          },
        },
      },
      order: { assignmentId: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });
    return { payload: assignments, pages: Math.ceil(totalAssignments / limit) };
  }

  async getAssignmentBySupervisorId(
    supervisorId: number,
    page: number,
    limit: number,
  ) {
    const assignments = await this.assignmentRepo.find({
      order: { assignmentId: 'DESC' },
      relations: { coordinator: { user: true } },
      take: limit,
      skip: (page - 1) * limit,
    });
    return {
      payload: assignments,
      pages: Math.ceil(assignments.length / limit),
    };
  }

  async updateAssignmentStatus(
    assignmentId: number,
    action: number,
    message?: string,
  ) {
    const assignment = await this.assignmentRepo.findOneBy({
      assignmentId: assignmentId,
    });
    if (!assignment) {
      return new BadRequestException('Assignment not found');
    }
    if (action === 1) {
      assignment.status = AssignmentStatus.APPROVED;
    } else if (action === 0) {
      assignment.status = AssignmentStatus.REJECTED;
      assignment.message = message;
    }
    assignment.updatedAt = new Date();
    await this.assignmentRepo.save(assignment);
    return assignment;
  }

  async getStudentAdvisorAssignments(assignmentId: number) {
    const assignments = await this.studentAdvisorRepo.findBy({ assignmentId });
    return assignments;
  }

  async deleteAssignment(assignmentId: number) {
    const assignment = await this.assignmentRepo.findOneBy({ assignmentId });
    if (!assignment) {
      return new BadRequestException('Assignment not found');
    }
    return await this.assignmentRepo.remove(assignment);
  }

  async editAssignment(assignments: EditAssignmentDto, coordinatorId: number) {
    await this.deleteAssignment(assignments.assignmentId);
    console.log('deleted', assignments.assignmentId);
    const makeAssignment = await this.makeAssignment(
      assignments,
      coordinatorId,
    );
    return makeAssignment;
  }
}
