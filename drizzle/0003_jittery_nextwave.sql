CREATE OR REPLACE FUNCTION update_post_vote_fn()
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
                SET downvotes = post.downvotes - 1
                WHERE post.id = NEW.post_id;
        ELSIF NEW.vote = 'DOWN' THEN
            UPDATE post
                SET downvotes = post.downvotes + 1
                WHERE post.id = NEW.post_id;
            UPDATE post
                SET upvotes = post.upvotes - 1
                WHERE post.id = NEW.post_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;
