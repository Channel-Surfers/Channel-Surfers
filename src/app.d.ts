import type { AuthUser } from '$lib/server/auth';
import type { User, Session } from 'lucia';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            // Since Lucia does some funniness with the type system, the `User`
            // type is not consistently accurate, hence the (& AuthUser) here
            user: (User & AuthUser) | null;
            session: Session | null;
        }
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }
}

export {};
