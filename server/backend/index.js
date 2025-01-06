const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");


const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);
const PEPPER = String(process.env.PEPPER);
const TOTP = String(process.env.TOTP);
const SQL = "SELECT * FROM users;"

const app = express();
app.use(express.json());


let connection = mysql.createConnection({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASS,
  database: "users"
});


app.use("/", express.static("frontend"));


app.get("/query", function (request, response) {
  let SQL = "SELECT * FROM users;"
  connection.query(SQL, [true], (error, results, fields) => {
    if (error) {
      console.error(error.message);
      response.status(500).send("database error");
    } else {
      console.log(results);
      response.send(results);
    }
  });
})

app.post("/login", function (request, response) {
  let parsedBody = request.body;
  console.log(parsedBody);
  if (!parsedBody.hasOwnProperty('username')) {
    console.log("Incomplete request");
    response.status(415).send("Incomplete Request");
    return;
  }
  let SQL = "SELECT * FROM users WHERE username=?;";
  connection.query(SQL, parsedBody["username"], (error, results, fields) => {
    if (error) {
      console.error("Databasae Error:\n", error.message);
      response.status(500).send("Server Error");
    } else {
      if (results.length === 0) {
        console.log("User not found");
        response.status(401).send("Unauthorized");
      } else {
        let combinedPass = results[0]["salt"] + parsedBody["password"] + PEPPER;
        bcrypt.compare(combinedPass, results[0]["password"], function (err, result) {
          if (err) {
            console.log("Password mismatch");
            response.status(401).send("Unauthorized");
          } else {
            console.log(parsedBody["username"] + " logged in");
            response.status(200).send("Success");
          }
        });
      }
    }
  });
})

app.get("/timey", function (request, response) {
  let timestamp = Math.round(Date.now() / (1000 * 60));
  let tobehashed = TOTP + timestamp;
  console.log(tobehashed);
  bcrypt.hash(tobehashed, 10, function (err, result) {
    if (err) {
      console.log("You did bad");

    } else {
      response.status(200).send(result);
    }
  });
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

