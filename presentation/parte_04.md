# Configurando o Sonarcube no Nest.Js

## Instalando as dependências

### Jest, usando jest-sonar-reporter

Precisamos agora fazer com que o nosso Jest gere relatórios para serem lidos pelo SonarQube. Quando rodamos o Jest com `--coverage` habilitado, uma pasta `coverage` é criada com justamente todos os relatórios referentes as coberturas de teste. O mais importante aqui é o `lcov.info`. Mas o para enriquecer os Reports, vamos usar o `jest-sonar-reporter`. Ele vai trazer mais informações sobre os testes executados, e falhas ocorridas, trazendo mais detalhes.

- [jest-sonar-reporter](https://www.npmjs.com/package/jest-sonar-reporter)
- [SonarQube Generic Test Data](https://docs.sonarqube.org/latest/analysis/generic-test/)

Para fazer isso seguimos os seguintes passos:

- Instale a dependência do jest-sonar-reporter na aplicação, executando `yarn add -D jest-sonar-reporter`.
- Para ativar nosso report, vamos ter que entrar com algumas configurações no `package.json`:

```json
...
"jestSonar": {
  "sonar56x": true,
  "reportPath": "coverage",
  "reportFile": "sonar-report.xml",
  "indent": 4
}
...
```

- Em `scripts`, no `package.json`, vamos adicionar o comando para fazer o coverage rodar: `"test:cov": "jest -i --coverage --detectOpenHandles --forceExit",`:
- No arquivo `jest.config.js` vamos adicionar mais algumas coisas nele. O mais importante é o uso da dependencia pelo `Jest`, adicionando `testResultsProcessor: 'jest-sonar-reporter',`:

```js
module.exports = {
  verbose: true,
  moduleFileExtensions: [
    "js",
    "json",
    "ts",
  ],
  testPathIgnorePatterns: ['<rootDir>/(build|config|node_modules)/'],
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  resetMocks: false,
  rootDir: "src",
  testRegex: ".spec.ts$",
  coverageDirectory: "../coverage",
  testEnvironment: "node",
  testResultsProcessor: 'jest-sonar-reporter',
  setupFilesAfterEnv: ["../test/config/jest.setup.js"],
};
```

- Agora ao executar `yarn test:cov` agora, na pasta `coverage`, um novo arquivo será gerado: `sonar-report.xml`. Esse arquivo será enviado para o SonarQube quando o Scanner for executado

### ESLint com SonarJS

No caso do ESLint, ele será o grande responsável por trazer as informaçoes de bugs, codesmells e vulnerabilities para nossa aplicação. QUanto mais restrito for o ESLint, mais rico serão os reports. Algumas dependencias são importantes para instalar no ESLint: `eslint-config-sonarqube` e `eslint-plugin-sonarjs`. Com essas depedencias teremos as informaçoes que precisamos.

- Adicione essas dependencias rodando: `yarn add -D eslint-config-sonarqube eslint-plugin-sonarjs`
- No nosso ESlint vamos adicionar essas dependencias instaladas, dessa forma:

```js
plugins: [
  'sonarjs',
],
extends: [
  'plugin:sonarjs/recommended',
],
```

- Agora precisamos que o ESLint extraia um report desses possiveis problemas em nosso código. Adicionamos em `scripts` o seguinte: `"lint:report": "eslint -f json -o ./coverage/eslint-report.json \"{src}/**/*.ts\"; exit 0",`. Isso fara um export de um json pra nosso SonarQube.
- Agora ao executar `yarn test:cov` agora, na pasta `coverage`, um novo arquivo será gerado: `eslint-report.json`. Esse arquivo será enviado para o SonarQube quando o Scanner for executado

### SonarQube Scanner

Para que esses reports gerado sigam para o Sonarqube, precisamos de uma dependencia chamada `SonarQube Scanner`. Ela fara um request para o sonar com todos esses relatórios. Pra configurar ele, basta criarmos um arquivo chamado `sonar-project.properties`.

- Primeiro coisa que faremos é definir algumas envs que usaremos no projeto:

```
SONARQUBE_DATABASE_URL=http://sonarqube:9000
SONARQUBE_MS_NESTJS_KEY=nestjs
SONARQUBE_MS_NESTJS_TOKEN={tokencriadopreviamente}
```

- Importante, mude o `Dockerfile` da aplicaçao para usar a imagem do `Node` completa. O `Node Alpine` gerou problemas pra instalar a dependencia do `sonar-scanner`:

```Dockerfile
FROM node:13

RUN mkdir -p /home/node/app/node_modules

ARG PORT
ARG NODE_ENV

ENV NODE_ENV=$NODE_ENV

WORKDIR /home/node/app

COPY package.json yarn.lock ./
RUN yarn

COPY . .
RUN chown -R node:node /home/node/app

USER node

EXPOSE $PORT

CMD [ "yarn", "start:dev" ]
```

- Adcionamos a dependencia `sonarqube-scanner` executando: `yarn add -D sonarqube-scanner`
- Fazemos duas entradas em `scripts` no `package.json`, uma para gerar os relatórios, e outra para rodar o SonarScanner assim:
```json
  "sonar:reports": "yarn lint:report && yarn test:cov",
  "sonar:scanner": "sonar-scanner"
```
- Definimos as seguintes configurações no `sonar-project.properties`:

```yml
# required metdata
sonar.host.url=${env.SONARQUBE_SERVER_URL}
sonar.login=${env.SONARQUBE_MS_NESTJS_TOKEN}
sonar.projectKey=${env.SONARQUBE_MS_NESTJS_KEY}
sonar.projectVersion=1.0
sonar.sourceEncoding=UTF-8
sonar.eslint.eslintconfigpath=eslintrc.json

# path to source directories
sonar.sources=./src

# includes and excludes
sonar.test.inclusions=src/**/*.spec.ts
sonar.exclusions=node_modules/*,coverage/*,certs/*,test/*,db/*,dist/*

# coverage reporting
sonar.typescript.tsconfigPath=tsconfig.json
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.testExecutionReportPaths=coverage/sonar-report.xml
sonar.genericcoverage.unitTestReportPaths=coverage/sonar-report.xml
sonar.eslint.reportPaths=coverage/eslint-report.json
```

- Todos os parametros listados podem ser vistos em [SonarQube Analysis Parameters](https://docs.sonarqube.org/latest/analysis/analysis-parameters/)
- Ao executar agora `yarn sonar:reports`, os relatórios serão gerados, `yarn sonar:scanner` o sonar-scanner executará e os relatórios serão enviado para o server do sonarqube. Para testar, reinicie o `docker-compose` do `app`, e após a imagem carregada, execute `docker-compose exec app yarn sonar:reports` e `docker-compose exec app yarn sonar:scanner`.



