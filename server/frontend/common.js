var parsedUrl = new URL(window.location.href);

function query() {
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
        location.href = "http://" + parsedUrl.host + "/2fac.html";
      }
    })
    .catch((err) => {
      console.log(err);
    })
}

//PLACEHOLDER FOR TWOFACTOR LOGIC
function twoFactor() {
  let stringifiedbody = JSON.stringify({
    username: document.getElementById("username").value,
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
        console.log("Username or password incorrect");
        alert("Username or password incorrect");

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
