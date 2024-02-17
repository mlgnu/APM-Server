import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  Session,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { log } from 'console';
//simport {CustomerDto} from '../dtos/customer.dto';
import { Request, Response } from 'express';
import { CustomerDto } from '../dtos/customer.dto';
import { GoogleAuthGuard, LoginGuard } from 'src/authentication/utils/Guards';

@Controller('customer')
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  @UseGuards(LoginGuard)
  @Get('')
  firstFunction(@Session() session: Record<string, any>) {
    console.log(session);
    session.authenticated = true;
    return session;
    // log(req, res);
    // log(name);
    // throw new HttpException("lol you are stupid", HttpStatus.BAD_REQUEST);
  }

  @Post('add')
  @UsePipes(ValidationPipe)
  createCustomer(@Body() customerDto: CustomerDto) {
    log(customerDto);
  }
}
