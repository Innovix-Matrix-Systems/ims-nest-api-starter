<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
</p>

## About this project

`ims-nest-api-starter` is a backend API starter template using [NestJS](https://nestjs.com/) and [MikroORM](https://mikro-orm.io/) designed for scalable applications. This starter includes authentication, authorization, user management, role management, and role/permission-based access.

## Getting Started Guide Without Docker

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

## Xsecurity Setup

IMS introduces an additional layer of security, enhancing the API's reliability and resilience. With this system, only applications possessing a shared XSECURITY_TOKEN can send API requests to the server; others will be blocked. To get started, follow the guide below.

Getting Started
By default, XSecure is disabled! To enable it, set the XSECURITY_ENABLED value to true in your .env file:

```bash
XSECURITY_ENABLED=true
```

Other wise it will be disabled.

Installation
Execute the following command to set up XSECURITY:

```bash
npm run xsecurity:install
```
This command generates a secret for your application and updates your .env file with the `XSECURITY_SECRET` field.

After running the command, you will receive output similar to this:

```bash
Generated secret: N+6WQq7RjqvE+KhMRFDtk1n09M98lBAb/P/8j/I3w/7ibNzgbJeg2a+gBjNpPbMgyXSgq0sebXzYwPwnFSmleg==
XSECURITY_SECRET key has been updated in the .env file.
```
Use this secret in your frontend or mobile app to generate a short-lived XSecure token, which will be verified by the backend server.

For more information on how to use XSECURITY, refer to the [XSECURITY Guide](https://github.com/Innovix-Matrix-Systems/ims-laravel-api-starter/wiki/XSECURE-setup).

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
For reference, check out the `xsecurity` command implemented in [src/commands/xsecurity.command.ts](https://github.com/Innovix-Matrix-System/ims-nest-api-starter/blob/master/src/commands/xsecurity.command.ts).

## Authors

- [@AHS12](https://www.github.com/AHS12)

## License

This project is brought to you by Innovix Matrix System and is released as open-source software under the [MIT license](https://opensource.org/licenses/MIT).

Feel free to use, modify, and distribute this starter project under the MIT license terms. Contributions are welcome to improve this template!
