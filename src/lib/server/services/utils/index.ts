import { sql } from 'drizzle-orm';
import type { AnyColumn, SQL } from 'drizzle-orm';

/**
 * Collect input values into an array using PostgreSQL's `array_agg`
 */
// Signature partially stolen from `max` aggrigator
export const array_agg = <T extends AnyColumn>(expr: T): SQL<T['_']['data'][]> =>
    sql`array_agg(${expr})`;

/**
 * Remove duplicates and null values from an array query
 */
export const dedupe_nonull_array = <E>(expr: SQL<E[]>): SQL<E[]> =>
    sql`array(select distinct unnest from unnest(${expr}) where unnest is not NULL)`;
