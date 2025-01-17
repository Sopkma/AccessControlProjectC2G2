CREATE DATABASE sludge;

use sludge;

CREATE TABLE sludge (
  id  INT PRIMARY KEY AUTO_INCREMENT,
  density INT,
  color VARCHAR(250),
  grossness VARCHAR(250)
);

INSERT INTO sludge (
  density,
  color,
  grossness
) VALUES (250,'red','very');
