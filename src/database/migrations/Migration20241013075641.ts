import { Migration } from '@mikro-orm/migrations';

export class Migration20241013075641 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "permission" alter column "description" type varchar(255) using ("description"::varchar(255));`,
    );
    this.addSql(
      `alter table "permission" alter column "description" drop not null;`,
    );

    this.addSql(
      `alter table "role" alter column "description" type varchar(255) using ("description"::varchar(255));`,
    );
    this.addSql(`alter table "role" alter column "description" drop not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "permission" alter column "description" type varchar(255) using ("description"::varchar(255));`,
    );
    this.addSql(
      `alter table "permission" alter column "description" set not null;`,
    );

    this.addSql(
      `alter table "role" alter column "description" type varchar(255) using ("description"::varchar(255));`,
    );
    this.addSql(`alter table "role" alter column "description" set not null;`);
  }
}
