ALTER TABLE "comment" DROP CONSTRAINT "comment_post_id_post_id_fk";
--> statement-breakpoint
ALTER TABLE "comment" DROP CONSTRAINT "comments_parent_id_fkey";
--> statement-breakpoint
ALTER TABLE "post_report" DROP CONSTRAINT "post_report_post_id_post_id_fk";
--> statement-breakpoint
ALTER TABLE "post_tag" DROP CONSTRAINT "post_tag_post_id_post_id_fk";
--> statement-breakpoint
ALTER TABLE "comment_vote" DROP CONSTRAINT "comment_vote_comment_id_comment_id_fk";
--> statement-breakpoint
ALTER TABLE "post_vote" DROP CONSTRAINT "post_vote_post_id_post_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comment" ADD CONSTRAINT "comment_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comment" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("reply_to") REFERENCES "public"."comment"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_report" ADD CONSTRAINT "post_report_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_tag" ADD CONSTRAINT "post_tag_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comment_vote" ADD CONSTRAINT "comment_vote_comment_id_comment_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comment"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_vote" ADD CONSTRAINT "post_vote_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
