ALTER TABLE "channel_post_report" ADD COLUMN "reporter_id" uuid;--> statement-breakpoint
ALTER TABLE "channel_report" ADD COLUMN "reporter_id" uuid;--> statement-breakpoint
ALTER TABLE "channel_user_reports" ADD COLUMN "reporter_id" uuid;--> statement-breakpoint
ALTER TABLE "post_report" ADD COLUMN "reporter_id" uuid;--> statement-breakpoint
ALTER TABLE "user_report" ADD COLUMN "reporter_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "channel_post_report" ADD CONSTRAINT "channel_post_report_reporter_id_user_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "channel_report" ADD CONSTRAINT "channel_report_reporter_id_user_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "channel_user_reports" ADD CONSTRAINT "channel_user_reports_reporter_id_user_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_report" ADD CONSTRAINT "post_report_reporter_id_user_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_report" ADD CONSTRAINT "user_report_reporter_id_user_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
