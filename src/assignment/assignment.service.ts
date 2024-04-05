import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/typeorm/User';
import { Advisor } from 'src/typeorm/Advisor';
// import { Collection } from 'src/typeorm/Collection';
import { DataSource, Repository } from 'typeorm';
import { Student } from 'src/typeorm/Student';
import { faker } from '@faker-js/faker';
import { AssignmentDetailsDto } from './dtos/AssignmentDetailsDto';
import { Department } from 'types';
import { Assignment, AssignmentStatus } from 'src/typeorm/Assignment';
import { StudentAdvisorAssignment } from 'src/typeorm/StudentAdvisorAssignment';
import { Coordinator } from 'src/typeorm/Coordinator';

@Injectable()
export class AssignmentService {
  constructor(
    // @InjectRepository(User) private readonly userRepo: Repository<User>,
    // @InjectRepository(Advisor)
    // private readonly advisorRepo: Repository<Advisor>,
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

  async getAllStudentsOfAdvisor() {
    const approvedAss = this.dataSource
      .createQueryBuilder(Assignment, 'assignments')
      .select('assignments.assignmentId')
      .where('assignments.status = :status', { status: 'approved' });
    // TODO to check it and change advisor email to ID
    const students = this.dataSource
      .createQueryBuilder(StudentAdvisorAssignment, 'ass')
      .select('ass.studentEmail', 'ass.advisorEmail')
      .where('ass.assignmentID IN (' + approvedAss.getQuery() + ')')
      .setParameters(approvedAss.getParameters())
      .andWhere('ass.advisorEmail = :advisorEmail', { advisorEmail: 'ddd' })
      .getRawMany();

    return students;
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
        const user = await userRepo.findOneBy({
          userEmail: studentAdvisorAssignment.studentId + '@siswa.um.edu.my',
        });

        const user2 = await userRepo.findOneBy({
          userEmail: studentAdvisorAssignment.advisorId + '@um.edu.my',
        });

        let advisor = await advisorRepo.findOneBy({ user: user2 });
        let student = await studentRepo.findOneBy({ user: user });
        if (!student) {
          student = studentRepo.create({
            user: user,
            firstName: studentAdvisorAssignment.studentId,
            lastName: '',
            department:
              Department[assignment.department as keyof typeof Department],
          });
          await studentRepo.save(student);
        }

        if (!advisor) {
          advisor = advisorRepo.create({
            user: user2,
            firstName: studentAdvisorAssignment.advisorId,
            lastName: '',
            department:
              Department[assignment.department as keyof typeof Department],
          });
          await advisorRepo.save(advisor);
        }
        student.advisor = advisor;
        await studentRepo.save(student);
        // student.advisor =
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

  async updateAssignmentStatus(assignmentId: number, action: number) {
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

  // async deleteAssignment(userId: number) {
  //   const assignment = await this.assignmentRepo.findOneBy({
  //     assignmentId: userId,
  //   });
  //   if (!assignment) {
  //     return new BadRequestException('Assignment not found');
  //   }
  //   await this.assignmentRepo.remove(assignment);
  //   return assignment;
  // }

  // async assignStudentToAdvisor({ studentId, advisorId }: assignToAdvisorDto) {
  //   // const student = await this.userRepo.findOneBy({ id: studentId });
  //   // const advisor = await this.advisorRepo.findOneBy({ id: advisorId });
  //   //d
  //   // to add
  //   // if (!student || !advisor) {
  //   //   return new BadRequestException('Student or advisor not found');
  //   // }
  //   // why this code is not working?
  //   // please answer here
  //   // please answer here
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();
  //   try {
  //     const userRepo = queryRunner.manager.getRepository(User);
  //     const advisorRepo = queryRunner.manager.getRepository(Advisor);
  //     const assignmentRepo = queryRunner.manager.getRepository(Assignment);
  //     const studentRepo = queryRunner.manager.getRepository(Student);
  //
  //     const departments = [
  //       'Computer System and Network',
  //     'Artificial Intelligence',
  //     'Information Systems',
  //     'Data Science',
  //     'Software Engineering',
  //     'Multimedia Computing',
  //   ];
  //   // create a bunch of users using faker js and make a realtion to them with student repo
  //   for (let i = 0; i < 10; i++) {
  //     const firstName = faker.person.firstName();
  //     const lastName = faker.person.lastName();
  //
  //     const user = userRepo.create({
  //       userEmail: faker.internet.email({
  //         firstName: firstName.toLowerCase(),
  //         lastName: lastName.toLowerCase(),
  //         provider: 'um.edu.my',
  //       }),
  //       role: 1,
  //     });
  //
  //     await userRepo.save(user);
  //     const advisor = advisorRepo.create({
  //       department: faker.helpers.arrayElement(departments),
  //       user,
  //       firstName,
  //       lastName,
  //     });
  //     await advisorRepo.save(advisor);
  //     // const student = studentRepo.create({
  //     //   user,
  //     //   firstName,
  //     //   lastName,
  //     //   department: faker.helpers.arrayElement(departments),
  //     // });
  //     // await studentRepo.save(student);
  //   }
  //   await queryRunner.commitTransaction();
  //   // return [student, user];
  // } catch (error) {
  //   await queryRunner.rollbackTransaction();
  // } finally {
  //   await queryRunner.release();
  // }

  // function generateRandomName() {
  //   // Define arrays of common first names and last names
  //   const firstNames = [
  //     'John',
  //     'Jane',
  //     'Alice',
  //     'Bob',
  //     'Michael',
  //     'Emily',
  //     'David',
  //     'Sarah',
  //     'James',
  //     'Olivia',
  //     'William',
  //     'Emma',
  //     'Joseph',
  //     'Sophia',
  //   ];
  //   const lastNames = [
  //     'Doe',
  //     'Smith',
  //     'Johnson',
  //     'Brown',
  //     'Williams',
  //     'Jones',
  //     'Garcia',
  //     'Davis',
  //     'Miller',
  //     'Wilson',
  //     'Taylor',
  //     'Anderson',
  //     'Thomas',
  //     'Moore',
  //   ];
  //
  //   // Generate a random index for both first names and last names arrays
  //   const randomFirstNameIndex = Math.floor(
  //     Math.random() * firstNames.length,
  //   );
  //   const randomLastNameIndex = Math.floor(Math.random() * lastNames.length);

  // Retrieve a random first name and last name from the arrays
  // const randomFirstName = firstNames[randomFirstNameIndex];
  // const randomLastName = lastNames[randomLastNameIndex];

  // Concatenate the first name and last name to form the random name
  // const randomFullName = randomFirstName + ' ' + randomLastName;

  //   return [randomFirstName, randomLastName];
  // }

  // Example usage
  // console.log(randomName); // Output a random name, e.g., "John Smith"
  // for (let i = 15; i < 30; i++)
  // const departments = [
  //   'Computer System and Network',
  //   'Artificial Intelligence',
  //   'Information Systems',
  //   'Data Science',
  //   'Software Engineering',
  //   'Multimedia Computing',
  // ];
  // {
  // const randomName = generateRandomName();
  // const timestamp = Date.now();
  // const email = 'advisor' + timestamp + '@siswa.um.edu';
  // const newUser = this.userRepo.create({ userEmail: email, role: 1 });
  // await this.userRepo.save(newUser);
  // const advisor = this.advisorRepo.create({
  //   department: departments[Math.floor(Math.random() * departments.length)],
  //   user: newUser,
  //   firstName: randomName[0],
  //   lastName: randomName[1],
  // });
  // await this.advisorRepo.save(advisor);
  // const student = this.studentRepo.create({
  //   user: newUser,
  //   firstName: randomName[0],
  //   lastName: randomName[1],
  // });
  // await this.studentRepo.save(student);
  // student.user = newUser;
  // const stundetName = generateRandomName();
  // student.firstName = stundetName[0];
  // student.lastName = stundetName[1];
  // await this.studentRepo.save(student);
  // await new Promise((resolve) => setTimeout(resolve, 1000));
  // }

  // assign both student and advisor to the assignment
  // const assignment = new Assignment();
  // assignment.studentId = studentId;
  // assignment.advisorId = advisorId;
  // await this.assignmentRepo.save(assignment);
  // this.assignmentRepo.create(assignment);

  // return assignment;
  //   }
}
