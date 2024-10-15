
<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
</p>

## About this project

`ims-nest-api-starter` is a backend API starter template using [NestJS](https://nestjs.com/) and [MikroORM](https://mikro-orm.io/) designed for scalable applications. This starter includes authentication, authorization, user management, role management, and role/permission-based access.

## Getting Started

1. **Choose Your Local Development Tool:**

   Select your preferred local development tool, such as [Docker](https://www.docker.com/), [Laragon](https://github.com/leokhoa/laragon), [Dbngin](https://dbngin.com/), or any other tool that suits your needs.

   ### Version Requirements

   - Node.js version 18+
   - PostgreSQL 16+
   - MikroORM for database interaction

2. **Configure Your Environment:**

   Update your `.env` file with the correct database credentials and environment variables.

   _Copy `.env.example` to `.env`:_

   ```bash
   cp .env.example .env
   ```

   Configure the following variables:

   - `APP_PORT`
   - `APP_ENV`
   - `JWT_SECRET`
   - `JWT_EXPIRATION`

   For JWT Secret generation, you can use this command:

   ```bash
   openssl rand -base64 64
   ```

   You also need to set up your PostgreSQL user and database:

   ```bash
   DB_DRIVER=postgres
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=ims-nest
   DB_USERNAME=postgres
   DB_PASSWORD=
   ```

   You can ignore this if you are using Docker (see the Docker section).

3. **Install Dependencies:**

   To install all necessary packages, run the following commands:

   ```bash
   npm install
   ```

   You can use Husky to manage git hooks:

   ```bash
   npx husky install
   ```

4. **Migrate and Seed the Database:**

   Initialize and seed the database with default data using MikroORM's migration tool:

   ```bash
   npm run migration:up
   npm run seeder:run
   ```

   Now, your project is ready for use. You can start exploring the API and customizing your app as needed.

5. **Run the Application:**

   Start the NestJS server locally:

   ```bash
   npm run start:dev
   ```

   The API will run on the port specified in your `.env` file (`APP_PORT`).

## Running With Docker

Coming soon

## Health Check

To ensure the health of your application, we have integrated [Terminus](https://docs.nestjs.com/recipes/terminus) for health checks.

You can visit `http://localhost:<APP_PORT>/health` to verify the status.

If everything is set up correctly, you should see a response like this:

```json
{
  "status": "ok",
  "info": {
    "ims-nest": {
      "status": "up"
    },
    "database": {
      "status": "up"
    },
    "memory_heap": {
      "status": "up"
    },
    "memory_rss": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "ims-nest": {
      "status": "up"
    },
    "database": {
      "status": "up"
    },
    "memory_heap": {
      "status": "up"
    },
    "memory_rss": {
      "status": "up"
    }
  }
}
```

## Testing

Run tests using Jest:

```bash
npm run test
```

## Extra CLI Commands

### Generate MikroORM Entities:

Generate entities to help improve your development flow with:

```bash
npx mikro-orm schema:generate
```

### Run Migrations:

To manage database schema changes, use:

```bash
npm run migration:create
# or
npx mikro-orm migration:create
npm run migration:up
# or
npx mikro-orm migration:up
```

If you want to drop all migrations and run them again with seed data, use:

```bash
npm run migration:fresh
# or
npx mikro-orm migration:fresh --seed
```

### Nest Cli Commands:

You can follow the Nest CLI command to create your required module, service, controller, and others. Visit: [Nest CLI Overview](https://docs.nestjs.com/cli/overview)

You can also run this command to see all the CLI commands available in your project:

```bash
nest generate --help
```

## Authors

- [@AHS12](https://www.github.com/AHS12)

## License

This project is brought to you by Innovix Matrix System and is released as open-source software under the [MIT license](https://opensource.org/licenses/MIT).

Feel free to use, modify, and distribute this starter project under the MIT license terms. Contributions are welcome to improve this template!
