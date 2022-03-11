
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// Helper function to get user ID from email provided
const getUserIdFromEmail = function (email) {
  for (let item in users) {
    if (email === users[item].email) {
      // return users[item].id;
      console.log(users[item].id);
    }
  }
  return false;
};

getUserIdFromEmail('user@example.com');
