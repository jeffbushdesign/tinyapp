const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { func } = require("joi");

const PORT = 8080; // default port 8080

const app = express();

app.set("view engine", "ejs");

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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  users[id].password = req.body.password;


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

  // If a user with that e-mail address is located, compare the password given in the form with the existing user's password. If it does not match, return a response with a 403 status code.
  const userPassword = getPasswordFromEmail(req.body.email);
  if (req.body.password !== userPassword) {
    return res.status(403).send('Error. Incorrect Password.');
  }

  // If both checks pass, set the user_id cookie with the matching user's random ID, then redirect to /urls.
  const userId = getUserIdFromEmail(req.body.email);
  res.cookie('user_id', userId);


  // go home after logging in
  res.redirect('/urls');
});
// NEW LOGIN HANDLER








app.get("/", (req, res) => {
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
  console.log(req.body);  // Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`);
});





// add additional endpoints
// when you're entering a new url
app.get("/urls/new", (req, res) => {
  const curUserID = req.cookies["user_id"];
  const currUser = getCurrentUser(curUserID, users);
  const templateVars = {
    user: currUser
  };
  res.render("urls_new", templateVars);
});



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});



app.get("/urls", (req, res) => {
  const curUserID = req.cookies["user_id"];
  const currUser = getCurrentUser(curUserID, users);
  const templateVars = {
    urls: urlDatabase,
    user: currUser
  };
  res.render("urls_index", templateVars);
});





app.get("/urls/:shortURL", (req, res) => {
  const curUserID = req.cookies["user_id"];
  const currUser = getCurrentUser(curUserID, users);

  const templateVars = {
    user: currUser,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Route for register page
app.get('/register', (req, res) => {
  const curUserID = req.cookies["user_id"];
  const currUser = getCurrentUser(curUserID, users);
  const templateVars = {
    user: currUser
  };
  res.render('register', templateVars);
});

// Route for login page
app.get('/login', (req, res) => {
  const curUserID = req.cookies["user_id"];
  const currUser = getCurrentUser(curUserID, users);
  const templateVars = {
    user: currUser
  };
  res.render('login', templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.newURL;
  res.redirect('/urls');
});

// login
// Add an endpoint to handle a POST to /login in your Express server.
app.post("/login", (req, res) => {
  // It should set a cookie named username to the value submitted in the request body via the login form
  const userId = req.body.user_id;
  res.cookie('user_id', userId);

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