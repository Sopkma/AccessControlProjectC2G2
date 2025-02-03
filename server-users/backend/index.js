const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { createHmac } = require('crypto');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid')

const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);
const PEPPER = String(process.env.PEPPER);
const TOTP = String(process.env.TOTP);
const JWT_SECRET = String(process.env.JWTSECRET);

const app = express();
app.use(express.json());
app.use(cors());

let connection = mysql.createConnection({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASS,
  database: "users",
});


app.get("/", (request, response) => {
  response.status(200).send("Working and healthy")
});

app.post("/login", function (request, response) {
  let parsedBody = request.body;
  console.log(parsedBody);
  if (!parsedBody.hasOwnProperty("username")) {
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
            response.status(200).send("Login Successful");
          }
        });
      }
    }
  });
})

app.post("/timey", async function (request, response) {
  let parsedBody = request.body;
  console.log(parsedBody);
  if (!parsedBody.hasOwnProperty('totp')) {
    console.log("Error: No secret provided");
    response.status(415).send("Incomplete Request");
    return;
  }

  const hmac = createHmac('sha256', TOTP);

  let ms = 1000 * 30;
  let timestamp = new Date(Math.round(new Date().getTime() / ms) * ms).toISOString();
  console.log("timestamp: " + timestamp);

  hmac.update(timestamp.toString());
  let numberpattern = /\d+/g;
  let result = hmac.digest('hex').match(numberpattern).join('').slice(-6);

  //console.log("Generated code: ", result);
  console.log(result);
  if (parsedBody['totp'] == result) {
    console.log("Valid Secret");
    if (!parsedBody["username"] || !parsedBody["password"]) {
      return response.status(401).send("No username or password");
    }
    // ==Generate JWT==
    let token = jwt.sign({ username: parsedBody["username"], password: parsedBody["password"] }, JWT_SECRET, { expiresIn: '1 h' });
    if (!token) {
      return response.status(500).send("JWT_SECRET is not defined");
    }
    response.status(200).json({ token: token });
    return;
  } else {
    response.status(401).send("Code Comparison Failed");
    return;
  }
});

// ==Validate JWT token==
app.post("/validateToken", function (request, response) {
  const token = request.headers['authorization']?.split(' ')[1];
  console.log(token)

  if (!token) {
    return response.status(401).send("No token provided: Validate JWT token");
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return response.status(401).send("Token is invalid");
    } else {
      //verify user, then append role to token output
      let SQL = "SELECT * FROM users WHERE username=?;";
      connection.query(SQL, decoded["username"], (error, results, fields) => {
        if (error) {
          console.error("Databasae Error:\n", error.message);
          response.status(500).send("Server Error");
        } else {
          if (results.length === 0) {
            console.log("User not found");
            response.status(401).send("Unauthorized");
          } else {
            let combinedPass = results[0]["salt"] + decoded["password"] + PEPPER;
            bcrypt.compare(combinedPass, results[0]["password"], function (err, _) {
              if (err) {
                console.log("Password mismatch");
                response.status(401).send("Unauthorized");
              } else {
                console.log(results)
                decoded.role = results[0].role
                console.log("Token is valid", decoded);
                response.status(200).json(decoded);
              }
            });
          }
        }
      });
    }
  });
});

app.post("/log", async (req, resp) => {
  const log = req.body;
  if (!log.username || !log.ts || !log.datatype || !log.status) {
    resp.status(400).send("Bad Request");
    return;
  }

  let SQL = "INSERT INTO logs VALUES (?,?,?,?,?);";
  const [error, results] = await connection.query(SQL, [uuidv4(), log.ts, log.username, log.datatype, log.status])
  if (error) {
    console.log("Error", error);
    resp.status(500).send("Server Error");
    return;
  }
  console.log("Success", results);
  resp.status(200).send("Successfully logged");
  return;
})


app.get("/logs", async (req, resp) => {
  let SQL = "SELECT * FROM logs;";
  const [error, results] = await connection.query(SQL, null)
  if (error) {
    console.log("Error", error);
    resp.status(500).send("Server Error");
    return;
  }
  console.log("Success, grabbed all users");
  resp.status(200).json(results);
  return;
})

app.listen(PORT, HOST)
console.log(`Running on http://${HOST}:${PORT}`)
