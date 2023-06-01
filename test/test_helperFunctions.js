const { assert } = require("chai");

const {
  generateRandomString,
  hasUser,
  hasURL,
  urlsForUser,
  findIDWithEmail,
} = require("../helpers.js");

const testUsers = {
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

const testUrlDatabase = {
  "2NMk7G": {
    longUrl: "http://www.lighthouselabs.ca",
    userID: "user1RandomID",
  },
  i3tj6N: {
    longUrl: "http://www.google.com",
    userID: "user1RandomID",
  },
  LcToCs: {
    longUrl:
      "http://www.https://github.com/williamkemeny/tinyapp/tree/main.com",
    userID: "user2RandomID",
  },
};

describe("generateRandomString", function () {
  it("should return a string with six characters", function () {
    const randomStringLength = generateRandomString().length;
    const expectedOutput = 6;
    assert.equal(randomStringLength, expectedOutput);
  });
});

describe("hasUser", function () {
  it("should return true if the users id is found", function () {
    const id = hasUser("userRandomID", testUsers);
    assert.equal(id, true);
  });
  it("should return true if the email is found", function () {
    const id = hasUser("user@example.com", testUsers);
    assert.equal(id, true);
  });
  it("should return false if the email is not found", function () {
    const id = hasUser("wk@example.com", testUsers);
    assert.equal(id, false);
  });
});

describe("hasURL", function () {
  it("should return true if the TINY url is found", function () {
    const tinyAppURL = hasURL("LcToCs", testUrlDatabase);
    assert.equal(tinyAppURL, true);
  });
  it("should return false if the TINY url is not found", function () {
    const tinyAppURL = hasURL("AHWY56", testUrlDatabase);
    assert.equal(tinyAppURL, false);
  });
});

describe("findIDWithEmail", function () {
  it("should return the profile id", function () {
    const id = findIDWithEmail("user@example.com", testUsers);
    assert.equal(id, "userRandomID");
  });
});

describe("urlsForUser", function () {
  it("should return the urls that are associated with the account", function () {
    const urls = urlsForUser("user2RandomID", testUrlDatabase);
    const expectedOutput = {
      LcToCs: {
        longUrl:
          "http://www.https://github.com/williamkemeny/tinyapp/tree/main.com",
        userID: "user2RandomID",
      },
    };
    assert.deepEqual(urls, expectedOutput);
  });

  it("should return an empty object if no urls exist for the account", function () {
    const urls = urlsForUser("fakeUser", testUrlDatabase);
    const expectedOutput = {};
    assert.deepEqual(urls, expectedOutput);
  });
});
