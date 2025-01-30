# App Structure

The web app has three main parts. The front-end, back-end/API, and the database.

## Front-End

The front-end is what the user interacts with.
Here we can see that the UI consist of a username and password field.

![image](https://github.com/user-attachments/assets/7239b0f9-f840-4e8b-8baa-8c58d6a6daae)
<br>

If we inspect the page, we can see a source file named _common.js_.
This is a JavaScript file which includes the functions that control each aspect of the frontend.

The first of those functions is the `query` function for each of the gunk databases held on the website.

```Javascript
var parsedUrl = new URL(window.location.href);
let usersUrl = "localhost:8001";
 
function query_sludge() {
  // get token from cookie
  const token = getCookie("token");

  if (!token) {
    alert("No token provided: query()");
    return;
  }

  const headers = new Headers();
  headers.append('Authorization', `Bearer ${token}`);

  fetch("http://" + parsedUrl.host + "/query/sludge", {
    method: "GET",
    mode: "cors",
    headers: headers
  })
    .then((resp) => resp.text())
    .then((data) => {
      document.getElementById("sludge").innerHTML = data;
    })
    .catch((err) => {
      console.log(err);
    })
}

function query_shlop() {
  // get token from cookie
  const token = getCookie("token");

  if (!token) {
    alert("No token provided: query()");
    return;
  }

  const headers = new Headers();
  headers.append('Authorization', `Bearer ${token}`);

  fetch("http://" + parsedUrl.host + "/query/shlop", {
    method: "GET",
    mode: "cors",
    headers: headers
  })
    .then((resp) => resp.text())
    .then((data) => {
      document.getElementById("shlop").innerHTML = data;
    })
    .catch((err) => {
      console.log(err);
    })
}

function query_goo() {
  // get token from cookie
  const token = getCookie("token");

  if (!token) {
    alert("No token provided: query()");
    return;
  }

  const headers = new Headers();
  headers.append('Authorization', `Bearer ${token}`);

  fetch("http://" + parsedUrl.host + "/query/goo", {
    method: "GET",
    mode: "cors",
    headers: headers
  })
    .then((resp) => resp.text())
    .then((data) => {
      document.getElementById("goo").innerHTML = data;
    })
    .catch((err) => {
      console.log(err);
    })
}
```

`window.location.href` gets the current URL of the page which is `localhost:80` in this case.
The query function sends a request to our server using the `/query/_____` route and displays the data in the HTML element with the "response" id. The full URL in these cases would be `localhost:80/query/____` where ____ is one of the databases. Each query function takes in a cookie from the browser as a token (through the use of a helper function `getCookie(name)`) that is generated upon completing a TOTP request which is shown later. This token is then used to authorize the user using a later function validateToken, this is for added security of the website.

The HTML for this section of the website is shown below:
```HTML
<!DOCTYPE html>

<html>
    <link rel="shortcut icon" type="image/x-icon" href="favicon.png">
	<script type="text/javascript" src="common.js"></script>
    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
    <head>
        <title>
            Access Control Project
        </title>
    </head>

    <body class="flex flex-row h-screen justify-center gap-4 content-center items-center bg-[url(https://imgs.search.brave.com/_LDzlTA3Oc-RJzIoJM49sfy-c1jbYHTiTZLSBPlsw0Q/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAzLzc1LzMwLzI1/LzI0MF9GXzM3NTMw/MjUyNl9GTUNDcXpY/UmE0bGcyZHNPV28w/RVBRZTI0am9WOTFz/RS5qcGc)] bg-cover bg-center">
        <div class="flex flex-col">
            <textarea class="bg-linear-to-t to-lime-500 from-purple-500" id="sludge" rows="20" cols="45" placeholder="Database Results"></textarea>
            <button class="bg-black text-white" onclick="query_sludge()">Query</button>
		    </div>
        <div class="flex flex-col">
            <textarea class="bg-linear-to-t to-cyan-500 from-orange-500" id="goo" rows="20" cols="45" placeholder="Database Results"></textarea>
            <button class="bg-black text-white" onclick="query_goo()">Query</button>
		    </div>
        <div class="flex flex-col">
            <textarea class="bg-linear-to-t to-yellow-500 from-rose-500" id="shlop" rows="20" cols="45" placeholder="Database Results"></textarea>
            <button class="bg-black text-white" onclick="query_shlop()">Query</button>
		    </div>
    </body>
</html>
```

Similar to the `query` function, the `login` function makes http request as well, but the
difference is the login makes a `POST` request instead of a `GET` request.
This fills the http body of our request with the login data, which is a `JSON` object with the field username and password. Upon a correct login, the users username and password are stored temporarily when transferring to the `2fac.html` page for two factor authorization.

```Javascript
function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  let stringifiedbody = JSON.stringify({
    username: username,
    password: password
  });
  console.log(stringifiedbody);
  fetch("http://" + usersUrl + "/login", {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json", },
    body: stringifiedbody
  })
    .then((resp) => {
      if (resp.status === 500) {
        alert("Server Error");
      } else if (resp.status === 401) {
        console.log("Username or password incorrect");
        alert("Username or password incorrect");

      } else if (resp.status === 415) {
        console.log("Incomplete Request");
        alert("Incomplete Request");
      } else if (resp.status === 200) {

        //Uses session storahe to temporarly store username and password
        localStorage.setItem("username", username);
        localStorage.setItem("password", password);
        location.href = "http://" + parsedUrl.host + "/2fac.html";
      }
    }).catch((err) => {
      console.log(err);
    })
}
```

The HTML of the webpage looks like this

```HTML
<!DOCTYPE html>

<html>
    <link rel="shortcut icon" type="image/x-icon" href="favicon.png">
    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
	  <script type="text/javascript" src="common.js"></script>
    <head>
        <title>
            Access Control Project
        </title>
    </head>

    <body>
        <div class="flex flex-col h-screen justify-center gap-4 content-center items-center bg-[url(https://imgs.search.brave.com/4ZAcmHiAHfIP0ymfoBY-OyCV3mmtqfhxyuLu5GR-5Kc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA2LzgwLzAzLzQ3/LzM2MF9GXzY4MDAz/NDcxOF8zSmo4M05X/ZU9pbmJYU3dKQUYw/enVMcEhQY1FDYUVI/Wi5qcGc)] bg-cover bg-center">
          <div>
            <label class="text-teal-200" for="username">Username:</label>
            <input class="bg-blue-500" id="username" placeholder="username"></input>
          </div>
          <div>
            <label class= "text-teal-200" for="password">Password:</label>
            <input class= "bg-blue-500" id="password" placeholder="password"></input>
          </div>
          <div>
            <button class="bg-black text-white" onclick="login()">login</button>
          </div>
		</div>
    </body>
</html>
```

The HTML that is rendered in the webpage is the login screen which a request to login can be made.

Moving to the function `twoFactor`, it takes in the previously stored username and password and checks to make sure they were stored as they are required for the generation of a TOTP code. It then clears the storage shortly after taking in the username and password as variables. Similar to the `login` function the `twoFactor` also makes a `POST` request. During the request to `/timey` a JWT token is generated upon two factor login and sent to this function, where it is then set into the cookies and the user is moved to the `/query.html` side of the website.

````JavaScript
function twoFactor(token) {
  //fetches temporary username and storage location
  const username = localStorage.getItem("username");
  const password = localStorage.getItem("password");
  sessionStorage.clear();
  if (!username || !password) {
    alert("No cached username or password")
    return
  }

  let stringifiedbody = JSON.stringify({
    totp: document.getElementById("totp").value,
    username: username,
    password: password
  })
  console.log(stringifiedbody);
  fetch("http://" + usersUrl + "/timey", {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json"
    },
    body: stringifiedbody
  })
    .then((resp) => {
      if (resp.status === 500) {
        alert("Server Error");
      } else if (resp.status === 401) {
        console.log("TOTP code incorrect");
        alert("TOTP code incorrect");

      } else if (resp.status === 415) {
        console.log("Incomplete Request");
        alert("Incomplete Request");
      } else {

        // ==Should add token to cookies==
        resp.json().then((data) => {
          if (data.token) {
            document.cookie = `token=${data.token}`;
            console.log('JWT token has been set in the cookies:', data.token);
            location.href = "http://" + parsedUrl.host + "/query.html";
          } else {
            console.error("No token received in the response.");
          }
        })
      }
    })
    .catch((err) => {
      console.log(err);
    })
}
````

A helper function has been created to help with the collecting of the cookie from the headers called `function getCookie(name)`. The function is shown below:

````JavaScript
function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) {
      return value;
    }
  }
  return null;
}
````
Where it'll take in a name, compare that to a key, and then return the associated value of the key, value pair.

## Backend/API

There are two backend servers that are run together to form our website, the `server-website` backend and the `server-users` backend as can be seen in the terminal.

![image](https://github.com/user-attachments/assets/82097be0-7e85-4962-9678-23cc9b498168)
<br>

### Query route

The server's `/query` routes are described in the file `server-website/backend/index.js`.

```Javascript
app.get("/query/sludge", function (request, response) {
  // get token from headers
  // send token to user-server for verification
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
        return response.status(401).send("Token is invalid or expired");
      }

      //using his isync/await instead of .then b/c I hate call-backs
      const token = await resp.json()
      console.log('Token validated:', token);
      if (token.role != "admin") {
        return response.status(401).send("Not allowed");
      }

      let SQL = "SELECT * FROM goo;"
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

app.get("/query/shlop", function (request, response) {
  // get token from headers
  //send token to user-server for verification
  //if not successgul, send 401
  // if successful
  // ==QUERY TOKEN VALIDATION==

  const token = request.headers['authorization']?.split(' ')[1];
  if (!token) {
    return response.status(401).send("No token provided: /query/shlop");
  }

  try {
    fetch("http://" + "server-users:80" + "/validateToken", {
      method: "POST",
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(async resp => {

      if (resp.status !== 200) {
        console.log("Invalid token")
        return response.status(401).send("Token is invalid or expired");
      }

      const token = await resp.json()
      if (token.role != "admin") {
        return response.status(401).send("Not allowed");
      }
      console.log('Token validated:', resp.body);

      let SQL = "SELECT * FROM shlop;"
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
```
There is a lot going on that is above the scope of this document. In simple terms, the token generated during TOTP is collected from the authorization headers, where it is then sent to be validated in the `/validateToken` route on the `server-users:80` route. If the token is not validated an error will throw, otherwise once the token is validated it'll send the response in the console of the token. This then allows the user in and makes a request to the MySQL server and prints the response which is then sent to the web browser. 

This is done for each of the different gunk databases, those being `sludge`, `goo`, and `slop`, with each having their respective sections on the `/query` route. Only certain roles are allowed to access certain data on the query route as added security to the websites data.
The query each runs is `let SQL = "SELECT * FROM _____;"` where _____ is each of the databases, this selects all data about each gunk.

### Login Route

The `/login` route, which resides on the `server-users/backend/index.js` section of the website, attempts to login in a user by parsing the given http request body and comparing the user's credentials to the one logged in the database. A lot of possible errors are assigned appropriate error codes.

```Javascript
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
```

### TOTP Implementation

For added security to our app, a Time based One Time Password (TOTP) system was implemented. This requires logged in users to send a time based password that is generated from the totp command line app `cli.js`, before being able to reach the /query section of the server.
The `/timey` route controls this function which resides on the `server-users/backend/index.js`.

`cli.js`:
```Javascript
const { createHmac } = require('crypto');

const hmac = createHmac('sha256', '2025');

let ms = 1000 * 30;
let timestamp = new Date(Math.round(new Date().getTime() / ms) * ms).toISOString();
console.log("timestamp: " + timestamp);

hmac.update(timestamp.toString());
let numberpattern = /\d+/g;
let result = hmac.digest('hex').match(numberpattern).join('').slice(-6);
console.log(result);
```

`/timey`:
```Javascript
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
```

This security is done by requiring the user to have a matching totp code sent to the textbox in the route, if the code does not match, an error will be called and the user will not be able to proceed. If the code matches, the user will be able to proceed while also generating a JWT token that, spoken of before, is sent to the `twoFactor` function where it is then sent into the cookies, where the query route then sends it to the validate token function to be validated.


![image](https://github.com/user-attachments/assets/e525114a-cb44-4eb3-960d-ddea663b27b5)
<br>

This code alternates every 30 seconds. Once the user submits the correct totp code the server will then let the user through to the `/query` route.

![image](https://github.com/user-attachments/assets/c0fee79f-e63b-48c3-a766-44fe0c37e0d7)
<br>

### Token Validation

The token validation route is used in the query route to validate the logged in users JWT token when they successfully pass in a valid two factor code. This takes in the JWT token from the headers and checks if the token exists, if not it will throw a not provided error. If the token is taken in, it will be verified using the jsonwebtoken function verify() to verify the users token. The route will then verify the user that is logged in exists in the database before appending the users role to the token. Using `bcrypt` this token value is compared with the matching password in the database to verify the user, then on a successful verification it sends a `Token is valid` flag back to query.

```JavaScript
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
```
Below is a sample picture of the token being validated:
![image](https://github.com/user-attachments/assets/f92d1b8c-32f3-4c8c-94ea-d45f251cd2fd)
<br>



## Database


### Users Table
The databases can be best described by looking their code.
The SQL user database schema is described in `sql-users/users.sql`.

```SQL
CREATE DATABASE users;

use users;

CREATE TABLE users (
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    salt     VARCHAR(4)   NOT NULL,
    email    VARCHAR(255) NOT NULL,
    role     ENUM("admin","editor","subscriber")  NOT NULL,
    PRIMARY KEY (username)
);
 
INSERT INTO users
VALUES(
    "user",
    "pass", -- make bcrypt password with the salt and pepper
    "hm84",
    "user@example.com",
     0--role
);

INSERT INTO users
VALUES(
    "user2",
    "pass2", -- make bcrypt password with the salt and pepper
    "hm84",
    "user2@example.com",
     1--role
);
```

The `users` database contains a list of users classified by a username, password, salt, email, and role. We store the salt along with the password for matching the users hash using bcrypt for login security. The user roles consist of `Admin`, `editor`, and `subscriber` where each role has a certain number of priveledges when querying the database, with `Admin` having the most priveledges. Two example users with varying roles are shown in the code above.

### Sludge Table

The other database `sql-website/sludge.sql` holds information on our sludge, goo, and slop values

```SQL
CREATE DATABASE sludge;

use sludge;

CREATE TABLE sludge (
  id  INT PRIMARY KEY AUTO_INCREMENT,
  density INT,
  color VARCHAR(250),
  grossness VARCHAR(250)
);

CREATE TABLE goo (
  id  INT PRIMARY KEY AUTO_INCREMENT,
  density INT,
  ooziness INT,
  color VARCHAR(250),
  grossness VARCHAR(250)
);

CREATE TABLE shlop (
  id  INT PRIMARY KEY AUTO_INCREMENT,
  density INT,
  color VARCHAR(250),
  grossness VARCHAR(250),
  trashiness INT
);
```
These tables each hold varying information for different types of gunk, and the values these tables hold are shown above.

