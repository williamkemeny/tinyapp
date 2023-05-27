const express = require("express");
const cookieParser = require("cookie-parser");
const { setTimeout } = require("timers/promises");
const app = express();
const PORT = 8080; // default port 8080

function generateRandomString(stringLen = 6) {
  let randString = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let count = 0;
  while (count < stringLen) {
    randString += characters.charAt(
      Math.floor(Math.random() * charactersLength)
    );
    count += 1;
  }
  return randString;
}

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { templateVars, urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  if (!Object.values(urlDatabase).includes(req.body.longURL)) {
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = req.body.longURL;
    const templateVars = {
      username: req.cookies["username"],
      id: shortURL,
      longURL: req.body.longURL,
    };
    res.render("urls_show", templateVars);
  } else {
    const templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

//update button
app.post("/urls/:id/update", (req, res) => {
  if (urlDatabase[req.params.id]) {
    urlDatabase[req.params.id] = req.body.newURL;
    let templateVars = {
      username: req.cookies["username"],
      id: req.params.id,
      longURL: urlDatabase[req.params.id],
    };
    res.render("urls_show", templateVars);
  } else {
    const templateVars = {
      username: req.cookies["username"],
      id: req.params.id,
      longURL: urlDatabase[req.params.id],
    };
    res.render("urls_show", templateVars);
  }
});

//delete button
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//Link to the website
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//Login
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

//Logout
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  templateVars = { username: "", urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("*", (req, res) => {
  res.send("<html><body><b>404 not found</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
