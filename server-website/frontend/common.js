var parsedUrl = new URL(window.location.href);
let usersUrl = "localhost:8001";

function query() {
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
      document.getElementById("response").innerHTML = data;
    })
    .catch((err) => {
      console.log(err);
    })
}

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

//TWOFACTOR LOGIC
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
          } else {
            console.error("No token received in the response.");
          }
        })
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
