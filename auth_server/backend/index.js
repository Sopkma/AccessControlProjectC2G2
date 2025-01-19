const express = require("express");
const mysql = require("mysql2");


const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const SLUDGE = String(process.env.SLUDGE) + ":81";
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);

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
  console.log('Request Headers:', request.headers);

  // ==QUERY TOKEN VALIDATION==

  const token = request.headers['authorization']?.split(' ')[1];
  if (!token) {
    return response.status(401).send("No token provided: /query");
  }

  try {
    fetch("http://" + SLUDGE + "/validateToken", {
      method: "POST",
      headers: { 'Authorization': `Bearer  ${token}` },
    }).then(resp => {

      if (resp.status !== 200) {
        return response.status(401).send("Token is invalid or expired");
      }

      const validationData = resp.json();
      console.log('Token validated:', validationData);

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
    });
  } catch (err) {
    console.error('Error validating token:', err.message);
    response.status(401).send("Token is invalid or expired");
  };
});

app.post("/timey", function (request, response) {
  let parsedBody = request.body;

  try {
    fetch("http://" + SLUDGE + "/timey", {
      method: "POST",
      headers: { 'Content-Type': `application/json` },
      body: JSON.stringify(parsedBody)
    }).then(resp => {

      if (resp.status !== 200) {
        return response.status(401).send("Invalid tfac");
      }
      console.log('Accepted 2fac attempt');

      let SQL = "SELECT * FROM users;"
      connection.query(SQL, [true], (error, results, fields) => {
        if (error) {
          console.error(error.message);
          response.status(500).send("database error");
        } else {
          console.log(results);
          response.send(results);
        }
      })
    });
  } catch (err) {
    console.error('Error validating token:', err.message);
    response.status(401).send("Token is invalid or expired");
  }
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

