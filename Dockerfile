# Utiliza a imagem do Node.js 20
FROM node:20

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de configuração e dependências
COPY package.json package-lock.json ./

# Instala as dependências
RUN npm install 

# Instala o Snyk globalmente
RUN npm install -g snyk

# Copia os arquivos do projeto
COPY . .

# Gera os arquivos do Prisma
RUN npx prisma generate

# Compila o projeto
RUN npm run build

# Executa testes
RUN npm test

# Define a porta que a aplicação irá rodar
EXPOSE 8080

# Inicia a aplicação
CMD ["npm", "start"]