import { Data } from 'effect';

/**
 * Indicates that some unknown DB error occurred
 */
export class DbError extends Data.TaggedError('DbError')<{ message: string }> {}
/**
 * Indicates that a requested resource could not be identified
 */
export class ResourceNotFoundError extends Data.TaggedError('ResourceNotFoundError')<{
    message: string;
}> {}
/**
 * Indicates that provided options of type `T` were malformed
 */
export class BadOptsError<T> extends Data.TaggedError('BadOptsError')<{
    message: string;
    opts: T;
}> {}
