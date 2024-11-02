<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
</p>

## About this project

`ims-nest-api-starter` is a backend API starter template using [NestJS](https://nestjs.com/), [PostgreSQL](https://www.postgresql.org/), [Redis](https://redis.io/), [BullMQ](https://bullmq.io/), [MikroORM](https://mikro-orm.io/) and [XSECURITY](https://www.npmjs.com/package/nestjs-xsecurity) designed for scalable applications.

### Key Features

- **Authentication**: JWT-based token authentication for secure access.
- **Authorization**: Role- and permission-based access control to manage user privileges.
- **Caching Support**: Integrated Redis caching for enhanced performance.
- **Database Management**: MikroORM setup with PostgreSQL for efficient data handling.
- **Queue Management**: BullMQ for asynchronous tasks and event-driven architecture.
- **Email Notification**: Send emails using [Nodemailer](https://nodemailer.com/) with BullMQ asynchronously.
- **XSECURITY**: [XSECURITY](https://www.npmjs.com/package/nestjs-xsecurity) is an added security layer that safeguards APIs against unauthorized access, ensuring data protection and integrity.

## Getting Started Guide Without Docker

1. **Choose Your Local Development Tool:**

   Select your preferred local development tool, such as [Dbngin](https://dbngin.com/)(comes with postgresql and redis) or any other tool that suits your needs.

   ### Version Requirements

   - Node.js version 18+
   - PostgreSQL 16+
   - Redis 7+

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

   You also need to set up your Redis server:

   ```bash
   REDIS_HOST=localhost
   REDIS_PORT=6379
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

## Getting Started Guide With Docker

1.  **Build the Docker Image**

    To build the Docker image for the application, run the following command:

    ```bash
      docker-compose build
    ```

2.  **Start the Application**

    After building the image, start the application using:

    ```bash
      docker-compose up
    ```

    the Api should be running at `.env.docker` file (`APP_PORT`)(8000) by default.

    You can also use `docker-compose up -d` to start the application in the background.

    You can also use `docker-compose logs -f` to follow the logs of the application.

    you can also use `docker-compose up --build` to build the image and start the application.

3.  **Run Migrations and Seed Data**

    If you need to run database migrations and seed initial data, you can enter the application container with the following command:

    ```bash
    docker-compose exec app bash
    ```

    Once inside the container, execute the following commands:

    ```bash
    npm run migration:up
    npm run seeder:run
    ```

    This will apply any pending migrations and populate the database with seed data.

4.  **Git hook for Check**
    You can use Husky to manage git hooks:
    go to root directory of your project, then run the following command:

    ```bash
    npx husky install
    ```

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
    },
    "redis": {
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
    },
    "redis": {
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

## Xsecurity Setup

To ensure the security of your application, we have integrated [XSECURITY](https://www.npmjs.com/package/nestjs-xsecurity) which is a security layer that safeguards APIs against unauthorized access by token validation, rate limiting. here is the [XSECURITY Guide](https://github.com/AHS12/nestjs-xsecurity/wiki).

for quick start, you can run the following command:

```bash
npx nestjs-xsecurity install
```
This command will:
- Generate a secure random secret
- Set up required environment variables
- update the existing `.env` file with the new environment variables

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

You can create custom CLI commands tailored to your specific needs using the [nestjs-command](https://www.npmjs.com/package/nestjs-command) package.
This project already includes integration with [nestjs-command](https://www.npmjs.com/package/nestjs-command) package.
For reference, check out the `create-module` command implemented in [src/commands/create-module.command.ts](https://github.com/Innovix-Matrix-Systems/ims-nest-api-starter/blob/main/src/commands/create-module.command.ts).

### Custom Module Creation Command

This project includes a custom command to generate a new NestJS module with a well-organized folder structure.

### What this command does:

- Creates a new module using the NestJS CLI.
- Generates the associated controller and service.
- Adds additional folders (`dto`, `repositories`,) inside the module folder for organizing your code.
- Creates a `types.d.ts` file for type definitions.

### How to Use:

1. Open your terminal and navigate to the project root.
2. Run the following command, replacing `yourModuleName` with the name of the module you want to create:

   ```bash
   npm run create:module <moduleName>
   ```

   For example, to create a module named `product`, you would run:

   ```bash
   npm run create:module product
   ```

## Authors

- [@AHS12](https://www.github.com/AHS12)

## Contributors

<!-- readme: contributors -start -->
<table>
	<tbody>
		<tr>
            <td align="center">
                <a href="https://github.com/AHS12">
                    <img src="https://avatars.githubusercontent.com/u/25058208?v=4" width="100;" alt="AHS12"/>
                    <br />
                    <sub><b>Azizul Hakim</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/ajshovon">
                    <img src="https://avatars.githubusercontent.com/u/61104583?v=4" width="100;" alt="ajshovon"/>
                    <br />
                    <sub><b>shovon</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/amanullah7649">
                    <img src="https://avatars.githubusercontent.com/u/45013120?v=4" width="100;" alt="amanullah7649"/>
                    <br />
                    <sub><b>MD: AMAN ULLAH</b></sub>
                </a>
            </td>
		</tr>
	<tbody>
</table>
<!-- readme: contributors -end -->

## License

This project is brought to you by [Innovix Matrix System](https://innovixmatrixsystem.com/) and is released as open-source software under the [CC0 1.0 License](https://github.com/Innovix-Matrix-Systems/ims-nest-api-starter/blob/main/LICENSE).

Feel free to use, modify, and distribute this starter project under the CC0 1.0 license terms. Contributions are welcome to improve this template!
