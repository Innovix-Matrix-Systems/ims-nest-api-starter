import { Migration } from '@mikro-orm/migrations';

export class Migration20241104162602 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "user" add column "google_id" varchar(255) null;`);
    this.addSql(
      `alter table "user" alter column "password" type varchar(255) using ("password"::varchar(255));`,
    );
    this.addSql(`alter table "user" alter column "password" drop not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user" drop column "google_id";`);

    this.addSql(
      `alter table "user" alter column "password" type varchar(255) using ("password"::varchar(255));`,
    );
    this.addSql(`alter table "user" alter column "password" set not null;`);
  }
}
