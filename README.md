# ternoa-test

Steps to run:

- Install [Docker](https://docs.docker.com/engine/install/)
- Install [Docker Compose](https://docs.docker.com/compose/install/)

- Add `.env` file based in `.env.example`

  ```
  BACKEND_PORT=4000
  SESSION_SECRET=fasdsfsfsvsfewggbdbsdfsdf
  FRONTEND_CORS_ORIGIN=http://localhost:3000
  POSTGRES_PASSWORD=admin
  POSTGRES_USER=admin
  POSTGRES_DB=ternoa-test
  ```

- run:

  ```
  docker-compose up
  ```

- Go to http://localhost:3000

- Default login
  ```
  Username: admin
  Password: 123456
  ```
