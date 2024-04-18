# Используем определенную версию Node.js
FROM node:16-alpine

# Создаем директорию приложения
WORKDIR /usr/src/app

# Копируем только необходимые файлы
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Устанавливаем PM2 локально
RUN npm install pm2

# Копируем остальные файлы проекта
COPY . .

# Собираем проект, если это необходимо
RUN npm run build

# Открываем порт, который использует приложение
EXPOSE 3000

# Запускаем приложение с помощью PM2
CMD ["pm2-runtime", "start", "npm", "--", "run", "start"]