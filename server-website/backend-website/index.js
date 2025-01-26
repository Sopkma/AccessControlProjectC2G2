const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");


const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);

const app = express();
app.use(cors());
app.use(express.json());


let connection = mysql.createConnection({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASS,
  database: "sludge"
});


app.use("/", express.static("frontend"));


app.get("/query", function (request, response) {
  // get token from headers
  //send token to user-server for verification
  //if not successgul, send 401
  // if successful
  // ==QUERY TOKEN VALIDATION==

  const token = request.headers['authorization']?.split(' ')[1];
  if (!token) {
    return response.status(401).send("No token provided: /query");
  }

  try {
    fetch("http://" + "server-users:80" + "/validateToken", {
      method: "POST",
      headers: { 'Authorization': `Bearer  ${token}` },
    }).then(resp => {

      if (resp.status !== 200) {
        console.log("Invalid token")
        return response.status(401).send("Token is invalid or expired");
      }

      console.log('Token validated:', resp.body);

      let SQL = "SELECT * FROM sludge;"
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


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

