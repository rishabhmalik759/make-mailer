import { Pool } from "pg";
import { Mail } from "./service/mailer";

// Creating a thread pool to query the database
const DB_POOL = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  // max number of clients in the pool
  max: 20,
  port: 5433,
});

const GET_SCHEDULED_MAILS = `
  SELECT
    scheduled_date,
    mail
  FROM scheduled_mail
`;

const PUT_SCHEDULED_MAILS = `
INSERT INTO scheduled_mail (schedule_date, mail)
VALUES ($1, $2)
`;

export function getScheduledMails(
  callback: (err: Error | null, result: any) => any
) {
  DB_POOL.query(GET_SCHEDULED_MAILS, (err, result) => {
    if (err) {
      return callback(err, null);
    }
    return callback(null, result.rows);
  });
}

export function putScheduledMails(
  date: Date,
  mail: Mail,
  callback: (err: Error | null, result: any) => any
) {
  DB_POOL.query(PUT_SCHEDULED_MAILS, [date, mail], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    return callback(null, result.rows);
  });
}
