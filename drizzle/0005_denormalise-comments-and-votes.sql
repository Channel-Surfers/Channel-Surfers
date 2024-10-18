ALTER TABLE "comment" ADD COLUMN "upvotes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "comment" ADD COLUMN "downvotes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "comments" integer DEFAULT 0 NOT NULL;

UPDATE post
    SET comments = (
        SELECT count(*) FROM "comment"
            WHERE post_id = post.id
    );

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
