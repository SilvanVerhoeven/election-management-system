# Election Management System &ndash; Prototype

Prototypical tool to facilitate document generation for elections

> Development terminated. The prototype has successfully demonstrated the capabilities of an Election Management System, which now has to be implemented on a future-proof tech stack.

## Getting Started

Copy `.env` file to `.env.local` and adjust the following line:

```
DATABASE_URL="file:./db.sqlite?socket_timeout=10&connection_limit=1"
```

Run the Election Management System (EMS) in development mode:

```
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Import the necessary data source files and upload templates.

You may now generate documents like candidate overviews and ballots.

## Disclaimer

This tool is not ready for production. It should not be used in a server environment.
