export const dbError = (message: string) => ({ type: 'DB_ERROR', message }) as const;
export type DbError = typeof dbError;

export const resourceNotFound = (resource: string, message: string) =>
    ({
        type: 'RESOURCE_NOT_FOUND',
        resource,
        message,
    }) as const;
export type ResourceNotFoundError = typeof resourceNotFound;
