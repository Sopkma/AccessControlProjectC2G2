const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");


const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);

let BOSS = 100;
let HERO = 100;


const app = express();
app.use(cors());
app.use(express.json());


let connection = mysql.createConnection({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASS,
  database: "sludge"
});

async function log(datatype, username, issuccess) {
  const log = {
    ts: new Date(),
    username,
    datatype,
    status: issuccess
  };

  console.log("Logging request")
  return resp = await fetch("http://" + "server-users:80" + "/log", {
    method: "POST",
    headers: { 'Content-Type': `application/json` },
    body: JSON.stringify(log)
  })
}

app.use("/", express.static("frontend"));


app.get("/query/sludge", function (request, response) {
  // get token from headers
  //send token to user-server for verification
  //if not successgul, send 401
  // if successful
  // ==QUERY TOKEN VALIDATION==

  const token = request.headers['authorization']?.split(' ')[1];
  if (!token) {
    return response.status(401).send("No token provided: /query/sludge");
  }

  try {
    fetch("http://" + "server-users:80" + "/validateToken", {
      method: "POST",
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(resp => {

      if (resp.status !== 200) {
        console.log("Invalid token")
        log("sludge", "unknown", 2)
        return response.status(401).send("Token is invalid or expired");
      }

      console.log('Token validated:', resp.body);

      if (request.get("Sludge") == "EVIL") {
        let hero_chance = Math.random();
        let boss_chance = Math.random();
        let hero_dmg = 0;
        let boss_dmg = 0;
        if (hero_chance <= .7) {
          hero_dmg = Math.random() * (8 - 2) + 2;
          BOSS -= hero_dmg
        }
        if (boss_chance <= .5) {
          boss_dmg = Math.random() * (20 - 7) + 7;
          HERO -= boss_dmg
        }
        if (HERO <= 0) {
          HERO = 100
          BOSS = 100
          return response.status(400).send(`You Lose, the sludge still lurks in the server`);
        }
        if (BOSS <= 0) {
          HERO = 100
          BOSS = 100
          return response.status(200).send(`You win, The sludge will be back`);
        }
        return response.status(200).send(`Attack did ${hero_dmg} dmg.\n Sludge did ${boss_dmg}, and has ${BOSS} health left \n You have ${HERO} health`);
      }


      let SQL = "SELECT * FROM sludge;"
      connection.query(SQL, [true], (error, results, fields) => {
        if (error) {
          console.error(error.message);
          log("sludge", token.username, 2)
          return response.status(500).send("database error");
        } else {
          log("sludge", token.username, 1)
          console.log(results);
          return response.send(results);
        }
      });


    });
  } catch (err) {
    log("sludge", "unknown", 2)
    console.error('Error validating token:', err.message);
    return response.status(401).send("Token is invalid or expired");
  };
});

app.get("/query/goo", async function (request, response) {
  // get token from headers
  //send token to user-server for verification
  //if not successgul, send 401
  // if successful
  // ==QUERY TOKEN VALIDATION==

  const token = request.headers['authorization']?.split(' ')[1];
  if (!token) {
    return response.status(401).send("No token provided: /query/goo");
  }

  try {
    fetch("http://" + "server-users:80" + "/validateToken", {
      method: "POST",
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(async resp => {

      if (resp.status !== 200) {
        console.log("Invalid token")
        log("goo", "uknown", 2)
        return response.status(401).send("Token is invalid or expired");
      }

      //using his isync/await instead of .then b/c I hate call-backs
      const token = await resp.json()
      console.log('Token validated:', token);
      if (token.role != "admin") {
        log("goo", token.username, 2)
        return response.status(401).send("Not allowed");
      }

      if (request.get("Sludge") == "EVIL") {
        let hero_chance = Math.random();
        let boss_chance = Math.random();
        let hero_heal = 0;
        let boss_dmg = 0;
        if (hero_chance <= .4) {
          hero_heal = Math.random() * (20 - 8) + 8;
          HERO += hero_heal
        }
        if (boss_chance <= .7) {
          boss_dmg = Math.random() * (20 - 7) + 7;
          HERO -= boss_dmg
        }
        if (HERO <= 0) {
          HERO = 100
          BOSS = 100
          return response.status(400).send(`You Lose, the sludge still lurks in the server`);
        }
        if (BOSS <= 0) {
          HERO = 100
          BOSS = 100
          return response.status(200).send(`You win, The sludge will be back`);
        }
        return response.status(200).send(`You heal for  ${hero_heal} dmg.\n Sludge did ${boss_dmg}, and has ${BOSS} health left \n You have ${HERO} health`);
      }

      let SQL = "SELECT * FROM goo;"
      connection.query(SQL, [true], (error, results, fields) => {
        if (error) {
          console.error(error.message);
          log("goo", token.username, 2)
          return response.status(500).send("database error");
        } else {
          console.log(results);
          log("goo", token.username, 1)
          return response.send(results);
        }
      });
    });
  } catch (err) {
    console.error('Error validating token:', err.message);
    log("goo", "uknown", 2)
    return response.status(401).send("Token is invalid or expired");
  };
});

app.get("/query/shlop", function (request, response) {
  // get token from headers
  //send token to user-server for verification
  //if not successgul, send 401
  // if successful
  // ==QUERY TOKEN VALIDATION==

  const token = request.headers['authorization']?.split(' ')[1];
  if (!token) {
    log("shlop", "unknown", 2)
    return response.status(401).send("No token provided: /query/shlop");
  }

  try {
    fetch("http://" + "server-users:80" + "/validateToken", {
      method: "POST",
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(async resp => {

      if (resp.status !== 200) {
        console.log("Invalid token")
        log("shlop", "unknown", 2)
        return response.status(401).send("Token is invalid or expired");
      }

      const token = await resp.json()
      if (token.role != "admin") {
        log("shlop", token.username, 2)
        return response.status(401).send("Not allowed");
      }
      console.log('Token validated:', resp.body);

      if (request.get("Sludge") == "EVIL") {
        let hero_chance = Math.random();
        let boss_chance = Math.random();
        let hero_dmg = 0;
        let boss_dmg = 0;
        if (hero_chance <= .3) {
          hero_dmg = Math.random() * (60 - 20) + 20;
          BOSS -= hero_dmg
        }
        if (boss_chance <= .7) {
          boss_dmg = Math.random() * (20 - 7) + 7;
          HERO -= boss_dmg
        }
        if (HERO <= 0) {
          HERO = 100
          BOSS = 100
          return response.status(400).send(`You Lose, the sludge still lurks in the server`);
        }
        if (BOSS <= 0) {
          HERO = 100
          BOSS = 100
          return response.status(200).send(`You win, The sludge will be back`);
        }
        return response.status(200).send(`Attack did ${hero_dmg} dmg.\n Sludge did ${boss_dmg}, and has ${BOSS} health left \n You have ${HERO} health`);
      }

      let SQL = "SELECT * FROM shlop;"
      connection.query(SQL, [true], (error, results, fields) => {
        if (error) {
          console.error(error.message);
          log("shlop", token.username, 2)
          response.status(500).send("database error");
        } else {
          console.log(results);
          log("shlop", token.username, 1)
          response.send(results);
        }
      });
    });
  } catch (err) {
    console.error('Error validating token:', err.message);
    log("shlop", "unknown", 2)
    response.status(401).send("Token is invalid or expired");
  };
});

app.get("/query/logs", function (request, response) {

  const token = request.headers['authorization']?.split(' ')[1];
  if (!token) {
    log("logs", "unknown", 2)
    return response.status(401).send("No token provided: /query/logs");
  }

  try {
    fetch("http://" + "server-users:80" + "/validateToken", {
      method: "POST",
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(async resp => {

      if (resp.status !== 200) {
        console.log("Invalid token")
        log("logs", "unknown", 2)
        return response.status(401).send("Token is invalid or expired");
      }

      const token = await resp.json()
      if (token.role != "admin") {
        log("log", token.username, 2)
        return response.status(401).send("Not allowed");
      }
      log("logs", token.username, 1)
      const respo = await fetch("http://" + "server-users:80" + "/logs", { method: "GET" });
      const logs = await respo.json();
      response.status(200).send(logs)
    })
  } catch (err) {
    console.error('Error validating token:', err.message);
    log("shlop", "unknown", 2)
    response.status(401).send("Token is invalid or expired");
  };
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

