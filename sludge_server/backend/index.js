const express = require("express");
const mysql = require("mysql2");


const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);

let connection = mysql.createConnection({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASS,
  database: "sludge",
});
const app = express();


app.use(express.json());


app.get("/", (request, response) => {
  response.status(200).send("Working and healthy")
});


app.get("/query", function (request, response) {
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
})

app.listen(PORT, HOST)
console.log(`Running on http://${HOST}:${PORT}`)
