import { createClient } from "@clickhouse/client";

const asyncClient = createClient({
  url: process.env.CLICKHOUSE_URL ?? "",
  username: process.env.CLICKHOUSE_USERNAME ?? "",
  password: process.env.CLICKHOUSE_PASSWORD ?? "",
  database: process.env.CLICKHOUSE_DATABASE ?? "",
  clickhouse_settings: {
    async_insert: 1,
    wait_for_async_insert: 1,
  },
});

const nonAsyncClient = createClient({
  url: process.env.CLICKHOUSE_URL ?? "",
  username: process.env.CLICKHOUSE_USERNAME ?? "",
  password: process.env.CLICKHOUSE_PASSWORD ?? "",
  database: process.env.CLICKHOUSE_DATABASE ?? "",
});

const main = async () => {
  // Create the table
  console.log("Creating table");
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS test (id Int32, name String) ENGINE = MergeTree() ORDER BY id
  `;
  await nonAsyncClient.exec({
    query: createTableQuery,
  });
  console.log("Table created");
  // Insert data into the table using command, and the sync client
  const insertDataQuery = `
    INSERT INTO test (id, name) VALUES ({id: UInt32}, {name: String})
  `;
  console.log("Inserting data using sync client");
  await nonAsyncClient.command({
    query: insertDataQuery,
    query_params: {
      id: 1,
      name: "test",
    },
  });
  console.log("Data inserted using sync client");

  // Insert data into the table using query, and the async client
  console.log("Inserting data using async client");
  await asyncClient.command({
    query: insertDataQuery,
    query_params: {
      id: 1,
      name: "test",
    },
  });
  // Throws here!
  /**
   * /Users/brian/superwall/clickhouse-client-async-command/node_modules/@clickhouse/client-common/dist/error/parse_error.js:34
        return new ClickHouseError(groups);
               ^
    ClickHouseError: Substitution `id` is not set: While executing WaitForAsyncInsert. 
        at parseError (/Users/brian/superwall/clickhouse-client-async-command/node_modules/packages/client-common/src/error/parse_error.ts:30:12)
        at ClientRequest.onResponse (/Users/brian/superwall/clickhouse-client-async-command/node_modules/packages/client-node/src/connection/node_base_connection.ts:474:28)
        at process.processTicksAndRejections (node:internal/process/task_queues:95:5) {
      code: '456',
      type: 'UNKNOWN_QUERY_PARAMETER'
    }
    Node.js v18.20.4 
   * 
   */
  console.log("Data inserted using async client");
};

main();
