const express = require("express");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080

const {
  generateRandomString,
  hasUser,
  hasTinyURL,
  urlsForUser,
  getUserByEmail,
  hasURL,
} = require("./helpers");

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
  if (req.session.user_id !== undefined) {
    const templateVars = {
      user: users[req.session.user_id],
      urls: urlDatabase,
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.post("/urls", (req, res) => {
  if (hasUser(req.session.user_id, users)) {
    if (!hasURL(req.body.longURL, urlDatabase, req.session.user_id)) {
      //checks if the URL has been made for that user
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
      res.status(400).send("This URL has already been made for this user");
    }
  } else {
    res
      .status(400)
      .send("Only registered and logged in users can create new urls");
  }
});

//Details about URL (Can delete on this page)
app.get("/urls/:id", (req, res) => {
  if (!hasTinyURL(req.params.id, urlDatabase)) {
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
    if (!hasURL(req.body.newURL, urlDatabase, req.session.user_id)) {
      // can't make duplicate tiny URLS
      urlDatabase[req.params.id] = {
        longURL: req.body.newURL,
        userID: req.session.user_id,
      };
    }
  }
  //can still see the page just can't edit
  res.redirect("/urls");
});

//delete button will remove the id from urlsDatabase
app.post("/urls/:id/delete", (req, res) => {
  if (req.session.user_id !== undefined) {
    if (
      hasURL(
        urlDatabase[req.params.id].longURL,
        urlDatabase,
        req.session.user_id
      )
    ) {
      delete urlDatabase[req.params.id];
    }
    const templateVars = {
      user: users[req.session.user_id],
      urls: urlDatabase,
    };
    res.render("urls_index", templateVars);
  } else {
    res.status(400).send("Must be logged in to delete.");
  }
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
    const id = getUserByEmail(req.body.email, users);
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

  res.redirect("/login");
});

app.get("/", (req, res) => {
  if (req.session.user_id !== undefined) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//if anything other than the gets defined it will return 404
app.get("*", (req, res) => {
  res.status(404).send("<html><body><b>404 not found</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
