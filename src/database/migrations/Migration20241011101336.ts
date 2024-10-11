import { Migration } from '@mikro-orm/migrations';

export class Migration20241011101336 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "user" ("id" serial primary key, "name" varchar(255) not null, "email" varchar(255) not null, "password" varchar(255) not null, "device" varchar(255) null, "last_active_device" varchar(255) null, "is_active" boolean not null default true, "last_login_at" timestamptz null, "created_at" timestamptz not null, "updated_at" timestamptz null);`,
    );
    this.addSql(
      `alter table "user" add constraint "user_email_unique" unique ("email");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "user" cascade;`);
  }
}
