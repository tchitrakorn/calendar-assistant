DROP DATABASE IF EXISTS calendar_assistant_db;
CREATE DATABASE calendar_assistant_db;
\c calendar_assistant_db;

DROP TABLE IF EXISTS usersEvents;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id              SERIAL      UNIQUE      PRIMARY KEY,
    email           VARCHAR     UNIQUE      NOT NULL,
    client_id       VARCHAR,
    client_secret   VARCHAR,
    openai_key      VARCHAR,
    access_token    VARCHAR,
    refresh_token   VARCHAR
);

CREATE TABLE events (
    id          SERIAL      UNIQUE      PRIMARY KEY,
    event_type  VARCHAR     NOT NULL
);

CREATE TABLE usersEvents (
    id          SERIAL      UNIQUE      PRIMARY KEY,
    userId      INT         NOT NULL    REFERENCES users(id),
    eventId     INT         NOT NULL    REFERENCES events(id)
);