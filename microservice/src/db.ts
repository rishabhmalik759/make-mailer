import { Pool } from "pg";

// Creating a thread pool to query the database
const DB_POOL = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  // max number of clients in the pool
  max: 20,
});

// Database Queries : TODO
