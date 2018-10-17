FROM keymetrics/pm2:latest-alpine

RUN mkdir -p /var/www/cubyn
RUN chown 1000:1000 /var/www/cubyn

USER 1000:1000
WORKDIR /var/www/cubyn

COPY ./app/src src/
COPY ./app/package.json .
COPY ./app/microservices.json .
COPY ./app/tsconfig.json .

RUN npm install && npm run compile

EXPOSE 3000

CMD [ "pm2-runtime", "microservices.json" ]
