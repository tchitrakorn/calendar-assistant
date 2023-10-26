DROP DATABASE IF EXISTS calendar_assistant_db;
CREATE DATABASE calendar_assistant_db;
\c calendar_assistant_db;

DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id              SERIAL      UNIQUE      NOT NULL,
    email           VARCHAR     UNIQUE      NOT NULL,
    client_id       VARCHAR,
    client_secret   VARCHAR,
    openai_key      VARCHAR,
    access_token    VARCHAR,
    refresh_token   VARCHAR,
    city            VARCHAR,
    PRIMARY KEY(id, email)
);

CREATE TABLE events (
    id          SERIAL      UNIQUE      PRIMARY KEY,
    email       VARCHAR     NOT NULL    REFERENCES users(email),
    event_type  VARCHAR     NOT NULL,
    prompt      VARCHAR
);