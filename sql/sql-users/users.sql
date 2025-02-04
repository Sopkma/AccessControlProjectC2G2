CREATE DATABASE users;

use users;

CREATE TABLE users (
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    salt     VARCHAR(4)   NOT NULL,
    email    VARCHAR(255) NOT NULL,
    role     ENUM("admin","editor","subscriber")  NOT NULL,
    PRIMARY KEY (username)
);

CREATE TABLE logs (
    id VARCHAR(255),
    ts DATETIME NOT NULL,
    username VARCHAR(255) NOT NULL,
    datatype VARCHAR(255) NOT NULL,
    status     ENUM("success","failure")  NOT NULL,
    PRIMARY KEY (id)
);
 
INSERT INTO users
VALUES(
    "user",
    "pass", -- make bcrypt password with the salt and pepper
    "hm84",
    "user@example.com",
     0--role
);

INSERT INTO users
VALUES(
    "user2",
    "pass2", -- make bcrypt password with the salt and pepper
    "hm84",
    "user2@example.com",
     1--role
);
