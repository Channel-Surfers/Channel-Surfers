import { Effect } from 'effect';
import type { DB } from '..';
import { DbError, ResourceNotFoundError } from './utils/errors';
import { eq } from 'drizzle-orm';
import { userTable, type NewUser, type User } from '../db/users.sql';

export const getUserById = (
    db: DB,
    id: string
): Effect.Effect<User, DbError | ResourceNotFoundError> =>
    Effect.gen(function* (_) {
        const dbResponse = yield* Effect.tryPromise({
            try: () => db.select().from(userTable).where(eq(userTable.id, id)),
            catch: (err: unknown) => new DbError({ message: `Something went wrong: ${err}` }),
        });
        if (dbResponse.length == 0) {
            Effect.fail(
                new ResourceNotFoundError({ message: 'Could not find user by provided id' })
            );
        }

        return dbResponse[0];
    });

export const getUserByAuth = (
    db: DB,
    auth: { discordId: bigint }
): Effect.Effect<User, DbError | ResourceNotFoundError> =>
    Effect.gen(function* (_) {
        const dbResponse = yield* Effect.tryPromise({
            try: () => db.select().from(userTable).where(eq(userTable.discordId, auth.discordId)),
            catch: (err: unknown) => new DbError({ message: `Something went wrong: ${err}` }),
        });
        if (dbResponse.length == 0) {
            Effect.fail(
                new ResourceNotFoundError({ message: 'Could not find user by provided id' })
            );
        }

        return dbResponse[0];
    });

export const createUser = (db: DB, newUser: NewUser): Effect.Effect<User, DbError> =>
    Effect.gen(function* (_) {
        const dbResponse = yield* Effect.tryPromise({
            try: () => db.insert(userTable).values(newUser).returning(),
            catch: (err) => new DbError({ message: `Something went wrong: ${err}` }),
        });

        if (dbResponse.length == 0) {
            Effect.fail(new ResourceNotFoundError({ message: 'Could not create new user' }));
        }
        return dbResponse[0];
    });
