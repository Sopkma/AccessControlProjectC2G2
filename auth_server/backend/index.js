const express = require("express");
const mysql = require("mysql2");
const fetch = require('node-fetch');


const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
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
  if(!token) {
    return response.status(401).send("No token provided: /query");
  }

  try{
    const validation = fetch("http://" + parsedUrl.host + "/validateToken", {
      method: "POST",
      headers: { 'Authorization': 'Bearer  ${token}' },
    });

    if(validation.status !== 200) {
      return response.status(401).send("Token is invalid or expired");
    }

    const validationData = validation.json();
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
} catch(err){
  console.error('Error validating token:', err.message);
  response.status(401).send("Token is invalid or expired");
}
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

