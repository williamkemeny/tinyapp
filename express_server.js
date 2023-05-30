const express = require("express");
const cookieParser = require("cookie-parser");
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

const hasUser = function (email, user) {
  for (const profile in user) {
    if (user[profile].email === email) {
      return true;
    }
  }
  return false;
};

const findID = function (email, user) {
  for (const profile in user) {
    if (user[profile].email === email) {
      return profile;
    }
  }
};

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Homepage
app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

//Page to create new urls
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase,
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  if (!Object.values(urlDatabase).includes(req.body.longURL)) {
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = req.body.longURL;
    const templateVars = {
      user: users[req.cookies["user_id"]],
      id: shortURL,
      longURL: req.body.longURL,
    };
    res.render("urls_show", templateVars);
  } else {
    const templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
  }
});

//Details about URL (Can delete on this page)
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
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
      user: users[req.cookies["user_id"]],
      id: req.params.id,
      longURL: urlDatabase[req.params.id],
    };
    res.render("urls_show", templateVars);
  } else {
    const templateVars = {
      user: users[req.cookies["user_id"]],
      id: req.params.id,
      longURL: urlDatabase[req.params.id],
    };
    res.render("urls_show", templateVars);
  }
});

//delete button
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

//Link to the website
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//Registration Page
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase,
  };
  res.render("urls_registration", templateVars);
});

//Create user
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).send("Please include both a valid email and password");
  } else if (hasUser(email, users)) {
    res.status(400).send("An account already exists for this account address");
  } else {
    const id = generateRandomString();
    users[id] = {
      id,
      email,
      password,
    };
    res.cookie("user_id", id);
    res.redirect("/urls");
  }
});

//Login Page
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase,
  };
  res.render("urls_login", templateVars);
});

//Login
app.post("/login", (req, res) => {
  if (hasUser(req.body.email, users)) {
    res.cookie("user_id", findID(req.body.email, users));
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: users[req.cookies["user_id"]],
      urls: urlDatabase,
    };
    res.render("urls_login", templateVars);
  }
});

//Logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  templateVars = { user: "", urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("*", (req, res) => {
  res.send("<html><body><b>404 not found</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
