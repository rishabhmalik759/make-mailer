CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE scheduled_mail (
  id              uuid NOT NULL DEFAULT uuid_generate_v4(),
  schedule_date   DATE NOT NULL,
  mail            TEXT,
  -- Primary Key
  CONSTRAINT schedule_mail_pkey PRIMARY KEY (id),
);
