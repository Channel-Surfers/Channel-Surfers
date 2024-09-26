export const dbError = (message: string) => ({ type: 'DB_ERROR', message }) as const;
export type DbError = ReturnType<typeof dbError>;

export const resourceNotFound = (resource: string, message: string) =>
    ({
        type: 'RESOURCE_NOT_FOUND',
        resource,
        message,
    }) as const;
export type ResourceNotFoundError = ReturnType<typeof resourceNotFound>;

export const badOptsError = <T>(message: string, opts: T) =>
    ({ type: 'BAD_OPTS_ERROR', message, opts }) as const;
export type BadOptsError<T> = ReturnType<typeof badOptsError<T>>;
