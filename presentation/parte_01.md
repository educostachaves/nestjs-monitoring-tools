# Instalação do Sentry

## Sentry On-Premises - Instalação

- Criar uma senha de 32 caracteres. Pode ser gerado no [passwordsgenerator.net](https://passwordsgenerator.net/).
- Acesse o `PGAdmin` em `http://localhost:16543/` e crie um banco chamado `sentry`.
- Adicionar esses ENVs abaixo ao `.env` principal, com seus respectivos valores.

```
SENTRY_SECRET_KEY=
SENTRY_POSTGRES_HOST=
SENTRY_DB_USER=
SENTRY_DB_PASSWORD=
SENTRY_DB_NAME=
SENTRY_REDIS_HOST=
SENTRY_INITIAL_EMAIL=
SENTRY_INITIAL_PASSWORD=
```
- Adicionar esses complementos no `docker-compose.yml`

```yml

redis:
  command: redis-server --port 6379
  image: redis
  environment:
    - REDIS_DATA_DIR=/data/redis
  ports:
    - "6379:6379"
  networks:
    - webnet

sentry:
  image: sentry
  links:
    - redis
    - postgres
  ports:
    - 9000:9000
  env_file:
    - ./.env


cron:
  image: sentry
  links:
    - redis
    - postgres
  command: "sentry run cron"
  env_file:
    - ./.env

worker:
  image: sentry
  links:
    - redis
    - postgres
  command: "sentry run worker"
  env_file:
    - ./.env

```

- Executar `docker-compose exec sentry sentry upgrade` para rodar a migração do Sentry. Ao final do processo, vai ser solicitado um email e uma senha inicial. Caso prefira depois, execute o comando abaixo.
- Executar `docker-compose exec sentry sentry createuser --email ${SENTRY_INITIAL_EMAIL} --password ${SENTRY_INITIAL_PASSWORD} --superuser --no-input` para criar um novo usuário

## Sentry On-Premises - Configuração

- Logo de Início, uma tela de login aparecerá, acessando [localhost:9000](http://localhost:9000)
- Na tela de configuração inicial do Sentry, defina seu host. No nosso caso será [sentry:9000](http://sentry:9000)
- Com o Painel aberto do Sentry, agora podemos cadastrar projetos. Acesse [Add New ->> Projects](http://localhost:9000/organizations/sentry/projects/new/) para adicionar um novo projeto.
- Selecione a opção `Node.js`, defina um nome de projeto, e pra qual time ele irá se reportar. No nosso caso `NestJs` e `Sentry` respectivamente, e clicar em `Create Project`.
- Um exemplo de como instalar a dependencia do Sentry vai aparecer. Grave o `DSN`da aplicação. Isso será importante para os reports da nossa aplicação.
- Por fim, você pode clicar em `Got it! Take me to the Issue Stream.` e ir para o painel de monitoramento do Sentry
