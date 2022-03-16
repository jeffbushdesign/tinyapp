

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

module.exports = {
  getUserByEmail,
  generateRandomString
};

