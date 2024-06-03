import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { AssignmentDetailsDto } from './dtos/AssignmentDetailsDto';
import {
  CoordinatorGuard,
  GoogleAuthGuard,
  LoginGuard,
} from 'src/authentication/utils/Guards';
import { Request } from 'express';
import { RolesGuards } from 'src/authentication/utils/roles.guard';
import { Roles } from 'src/authentication/utils/roles.decorator';
import { EditAssignmentDto } from './dtos/EditAssignmentDto';

@Controller('assignment')
@UseGuards(RolesGuards)
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Roles('supervisor')
  @Get('all')
  getAssignmentsByYearAndDepartment(
    @Query('year') year: number,
    @Query('department') department: string,
  ) {
    console.log(year, department);
    return this.assignmentService.getAssignmentsByYearAndDepartment(
      year,
      department,
    );
  }

  @Roles('supervisor')
  @Get('dashboard')
  getAssignmentDashboard() {
    return this.assignmentService.getAssignmentsDashboard();
  }

  @Roles('coordinator')
  @Post('assign')
  makeAssignment(
    @Body('assignments') assignments: AssignmentDetailsDto,
    @Req() req: Request,
  ) {
    console.log(req.user, 'from assignment controller');
    console.log(assignments);
    return this.assignmentService.makeAssignment(assignments, req.user['id']);
  }

  @Roles('coordinator')
  @Patch('edit')
  editAssignment(
    @Body('assignments') assignments: EditAssignmentDto,
    @Req() req: Request,
  ) {
    return this.assignmentService.editAssignment(
      assignments,
      req['user']['id'],
    );
  }

  @Get()
  @Roles('coordinator', 'advisor')
  getAssignments(
    @Query('limit', ParseIntPipe) limit: number,
    @Query('page', ParseIntPipe) page: number,
    @Req() req: Request,
  ) {
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Invalid page or limit');
    }
    if (req['user']['role'] === 2) {
      return this.assignmentService.getAssignmentsByCoordinatorId(
        req['user']['id'],
        page,
        limit,
      );
    } else if (req['user']['role'] === 3) {
      return this.assignmentService.getAssignmentBySupervisorId(
        req['user']['id'],
        page,
        limit,
      );
    }
  }

  @Get('sa/:id')
  @Roles('coordinator', 'supervisor')
  @UseGuards(LoginGuard)
  getStudentAdvisorAssignment(@Param('id', ParseIntPipe) id: number) {
    return this.assignmentService.getStudentAdvisorAssignments(id);
  }

  @Post('approve/:id')
  @Roles('supervisor')
  approveAssignment(@Param('id', ParseIntPipe) id: number) {
    return this.assignmentService.updateAssignmentStatus(id, 1);
  }

  @Post('reject/:id')
  @Roles('supervisor')
  rejectAssignment(@Param('id', ParseIntPipe) id: number) {
    return this.assignmentService.updateAssignmentStatus(id, 0);
  }

  @Post('delete/:id')
  @Roles('coordinator')
  deleteAssignment(@Param('id', ParseIntPipe) id: number) {
    return this.assignmentService.deleteAssignment(id);
  }
}
