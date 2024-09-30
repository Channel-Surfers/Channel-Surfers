import { defineConfig } from 'drizzle-kit';
//import 'dotenv/config';
const { POSTGRES_CONNECTION_STRING } = process.env;
if (!POSTGRES_CONNECTION_STRING) process.exit(1);

export default defineConfig({
    schema: './src/lib/server/db/*.sql.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: POSTGRES_CONNECTION_STRING,
    },
});
