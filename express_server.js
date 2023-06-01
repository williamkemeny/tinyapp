const express = require("express");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
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

const hasUser = function (input, user) {
  for (const profile in user) {
    if (user[profile].id === input) {
      return true;
    } else if (user[profile].email === input) {
      return true;
    }
  }
  return false;
};

const hasURL = function (input, data) {
  for (const shortURL in data) {
    if (shortURL === input) {
      return true;
    }
  }
  return false;
};

const findIDWithEmail = function (email, user) {
  for (const profile in user) {
    if (user[profile].email === email) {
      return profile;
    }
  }
};

const urlsForUser = function (id, urlDatabase) {
  userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};

const urlDatabase = {};
const users = {};

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cookieSession({
    name: "session",
    keys: ["Cool"],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

//Homepage
app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id, urlDatabase),
  };
  res.render("urls_index", templateVars);
});

//Page to create new urls
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    urls: urlDatabase,
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  if (hasUser(req.session.user_id, users)) {
    if (!Object.values(urlDatabase).includes(req.body.longURL)) {
      let shortURL = generateRandomString();
      urlDatabase[shortURL] = {
        longURL: req.body.longURL,
        userID: req.session.user_id,
      };
      const templateVars = {
        user: users[req.session.user_id],
        id: shortURL,
        longURL: req.body.longURL,
      };
      res.render("urls_show", templateVars);
    } else {
      const templateVars = { urls: urlDatabase };
      res.render("urls_index", templateVars);
    }
  } else {
    res
      .status(400)
      .send("Only registered and logged in users can create new urls");
  }
});

//Details about URL (Can delete on this page)
app.get("/urls/:id", (req, res) => {
  if (!hasURL(req.params.id, urlDatabase)) {
    res.status(400).send("Not a valid Tiny URL");
  }
  const templateVars = {
    user: users[req.session.user_id],
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
  };
  res.render("urls_show", templateVars);
});

//update button
app.post("/urls/:id/update", (req, res) => {
  if (hasUser(req.session.user_id, users)) {
    //if you arent logged in you can't change the url
    urlDatabase[req.params.id] = {
      longURL: req.body.newURL,
      userID: req.session.user_id,
    };
    const templateVars = {
      user: users[req.session.user_id],
      id: req.params.id,
      longURL: urlDatabase[req.params.id].longURL,
    };
    res.render("urls_show", templateVars);
  } else {
    //can still see the page just can't edit
    const templateVars = {
      user: users[req.session.user_id],
      id: req.params.id,
      longURL: urlDatabase[req.params.id].longURL,
    };
    res.render("urls_show", templateVars);
  }
});

//delete button will remove the id from urlsDatabase
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  const templateVars = {
    user: users[req.session.user_id],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

//Link to the website
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

//Registration Page
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    urls: urlDatabase,
  };
  res.render("urls_registration", templateVars);
});

//Create user
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password);
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
    req.session.user_id = id;
    res.redirect("/urls");
  }
});

//Login Page
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    urls: urlDatabase,
  };
  res.render("urls_login", templateVars);
});

//Login
app.post("/login", (req, res) => {
  if (hasUser(req.body.email, users)) {
    //if you try logging in with the right email
    const id = findIDWithEmail(req.body.email, users);
    if (bcrypt.compareSync(req.body.password, users[id].password)) {
      //if you login with the right password
      req.session.user_id = id;
      res.redirect("/urls");
    } else {
      res.status(403).send("The password does not match.");
    }
  } else {
    res.status(403).send("The email could not be found");
  }
});

//Logout
app.post("/logout", (req, res) => {
  req.session = null;
  templateVars = { user: "", urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//if anything other than the gets defined it will return 404
app.get("*", (req, res) => {
  res.status(404).send("<html><body><b>404 not found</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
