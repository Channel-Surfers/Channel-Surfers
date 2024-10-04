ALTER TABLE "public_channel" RENAME COLUMN "post_id" TO "channel_id";--> statement-breakpoint
ALTER TABLE "public_channel" DROP CONSTRAINT "public_channel_post_id_channel_id_fk";
--> statement-breakpoint
ALTER TABLE "public_channel" ADD PRIMARY KEY ("channel_id");--> statement-breakpoint
ALTER TABLE "channel" ADD COLUMN "banner_image" text;--> statement-breakpoint
ALTER TABLE "channel" ADD COLUMN "icon" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "discord_id" bigint;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "github_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public_channel" ADD CONSTRAINT "public_channel_channel_id_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channel"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_discord_id_unique" UNIQUE("discord_id");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_github_id_unique" UNIQUE("github_id");