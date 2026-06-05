FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --silent
COPY . .
EXPOSE 5173
# --host 0.0.0.0 obriga o Vite a bindar em todas as interfaces — sem isso
# a porta exposta pelo docker fica inacessível de fora do container.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
