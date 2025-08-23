FROM node:18-alpine

WORKDIR /app

ARG VITE_SERVER_BASE_URL
ENV VITE_SERVER_BASE_URL=$VITE_SERVER_BASE_URL

ARG VITE_SSL
ENV VITE_SSL=$VITE_SSL

COPY package.json .

COPY yarn.lock .

RUN yarn install --production

RUN yarn add typescript

RUN yarn global add serve

COPY . .

RUN yarn build

EXPOSE 3000

CMD [ "serve", "-s", "dist" ]