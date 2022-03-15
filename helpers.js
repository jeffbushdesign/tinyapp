

// Helper function - get user ID from email provided
const getUserByEmail = function (email, usersDatabase) {
  for (const user in usersDatabase) {
    if (email === usersDatabase[user].email) {
      return usersDatabase[user];
    }
  }
  return null;
};

module.exports = { getUserByEmail };

