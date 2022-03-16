// --------------------------------- 
// REQUIRED CONSTANTS
// --------------------------------- 
const {
  urlDatabase,
  users,
} = require('./const');

// Helper function - get user ID from email provided
const getUserByEmail = function (email, usersDatabase) {
  for (const user in usersDatabase) {
    if (email === usersDatabase[user].email) {
      return usersDatabase[user];
    }
  }
  return undefined;
};

const generateRandomString = function () {
  let result = '';
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 6;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const getCurrentUser = function (userID, usersDatabase) {
  if (!usersDatabase[userID]) return null;
  return usersDatabase[userID];
};

const checkEmailAlreadyRegistered = function (email) {
  for (let item in users) {
    if (email === users[item].email) {
      return true;
    }
  }
  return false;
};

const getPasswordFromEmail = function (email) {
  for (let item in users) {
    if (email === users[item].email) {
      return users[item].password;
    }
  }
  return false;
};

// Helper function for checking if email address has already been registered.
const checkLoggedInFromUserId = function (userId) {
  for (let item in users) {
    if (userId === users[item].id) {
      return true;
    }
  }
  return false;
};

// Helper Function to filter urls database to just show user's urls
const userURLS = function (user_id) {
  // object to hold filtered url list
  const filteredURLS = {};
  // loop through objects in urlDatabase -- this is the entire url database
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === user_id) {
      // add urls
      filteredURLS[shortURL] = urlDatabase[shortURL];
    }
  }
  return filteredURLS;
};

module.exports = {
  getUserByEmail,
  generateRandomString,
  getCurrentUser,
  checkEmailAlreadyRegistered,
  getPasswordFromEmail,
  checkLoggedInFromUserId,
  userURLS
};

