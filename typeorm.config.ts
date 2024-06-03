import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import entities from 'src/typeorm';

@Injectable()
export class TypeOrmConfigService {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      url: this.configService.get<string>('DATABASE_URL'),
      // host: this.configService.get<string>('DB_HOST', 'localhost'),
      // port: this.configService.get<number>('DB_PORT', 5432),
      // username: this.configService.get<string>('DB_USER', 'mohamed'),
      // password: this.configService.get<string>('DB_PASSWORD', ''),
      // database: this.configService.get<string>('DB_NAME', 'postgres'),
      entities: entities,
      synchronize: this.configService.get<boolean>('DB_SYNCHRONIZE', true),
      ssl: {
        rejectUnauthorized: false,
      },
    };
  }
}
