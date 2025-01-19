var parsedUrl = new URL(window.location.href);

function query() {
  const token = getCookie("token");

  if (!token) {
    alert("No token provided: query()");
    return;
  }

  const headers = new Headers();
  headers.append('Authorization', 'Bearer ${token}');

  fetch("http://" + parsedUrl.host + "/query", {
    method: "GET",
    mode: "no-cors",
  })
    .then((resp) => resp.text())
    .then((data) => {
      document.getElementById("response").innerHTML = data;
    })
    .catch((err) => {
      console.log(err);
    })
}

function login() {
  let stringifiedbody = JSON.stringify({
    username: document.getElementById("username").value,
    password: document.getElementById("password").value
  })
  console.log(stringifiedbody);
  fetch("http://" + parsedUrl.host + "/login", {
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
        console.log("Username or password incorrect");
        alert("Username or password incorrect");

      } else if (resp.status === 415) {
        console.log("Incomplete Request");
        alert("Incomplete Request");
      } else {
        // ==Should add token to cookies==
        resp.json().then((data) => {
          if (data.token) {
            document.cookie = `token=${data.token}`;
            console.log('JWT token has been set in the cookies:', data.token);
          } else {
            console.error("No token received in the response.");
          }
        });
        location.href = "http://" + parsedUrl.host + "/2fac.html";
      }
    }).catch((err) => {
      console.log(err);
    })
}

//TWOFACTOR LOGIC
function twoFactor() {
  let stringifiedbody = JSON.stringify({
    totp: document.getElementById("totp").value,
  })
  console.log(stringifiedbody);
  fetch("http://" + parsedUrl.host + "/timey", {
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
        location.href = "http://" + parsedUrl.host + "/query.html";
      }
    })
    .catch((err) => {
      console.log(err);
    })
}

// ==GET COOKIE LOGIC==
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
