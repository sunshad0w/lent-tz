import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1711929600000 implements MigrationInterface {
  name = 'InitialSchema1711929600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
        "email" varchar(255) NOT NULL,
        "password" varchar(255) NOT NULL,
        "first_name" varchar(100) NOT NULL,
        "last_name" varchar(100) NOT NULL,
        "birth_date" date,
        "about" text,
        "phone" varchar(20),
        "avatar_path" varchar(500),
        "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
        "updated_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
        CONSTRAINT "pk_users" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_users_email" ON "users" ("email")
    `);

    await queryRunner.query(`
      CREATE TABLE "posts" (
        "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
        "content" text NOT NULL,
        "user_id" uuid NOT NULL,
        "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
        "updated_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
        "deleted_at" TIMESTAMPTZ,
        CONSTRAINT "pk_posts" PRIMARY KEY ("id"),
        CONSTRAINT "fk_posts_users" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_posts_user_id_created_at"
      ON "posts" ("user_id", "created_at" DESC)
      WHERE "deleted_at" IS NULL
    `);

    await queryRunner.query(`
      CREATE TABLE "post_images" (
        "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
        "file_path" varchar(500) NOT NULL,
        "order" smallint DEFAULT 0 NOT NULL,
        "post_id" uuid NOT NULL,
        "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
        CONSTRAINT "pk_post_images" PRIMARY KEY ("id"),
        CONSTRAINT "fk_post_images_posts" FOREIGN KEY ("post_id")
          REFERENCES "posts"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
        "token_hash" varchar(255) NOT NULL,
        "user_id" uuid NOT NULL,
        "expires_at" TIMESTAMPTZ NOT NULL,
        "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
        CONSTRAINT "pk_refresh_tokens" PRIMARY KEY ("id"),
        CONSTRAINT "fk_refresh_tokens_users" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_refresh_tokens_user_id"
      ON "refresh_tokens" ("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "post_images"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "posts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
