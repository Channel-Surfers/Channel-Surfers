import type { Result } from 'ts-results';

export type DbResult<T, E> = Promise<Result<T, E>>;
