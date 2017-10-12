FROM node:8.7.0-alpine
ENV npm_package_engines_vscode=^1.8.1
WORKDIR /app
RUN apk add --update git && \
    rm -rf /tmp/* /var/cache/apk/*
COPY . /app
CMD [ "sh", "./docker/development/build.sh" ]
