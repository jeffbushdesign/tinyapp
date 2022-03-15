const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const { func } = require("joi");
const bcrypt = require('bcryptjs');

const PORT = 8080; // default port 8080

const app = express();

app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ['JEFF'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

function generateRandomString() {
  let result = '';
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 6;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Old urlDatabase
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

// New urlDatabase
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};


// Helper function for getting ID
const getCurrentUser = function (userID, usersDatabase) {
  if (!usersDatabase[userID]) return null;
  return usersDatabase[userID];
};



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
// console.log(users.user2RandomID.email);

// Helper function for checking if email address has already been registered.
const checkEmailAlreadyRegistered = function (email) {
  for (let item in users) {
    if (email === users[item].email) {
      return true;
    }
  }
  return false;
};



app.post("/register", (req, res) => {


  // add a new user object to the global users object. 
  // generate a random user id

  // if the email or password are empty strings, send back a response with the 400 status code
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("Email and Password field cannot be left blank. Please try again.");
  }

  // If someone tries to register with an email that is already in the users object, send back a response with the 400 status code. Checking for an email in the users object is something we'll need to do in other routes as well. Consider creating an email lookup helper function to keep your code DRY
  if (checkEmailAlreadyRegistered(req.body.email)) {
    return res.status(400).send('Error. Email address has already been registered.');

  }

  // ----------

  // console.log(req.body.email);
  // console.log(req.body.password);
  const id = generateRandomString();
  // The user object should include the user's id, email and password
  // make a new object for the new user
  users[id] = {};
  // console.log(users.userRandomID);ç
  users[id].id = id;
  users[id].email = req.body.email;
  users[id].password = bcrypt.hashSync(req.body.password, 10);


  // After adding the user, set a user_id cookie containing the user's newly generated ID
  // res.cookie('user_id', id);

  // Test that the users object is properly being appended to. 
  // You can insert a console.log or debugger prior to the redirect logic to inspect what data the object contains.
  // console.log('Newly registered user: ', users[id]);
  console.log('User database:', users);



  // go home after registering
  res.redirect('/login');
});

// NEW LOGIN HANDLER
app.post("/login", (req, res) => {
  // if the email or password are empty strings, send back a response with the 400 status code
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("Email and Password field cannot be left blank. Please try again.");
  }

  // If a user with that e-mail cannot be found, return a response with a 403 status code.
  if (!checkEmailAlreadyRegistered(req.body.email)) {
    return res.status(403).send('Error. Email address not found.');
  }

  // Helper function to get user ID from email provided
  const getUserIdFromEmail = function (email) {
    for (let item in users) {
      if (email === users[item].email) {
        return users[item].id;
      }
    }
    return false;
  };

  // Helper function to get user password from email provided
  const getPasswordFromEmail = function (email) {
    for (let item in users) {
      if (email === users[item].email) {
        return users[item].password;
      }
    }
    return false;
  };

  // If both checks pass, set the user_id cookie with the matching user's random ID, then redirect to /urls.
  const userId = getUserIdFromEmail(req.body.email);
  req.session.user_id = userId;

  // If a user with that e-mail address is located, compare the password given in the form with the existing user's password. If it does not match, return a response with a 403 status code.
  const userPassword = getPasswordFromEmail(req.body.email);



  if (!userId || !bcrypt.compareSync(req.body.password, users[userId].password)) {
    return res.status(403).send('Error. Incorrect Password.');
  }


  // if (req.body.password !== userPassword) {
  //   return res.status(403).send('Error. Incorrect Password.');
  // }




  // go home after logging in
  res.redirect('/urls');
});
// NEW LOGIN HANDLER


app.get("/", (req, res) => {
  res.redirect('/urls');
});



app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    // userID: req.cookies["user_id"],
    userID: req.session.user_id

  };
  console.log(urlDatabase[shortURL]);
  // console.log(req.body);  // Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});



// Helper function for checking if email address has already been registered.
const checkLoggedInFromUserId = function (userId) {
  for (let item in users) {
    if (userId === users[item].id) {
      return true;
      // console.log(true);
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

// add additional endpoints
// when you're entering a new url
app.get("/urls/new", (req, res) => {
  const curUserID = req.session.user_id;
  const currUser = getCurrentUser(curUserID, users);
  const templateVars = {
    user: currUser
  };

  // if user is logged in, go to new url page
  if (checkLoggedInFromUserId(curUserID)) {
    res.render("urls_new", templateVars);
  } else {
    // if user is not logged in redirect to login page
    res.redirect('/login');
  }
});

// Home page
app.get("/urls", (req, res) => {
  const curUserID = req.session.user_id;
  const currUser = getCurrentUser(curUserID, users);


  const templateVars = {
    // this passes the full database (which you don't want)
    urls: urlDatabase,
    urls: userURLS(req.session.user_id),
    user: currUser
  };
  res.render("urls_index", templateVars);
});
// Old urlDatabase
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };
// const urlDatabase = {
//   b6UTxQ: {
//     longURL: "https://www.tsn.ca",
//     userID: "aJ48lW"
//   },
//   i3BoGr: {
//     longURL: "https://www.google.ca",
//     userID: "aJ48lW"
//   }
// };

app.get("/urls/:shortURL", (req, res) => {
  const curUserID = req.session.user_id;
  const currUser = getCurrentUser(curUserID, users);

  const templateVars = {
    user: currUser,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    urlUserID: urlDatabase[req.params.shortURL].userID
  };
  // console.log(templateVars);
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});










// Route for register page
app.get('/register', (req, res) => {
  const curUserID = req.session.user_id;
  const currUser = getCurrentUser(curUserID, users);
  const templateVars = {
    user: currUser
  };
  res.render('register', templateVars);
});

// Route for login page
app.get('/login', (req, res) => {
  const curUserID = req.session.user_id;
  const currUser = getCurrentUser(curUserID, users);
  const templateVars = {
    user: currUser
  };
  res.render('login', templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const filteredURLS = userURLS(userID);
  if (Object.keys(filteredURLS).includes(req.params.shortURL)) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    return res.status(401).send('Error. You can only delete URLs that are associated with your account.');
  }
});

app.post("/urls/:shortURL/edit", (req, res) => {
  // when we edit we don't make a new id, we grab the existing id from the params
  const userID = req.session.user_id;
  const filteredURLS = userURLS(userID);
  if (Object.keys(filteredURLS).includes(req.params.id)) {
    const shortURL = req.params.shortURL;
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
    };
    res.redirect('/urls');
  } else {
    return res.status(401).send('Error. You can only edit URLs that are associated with your account.');
  }
});


// login
// Add an endpoint to handle a POST to /login in your Express server.
app.post("/login", (req, res) => {
  // It should set a cookie named username to the value submitted in the request body via the login form
  const userId = req.body.user_id;
  res.session.user_id = userId;

  // After our server has set the cookie it should redirect the browser back to the /urls page.
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// message that appears in terminal when you start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});;