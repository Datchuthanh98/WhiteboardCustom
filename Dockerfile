# FROM node:14-alpine AS build

# WORKDIR /opt/node_app

# COPY package.json yarn.lock ./
# RUN yarn --ignore-optional --network-timeout 600000

# ARG NODE_ENV=development       

# COPY . .
# RUN yarn build:app:docker

# FROM nginx:1.21-alpine

# COPY --from=build /opt/node_app/build /usr/share/nginx/html

# HEALTHCHECK CMD wget -q -O /dev/null http://localhost || exit 1

# Fetching the latest node image on apline linux
FROM node:18 AS builder

EXPOSE 80

# Setting up the work directory
WORKDIR /app

# Installing dependencies
COPY ./package.json ./
RUN yarn --ignore-optional --network-timeout 600000

ARG NODE_ENV=production

# Copying all the files in our project
COPY . .

# Building our application
RUN yarn build:app:docker

# Fetching the latest nginx image
FROM nginx

# Copying built assets from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Copying our nginx.conf
COPY ./nginx.conf /etc/nginx/conf.d/default.conf