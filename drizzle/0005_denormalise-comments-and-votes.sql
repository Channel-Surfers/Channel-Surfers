ALTER TABLE "follow" ADD CONSTRAINT "follow_user_id_follower_id_pk" PRIMARY KEY("user_id","follower_id");--> statement-breakpoint
ALTER TABLE "channel" ADD COLUMN "subscribers" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "channel" ADD COLUMN "posts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "comment" ADD COLUMN "upvotes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "comment" ADD COLUMN "downvotes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "comments" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "followers" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "following" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "follow" ADD CONSTRAINT "follow_follower_id_user_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "follow" ADD CONSTRAINT "follow_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Comment count denorm

UPDATE post
    SET comments = (
        SELECT count(*) FROM "comment"
            WHERE post_id = post.id
    );

CREATE OR REPLACE FUNCTION insert_comment_fn()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS
$$
BEGIN
    UPDATE post
        SET comments = post.comments + 1
        WHERE "post".id = NEW.post_id;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION delete_comment_fn()
RETURNS TRIGGER 
LANGUAGE PLPGSQL
AS
$$
BEGIN
    UPDATE post
        SET comments = post.comments - 1
        WHERE "post".id = OLD.post_id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER insert_comment
AFTER INSERT
ON "comment"
FOR EACH ROW
    EXECUTE FUNCTION insert_comment_fn();

CREATE TRIGGER delete_comment
AFTER DELETE
ON "comment"
FOR EACH ROW
    EXECUTE FUNCTION delete_comment_fn();

-- Follow count denorm

UPDATE "user"
    SET followers = (
        SELECT count(*) FROM "follow"
            WHERE user_id = "user".id
    );

UPDATE "user"
    SET following = (
        SELECT count(*) FROM "follow"
            WHERE follower_id = "user".id
    );

CREATE OR REPLACE FUNCTION insert_follow_fn()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS
$$
BEGIN
    UPDATE "user"
        SET followers = "user".followers + 1
        WHERE "user".id = NEW.user_id;
    UPDATE "user"
        SET following = "user".following + 1
        WHERE "user".id = NEW.follower_id;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION delete_follow_fn()
RETURNS TRIGGER 
LANGUAGE PLPGSQL
AS
$$
BEGIN
    UPDATE "user"
        SET followers = "user".followers - 1
        WHERE "user".id = OLD.user_id;
    UPDATE "user"
        SET following = "user".following - 1
        WHERE "user".id = OLD.follower_id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER insert_follow
AFTER INSERT
ON "follow"
FOR EACH ROW
    EXECUTE FUNCTION insert_follow_fn();

CREATE TRIGGER delete_follow
AFTER DELETE
ON "follow"
FOR EACH ROW
    EXECUTE FUNCTION delete_follow_fn();

-- Subscription count

UPDATE "channel"
    SET subscribers = (
        SELECT count(*) FROM "subscription"
            WHERE channel_id = "channel".id
    );

CREATE OR REPLACE FUNCTION insert_subscription_fn()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS
$$
BEGIN
    UPDATE "channel"
        SET subscribers = "channel".subscribers + 1
        WHERE "channel".id = NEW.channel_id;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION delete_subscription_fn()
RETURNS TRIGGER 
LANGUAGE PLPGSQL
AS
$$
BEGIN
    UPDATE "channel"
        SET subscribers = "channel".subscribers - 1
        WHERE "channel".id = OLD.channel_id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER insert_subscription
AFTER INSERT
ON "subscription"
FOR EACH ROW
    EXECUTE FUNCTION insert_subscription_fn();

CREATE TRIGGER delete_subscription
AFTER DELETE
ON "subscription"
FOR EACH ROW
    EXECUTE FUNCTION delete_subscription_fn();

-- Comment vote denormalisations

UPDATE "comment"
    SET upvotes = (
        SELECT count(*) FROM comment_vote
            WHERE comment_id = "comment".id AND vote = 'UP'
    );
UPDATE "comment"
    SET downvotes = (
        SELECT count(*) FROM comment_vote
            WHERE comment_id = "comment".id AND vote = 'DOWN'
    );


CREATE OR REPLACE FUNCTION update_comment_vote_fn()
RETURNS TRIGGER 
LANGUAGE PLPGSQL
AS
$$
BEGIN
    IF NEW.vote <> OLD.vote THEN
        IF NEW.vote = 'UP' THEN
            UPDATE "comment"
                SET upvotes = "comment".upvotes + 1
                WHERE "comment".id = NEW.comment_id;
            UPDATE "comment"
                SET downvotes = "comment".downvotes - 1
                WHERE "comment".id = NEW.comment_id;
        ELSIF NEW.vote = 'DOWN' THEN
            UPDATE "comment"
                SET downvotes = "comment".downvotes + 1
                WHERE "comment".id = NEW.comment_id;
            UPDATE "comment"
                SET upvotes = "comment".upvotes - 1
                WHERE "comment".id = NEW.comment_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION insert_comment_vote_fn()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS
$$
BEGIN
    IF NEW.vote = 'UP' THEN
        UPDATE "comment"
            SET upvotes = "comment".upvotes + 1
            WHERE "comment".id = NEW.comment_id;
    ELSIF NEW.vote = 'DOWN' THEN
        UPDATE "comment"
            SET downvotes = "comment".downvotes + 1
            WHERE "comment".id = NEW.comment_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION delete_comment_vote_fn()
RETURNS TRIGGER 
LANGUAGE PLPGSQL
AS
$$
BEGIN
    IF OLD.vote = 'UP' THEN
        UPDATE "comment"
            SET upvotes = "comment".upvotes - 1
            WHERE "comment".id = OLD.comment_id;
    ELSIF OLD.vote = 'DOWN' THEN
        UPDATE "comment"
            SET downvotes = "comment".downvotes - 1
            WHERE "comment".id = OLD.comment_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_comment_vote
AFTER UPDATE
ON comment_vote
FOR EACH ROW
    EXECUTE FUNCTION update_comment_vote_fn();

CREATE TRIGGER insert_comment_vote
AFTER INSERT
ON comment_vote
FOR EACH ROW
    EXECUTE FUNCTION insert_comment_vote_fn();

CREATE TRIGGER delete_comment_vote
AFTER DELETE
ON comment_vote
FOR EACH ROW
    EXECUTE FUNCTION delete_comment_vote_fn();

-- Post count denorm

UPDATE "channel"
    SET posts = (
        SELECT count(*) FROM "post"
            WHERE channel_id = "channel".id
    );

CREATE OR REPLACE FUNCTION insert_post_fn()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS
$$
BEGIN
    UPDATE "channel"
        SET posts = "channel".posts + 1
        WHERE "channel".id = NEW.channel_id;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_post_fn()
RETURNS TRIGGER 
LANGUAGE PLPGSQL
AS
$$
BEGIN
    IF NEW.channel_id <> OLD.channel_id THEN
        UPDATE "channel"
            SET post = "channel".post - 1
            WHERE "channel".id = OLD.channel_id;
        UPDATE "channel"
            SET post = "channel".post + 1
            WHERE "channel".id = NEW.channel_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION delete_post_fn()
RETURNS TRIGGER 
LANGUAGE PLPGSQL
AS
$$
BEGIN
    UPDATE "channel"
        SET posts = "channel".posts - 1
        WHERE "channel".id = OLD.channel_id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER insert_post
AFTER INSERT
ON "post"
FOR EACH ROW
    EXECUTE FUNCTION insert_post_fn();

CREATE TRIGGER update_post
AFTER UPDATE
ON "post"
FOR EACH ROW
    EXECUTE FUNCTION update_post_fn();

CREATE TRIGGER delete_post
AFTER DELETE
ON "post"
FOR EACH ROW
    EXECUTE FUNCTION delete_post_fn();
