### STAGE 1: Build ###
FROM node:20.14-alpine AS build
ENV HOME=/usr/src/app
WORKDIR $HOME
RUN mkdir -p $HOME

# Install gettext for envsubst
RUN apk add -i gettext

ADD package.json $HOME
ADD package-lock.json $HOME
RUN npm install
ARG ENVIRONMENT=deploy

COPY . $HOME
RUN npm run build -- num-portal-webapp --configuration=${ENVIRONMENT}
ARG env_name
ARG api_baseUrl
ARG auth_baseUrl
ARG auth_realm
ARG auth_clientId
ARG legal_version
ARG legal_copyrightOwner
ARG welcomePageTitle_de
ARG welcomePageTitle_en
RUN envsubst < ./dist/num-portal-webapp/assets/config/config.docker.json > ./dist/num-portal-webapp/assets/config/config.deploy.json

### STAGE 2: Run ###
FROM nginx:1.25-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist/num-portal-webapp /usr/share/nginx/html
