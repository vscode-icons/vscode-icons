FROM node:slim
WORKDIR /app
COPY package.json /app
RUN npm install -d
COPY . /app
CMD ["npm", "run", "build"]
