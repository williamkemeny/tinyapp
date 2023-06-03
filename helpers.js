const generateRandomString = function(stringLen = 6) {
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
};

const hasUser = function(input, user) {
  for (const profile in user) {
    if (user[profile].id === input) {
      return true;
    } else if (user[profile].email === input) {
      return true;
    }
  }
  return false;
};

const hasTinyURL = function(input, data) {
  for (const shortURL in data) {
    if (shortURL === input) {
      return true;
    }
  }
  return false;
};

const hasURL = function(URL, data, ID) {
  for (const shortURL in data) {
    if (data[shortURL].longURL === URL && data[shortURL].userID === ID) {
      return true;
    }
  }
  return false;
};

const getUserByEmail = function(email, user) {
  for (const profile in user) {
    if (user[profile].email === email) {
      return profile;
    }
  }
};

const urlsForUser = function(id, urlDatabase) {
  const userUrls = {};
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
  hasTinyURL,
  urlsForUser,
  getUserByEmail,
  hasURL,
};
