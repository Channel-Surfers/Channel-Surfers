ALTER TABLE "post" ADD COLUMN "upvotes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "downvotes" integer DEFAULT 0 NOT NULL;

CREATE OR REPLACE FUNCTION update_vote_fn()
RETURNS TRIGGER 
LANGUAGE PLPGSQL
AS
$$
BEGIN
    IF NEW.vote <> OLD.vote THEN
        IF NEW.vote = 'UP' THEN
            UPDATE post
                SET upvotes = post.upvotes + 1
                WHERE post.id = NEW.post_id;
            UPDATE post
                SET upvotes = post.downvotes - 1
                WHERE post.id = NEW.post_id;
        ELSIF NEW.vote = 'DOWN' THEN
            UPDATE post
                SET downvotes = post.downvotes + 1
                WHERE post.id = NEW.post_id;
            UPDATE post
                SET downvotes = post.upvotes - 1
                WHERE post.id = NEW.post_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION insert_vote_fn()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS
$$
BEGIN
    IF NEW.vote = 'UP' THEN
        UPDATE post
            SET upvotes = post.upvotes + 1
            WHERE post.id = NEW.post_id;
    ELSIF NEW.vote = 'DOWN' THEN
        UPDATE post
            SET downvotes = post.downvotes + 1
            WHERE post.id = NEW.post_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION delete_vote_fn()
RETURNS TRIGGER 
LANGUAGE PLPGSQL
AS
$$
BEGIN
    IF OLD.vote = 'UP' THEN
        UPDATE post
            SET upvotes = post.upvotes - 1
            WHERE post.id = OLD.post_id;
    ELSIF OLD.vote = 'DOWN' THEN
        UPDATE post
            SET downvotes = post.downvotes - 1
            WHERE post.id = OLD.post_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER update_vote
AFTER UPDATE
ON post_vote
FOR EACH ROW
    EXECUTE FUNCTION update_vote_fn();

CREATE OR REPLACE TRIGGER insert_vote
AFTER INSERT
ON post_vote
FOR EACH ROW
    EXECUTE FUNCTION insert_vote_fn();

CREATE OR REPLACE TRIGGER delete_vote
AFTER DELETE
ON post_vote
FOR EACH ROW
    EXECUTE FUNCTION delete_vote_fn();
