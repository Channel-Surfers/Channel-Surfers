/**
 * Indicates that some unknown DB error occurred
 */
export class DbError { constructor (public data: { message: string }) {} }

/**
 * Indicates that a requested resource could not be identified
 */
export class ResourceNotFoundError { constructor (public data: { message: string }) {} }

/**
 * Indicates that provided options of type `T` were malformed
 */
export class BadOptsError<T> { constructor (public data: { message: string; opts: T; }) {} }
