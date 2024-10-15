# ClickHouse Insert Async Command Issue

When using the @clickhouse/client to insert data using the `command` method, and
query paramters, and the async client, the query fails with the error:

```
Substitution `id` is not set: While executing WaitForAsyncInsert. 
```

However, if you use the synchronous client, it works fine.

This can be reproduced with the code in `src/Clickhouse.ts`.

To run:
1. `cp .env.example .env.local`
2. Fill in the `.env.local` file with your ClickHouse credentials
3. `yarn && source .env.local && yarn tsx src/Clickhouse.ts`
