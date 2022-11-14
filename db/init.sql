CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
DROP TABLE IF EXISTS scheduled_mail CASCADE;
CREATE TABLE scheduled_mail (
  id            uuid NOT NULL DEFAULT uuid_generate_v4(),
);
