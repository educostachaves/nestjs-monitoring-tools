import { Controller, Get, UseInterceptors, InternalServerErrorException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Crud, CrudController } from '@nestjsx/crud';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';
import { SentryInterceptor } from './../shared/sentry.interceptor';

@ApiTags('Users')
@UseInterceptors(SentryInterceptor)
@Crud({
  model: {
    type: UserEntity,
  },
})
@Controller('users')
export class UsersController implements CrudController<UserEntity> {
  constructor(public readonly service: UsersService) {}

  @Get('sentry')
  getSentryException() {
    throw new InternalServerErrorException();
  }
}
