# Instalação do SonarQube

## SonarQube On-Premises - Instalação

- Acesse o `PGAdmin` em `http://localhost:16543/` e crie um banco chamado `sonarqube`.
- Adicionar esses ENVs abaixo ao `.env` principal, com seus respectivos valores.

```
SONARQUBE_JDBC_URL=jdbc:postgresql://postgres:5432/sonarqube
SONARQUBE_JDBC_USERNAME=user
SONARQUBE_JDBC_PASSWORD=dbpass
```
- Adicionar esses complementos no `docker-compose.yml`

```yml

services:
  sonarqube:
    container_name: sonarqube
    image: sonarqube
    env_file:
      - ./.env
    expose:
      - 9000
    ports:
      - "9001:9000"
    networks:
      - mynet
    volumes:
      - sonarqube_conf:/opt/sonarqube/conf
      - sonarqube_data:/opt/sonarqube/data
      - sonarqube_extensions:/opt/sonarqube/extensions
      - sonarqube_bundled-plugins:/opt/sonarqube/lib/bundled-plugins

volumes:
  sonarqube_conf:
  sonarqube_data:
  sonarqube_extensions:
  sonarqube_bundled-plugins:

```

- O Server do Sonarqube é um pouco mais independente. Então você pode acessar [localhost:9001](http://localhost:9001/) que o servidor estará sendo migrado.

## SonarQube On-Premises - Configuração

- Logo de Início, uma tela inicial aparecerá, acessando [localhost:9001](http://localhost:9001)
- Clique em `Login` para entrar no sistema. Os login e senha iniciais são `admin`/`admin`.
- Com o Painel aberto do Sonarqube, vamos criar um novo projeto clicando em [Create new project](http://localhost:9001/projects/create).
- Uma `Project Key` e um `Display Name` podem ser adicionados. Seguindo nosso padrão, vamos por `nestjs`e `NestJs` respectivamente.
- Aparecerá uma opção para gerar um token. Daremos o nome desse token de `nestjs`. Clique em `Generate`
- Com o token criado, salve ele por enquanto. Esse token nao é mostrado por uma segunda vez.
