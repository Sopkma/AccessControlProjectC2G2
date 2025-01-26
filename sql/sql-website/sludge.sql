CREATE DATABASE sludge;

use sludge;

CREATE TABLE sludge (
  id  INT PRIMARY KEY AUTO_INCREMENT,
  density INT,
  color VARCHAR(250),
  grossness VARCHAR(250)
);

CREATE TABLE goo (
  id  INT PRIMARY KEY AUTO_INCREMENT,
  density INT,
  ooziness INT,
  color VARCHAR(250),
  grossness VARCHAR(250)
);

CREATE TABLE shlop (
  id  INT PRIMARY KEY AUTO_INCREMENT,
  density INT,
  color VARCHAR(250),
  grossness VARCHAR(250),
  trashiness INT
);

INSERT INTO sludge (
  density,
  color,
  grossness
) VALUES (250,'red','very');

INSERT INTO good (
  density,
  color,
  grossness,
  ooziness
) VALUES (250,'red','very', 500000);

INSERT INTO sludge (
  density,
  color,
  grossness,
  trashiness
) VALUES (250,'red','very',4567);
