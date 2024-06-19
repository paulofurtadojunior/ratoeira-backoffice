# Use a imagem base oficial mais atual do Node.js
FROM golang:1.12-alpine as builder

# Crie e defina o diretório de trabalho
WORKDIR /app

# Copie o arquivo package.json e package-lock.json para o diretório de trabalho
COPY package*.json ./

# --- START ---

RUN apk add --no-cache chromium ca-certificates
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser

# --- END ---

# Instale as dependências do projeto
RUN npm install

# Copie todos os arquivos da aplicação para o diretório de trabalho
COPY . .

# Exponha a porta em que a aplicação irá rodar
EXPOSE 3333

# Comando para iniciar a aplicação
CMD ["npm", "start"]

