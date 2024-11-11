# Desafio Backend Labzz

## Visão Geral
 
Este projeto é uma aplicação backend desenvolvida com **TypeScript** e **Express.js**, que implementa funcionalidades de autenticação, gerenciamento de usuarios e mensagens. A aplicação está containerizada com **Docker** e conta com pipeline de integração contínua visando a garantia de formatação do código, testes unitários, verificações de vulnerabilidades e exposição de dados sensíveis.

## Instalação do Projeto:

1. Clone o projeto:

   ```git
   git clone https://github.com/yurimachados/desafio_backend_labzz.git .
   ```
2. Instale as dependências:

   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente:

   - Renomeie o arquivo `.env.example` para [.env](vscode-file://vscode-app/c:/Users/user/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html) e preencha as variáveis necessárias

   ```bash
   cp .env.example .env
   ```

   - Edite o arquivo [.env](vscode-file://vscode-app/c:/Users/user/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html) conforme necessário:

   ```bash
   PORT=8080
   HTTPS_PORT=8443
   POSTGRES_USER="seu-usuario-postgres"
   POSTGRES_PASSWORD="sua-senha-postgres"
   POSTGRES_DB="seu-banco-de-dados"
   DATABASE_URL="postgresql://seu-usuario-postgres:sua-senha-postgres@db:5432/seu-banco-de-dados"

   REDIS_HOST="redis"
   REDIS_PORT=6379
   REDIS_PASSWORD=""

   GOOGLE_CLIENT_ID="seu-google-client-id"
   GOOGLE_CLIENT_SECRET="seu-google-client-secret"

   SNYK_TOKEN="seu-token-snyk" // não obrigatório
   JWT_SECRET="sua-chave-secreta-jwt"
   ```
4. Inicie a aplicação usando Docker Compose:

   ```bash
   docker-compose up
   ```

## Funcionalidades implementadas

### Autenticação

No fluxo de autenticação, implementei o básico bem feito: registro, login, logout e checagem de sessão, sempre com uma preocupação extra com a segurança.

### Medidas de segurança

- Mitigação de XSS: **Helmet**
- Prevenção contra SQL injection: **Prisma**
- Criptografia de dados sensíveis: **bcryptjs**
- Permissões de origem: **cors**
- Proteção CSRF: **lusca** (csurf foi depreciado e tem falhas)
- Middlewares de validação
- Middleware de validação de sessões

### Qualidade

- Testes automatizados, unitários e de integração
- Linting
- Formatação
- Verificação de vulnerabilidades nas dependências do projeto com SNYK
- Verificações de exposição de credenciais e dados sensíveis hard-coded

### DevOps

- Docker: A aplicação está containerizada utilizando Docker, o que garante que o ambiente de desenvolvimento e produção sejam consistentes.
- Pipeline de CI: verifica a qualidade do código e realiza outras verificações necessárias sempre que há um push para o repositório.

### Controle de versão

- Conventional commit
- Commit semântico
- Estratégia de branching

### Performance

- Caching com Redis
- Design stateless

### Documentação

[Documentação Postman](src/msc/Backend_Labzz.postman_collection.json)
