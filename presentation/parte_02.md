# Configurando o Sentry no Nest.Js

## Instalando a dependência

- Instale a dependência do Sentry, executando `yarn add @sentry/node`.
- O proximo passo é usar a dependencia e configurar o DSN. Salve em uma env chamada `APP_SENTRY_DSN`.
- Em `main.ts` adicione as seguintes linhas:

```ts
import * as Sentry from '@sentry/node';

...

async function bootstrap() {
  ...

  Sentry.init({
    dsn: process.env.APP_SENTRY_DSN,
  });

  await app.listen(port, '0.0.0.0');
}
```

## Criando um interceptor no Nest.Js

Para entender mais sobre `interceptors` no NestJs, acesse https://docs.nestjs.com/interceptors

- Vamos criar um interceptor em uma pasta comum chamada `shared`. Se no projeto nao houver uma, crie a mesma.
- Dentro desta pasta crie um arquivo `.ts`, de preferencia `sentry.interceptor.ts`
- Crie a seguinte classe de interceptor:

```ts

import { ExecutionContext, Injectable, NestInterceptor, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as Sentry from '@sentry/minimal';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(null, exception => {
        Sentry.captureException(exception);
      })
    );
  }
}

```

- Próximo passo, para o uso do `Interceptor` é necessário executar um `bind` de execução. Como queremos as `exceptions`, cada controller pode ter seu próprio `bind`. Pra isso usamos o decorator `@UseInterceptors()`. Na controller `users.controller.ts` vamos usar esse decorator dessa forma:

```ts

import { Controller, UseInterceptors } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';
import { SentryInterceptor } from './sentry.interceptor';

@UseInterceptors(SentryInterceptor)
@Crud({
  model: {
    type: UserEntity,
  },
})
@Controller('users')
export class UsersController implements CrudController<UserEntity> {
  constructor(public readonly service: UsersService) {}
}

```

- Com nosso `interceptor`, já temos algo funcional. Toda vez que dentro desse `controller` aconteça uma `exception`, nosso `interceptor` enviará esta `exception` para o `Sentry`.
- Para facilitar nosso teste, vamos forçar um `exception` usando o endpoint. Vamos também configurar esse endpoint para ser lido pelo `Swagger`.

```ts

import { Controller, UseInterceptors, InternalServerErrorException } from '@nestjs/common';
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

```

