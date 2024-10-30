DO $$ BEGIN
 CREATE TYPE "public"."post_status" AS ENUM('UPLOADING', 'HIDDEN', 'OK');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "status" "post_status" DEFAULT 'OK' NOT NULL;