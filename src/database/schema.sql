DROP DATABASE IF EXISTS calendar_assistant_db;
CREATE DATABASE calendar_assistant_db;
\c calendar_assistant_db;

DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS usersOrgs;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS orgs;

CREATE TABLE orgs (
    id              SERIAL      UNIQUE      NOT NULL,
    name            VARCHAR     NOT NULL
);

CREATE TABLE users (
    id                      SERIAL      UNIQUE      NOT NULL,
    email                   VARCHAR     UNIQUE      NOT NULL,
    client_id               VARCHAR,
    client_secret           VARCHAR,
    openai_key              VARCHAR,
    access_token            VARCHAR,
    refresh_token           VARCHAR,
    city                    VARCHAR,
    PRIMARY KEY(id, email)
);

CREATE TABLE usersOrgs (
    id                      SERIAL      UNIQUE      NOT NULL,
    org_id                  INT         NOT NULL    REFERENCES orgs(id),
    email                   VARCHAR     NOT NULL    REFERENCES users(email)
);

CREATE TABLE events (
    id                      SERIAL      UNIQUE      PRIMARY KEY,
    org_id                  INT         NOT NULL    REFERENCES orgs(id),
    email                   VARCHAR     NOT NULL    REFERENCES users(email),
    event_type              VARCHAR     NOT NULL
);

INSERT INTO orgs(id, name) VALUES(0, 'UNKNOWN');
INSERT INTO orgs(name) VALUES('Calendar Chat Bot');