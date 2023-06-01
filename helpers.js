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

module.exports = {
  generateRandomString,
  hasUser,
  hasURL,
  urlsForUser,
  findIDWithEmail,
};
