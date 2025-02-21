# Covert Channel

### Login Route

The idea for our covert channel is to be a hidden text-based ARG boss fight with the keeper of our sludgey data, the evil sludge beast. It is implemented through the use of a 
hidden request header that is needed to access the covert channel. Shown below:

```JavaScript
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
            if (request.get("Sludge") == "EVIL") {
              console.log(parsedBody["username"] + " logged in");
              return response.status(200).send("🔦Login Successful, now get your token using totp and defeat the sludge overlord.\n Your going to need to save the token to guide you on your path foward🔦");

            }
            console.log(parsedBody["username"] + " logged in");
            response.status(200).send("Login Successful");
          }
        });
      }
    }
  });
})
```

You can see that when the request.get("Sludge") in the login route is equal to "EVIL", you begin your way into the covert channel. This is reached by performing the following
command when the server is running: 

```shell
curl -X POST localhost:8001/login -H "Sludge:EVIL" -H "Content-Type:application/json" -d '{ "username" : "user", "password": "pass" }'
```
with the specified header for the login route to be "Sludge:EVIL".

The message says: 🔦Login Successful, now get your token using totp and defeat the sludge overlord.\n Your going to need to save the token to guide you on your path foward🔦
in which the user runs the following command to acquire a token using the totp code system:

```shell
TOTP=$(node run ./totp_cli/cli.js)
```

This will store the token, and like the message says, guide you on your path forward.

### TOTP Route

Heading into the totp route, below is the route with the modification of the covert channel:

```JavaScript
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
    if (request.get("Sludge") == "EVIL") {
      response.status(200).send(`⚔️⚔️⚔️⚔️⚔️⚔️You now have your token/lantern. Query your attacks and slay the sludge beast hidden in the machine⚔️⚔️⚔️. \nAuthorization: Bearer ${token}`);
      return;
    }
    response.status(200).json({ token: token });
    return;
  } else {
    response.status(401).send("Code Comparison Failed");
    return;
  }
});
```

We can see once more that when the header from the request.get("Sludge") == EVIL, it will proceed through the covert channel into the next step of slaying the sludge beast within
the depths of our database.

The next command to be ran by the user is as follows: 

```shell
curl -X POST localhost:8001/timey -H "Sludge:EVIL" -H "Content-Type:application/json" -d '{ "totp" : "559533", "username":"user", "password" : "pass" }' >token.txt
```

again with the header marker set to "Sludge:EVIL", as well as the totp code when making the request being set to the totp code that was acquired from the previous call.

This will bring the user to the ARG boss fight with the sludge beast. To deal damage to the sludge beast, you must use the various query calls of shlop and sludge.
Only the admin account may use shlop, the hightest damage dealing attack, and goo, the ability to heal. An example command is shown below:

```shell
curl localhost:80/query/shlop -H "Sludge:EVIL" -H @token.txt
```

The way the damage and healing was implemented is all shown below, in the order of sludge, goo, then shlop: 

```JavaScript
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
```

An example implementation within a query is shown below:

```JavaScript
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
```

Once either defeating the sludge beast, or meeting your demise, it marks the end of the covert channel. With the ability to take on the boss again by simply
calling another query.
