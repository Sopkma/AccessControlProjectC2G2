const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const { createHmac } = require('crypto');


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


//app.get("/timey", function (request, response) {
//  let timestamp = Math.round(Date.now() / (1000 * 60));
//  let tobehashed = TOTP + timestamp;
//  let hash = createHash('sha256').update(tobehashed).digest('hex').replace(/\D/g, '').slice(null, 6);
//  response.status(200).send(hash);
// return
//});

app.post("/timey", function (request, response) {
  let parsedBody = request.body;
  console.log(parsedBody);
  if (!parsedBody.hasOwnProperty('totp')) {
    console.log("Error: No secret provided");
    response.status(415).send("Incomplete Request");
    return;
  }

  const hmac = createHmac('sha256', '2025');

  let ms = 1000 * 30;
  let timestamp = new Date(Math.round(new Date().getTime() / ms) * ms).toISOString();
  console.log("timestamp: " + timestamp);

  hmac.update(timestamp.toString());
  let numberpattern = /\d+/g;
  let result = hmac.digest('hex').match(numberpattern).join('').slice(-6);
  
  console.log("Generated code: ", result);

  //let timestamp = Math.round(Date.now() / (1000 * 60));
  //let tobehashed = TOTP + timestamp;
  //let hash = createHash('sha256').update(tobehashed).digest('hex').replace(/\D/g, '').slice(null, 6);

  console.log(result);
  if (parsedBody['totp'] === result) {
    console.log("Valid Secret");
    response.status(200).send("Code Verification Success");
    return;
  } else {
    response.status(401).send("Code Comparison Failed");
    return;
  }
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

