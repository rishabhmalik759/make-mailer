import * as fs from "fs";
import * as path from "path";
import { Pool } from "pg";
import { db } from "./config/dbConfig.json";

// This file should be gitignored and chmod chmod protected
const DB_PASS_FILEPATH = path.resolve(path.join(__dirname, "./db-pass.txt"));
const PG_PASSWORD = fs.readFileSync(DB_PASS_FILEPATH, "utf8").trim();

// Creating a thread pool to query the database
const DB_POOL = new Pool({
  host: db.host,
  user: db.user,
  database: db.database,
  password: PG_PASSWORD,
  // max number of clients in the pool
  max: 20,
});

// Database Queries : TODO
