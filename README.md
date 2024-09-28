# Channel Surfers

## Developing

To develop this application, you must have [NodeJS](https://nodejs.org) (20 or higher) and [npm](https://www.npmjs.com/) installed.
You must also have access to a postgres database. If you have docker, you can spawn one by simply running:

Ensure you have all the environment variables stated in `.env.example`. Otherwise, you will have trouble building the app or making
database changes.

```sh
npm run db:start
```

```sh
npm install -D # Install Dependencies
npm run dev    # Start Dev Server
```

You can view the state of the database using Drizzle studio:

```sh
npm run studio
```

## Building

To create a production version of the app:

```bash
npm run build
```
