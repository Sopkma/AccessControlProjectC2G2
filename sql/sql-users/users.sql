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

INSERT INTO users
VALUES(
    "user",
    "pass", -- make bcrypt password with the salt and pepper
    "hm84",
    "user@example.com",
     0--role
);
