# Galadrim Rooms

## Setup

-   for the backend you will need a mysql database ([docker setup](#-Docker-mysql-database))
-   yarn install

## Environment

on the frontend you need to create a `.env` you can copy and use the default [.env.example](./apps/frontend/.env.example)

```
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_API_URL=http://localhost:3333
```

on the backend you need to create a `.env` you can copy and modify [.env.example](./apps/backend/.env.example)

the part you will need to adapt is the database connection settings

```
MYSQL_HOST
MYSQL_PORT
MYSQL_USER
MYSQL_PASSWORD
MYSQL_DB_NAME
```

## Database

### Docker mysql database

if you have docker/docker-compose installed, you can run
it will launch a mysql server on the port 3310 you can edit this in [docker-compose.yml](./docker-compose.yml)

-   `docker-compose up`

### database setup

-   `cd ./apps/backend`
-   `node ace migration:run`

## Start project

you need to be at the root of the project, then you can run:
`nx dev backend`
and
`nx dev frontend`
