FROM node:8.7.0-alpine
ENV npm_package_engines_vscode=^1.8.1
RUN apk add --update git && \
    rm -rf /tmp/* /var/cache/apk/*
VOLUME [ "/app" ]
WORKDIR /app

CMD [ "sh", "./docker/development/build.sh" ]
