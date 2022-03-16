const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');

// --------------------------------- 
// REQUIRED CONSTANTS
// --------------------------------- 
const {
  urlDatabase,
  users,
} = require('./const');

// --------------------------------- 
// REQUIRED FUNCTIONS
// --------------------------------- 
const {
  getUserByEmail,
  generateRandomString,
  getCurrentUser,
  checkEmailAlreadyRegistered,
  getPasswordFromEmail,
  checkLoggedInFromUserId,
  userURLS,
} = require('./helpers');

const PORT = 8080; // default port 8080

const app = express();

app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ['JEFF'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

// --------------------------------- 
// GET ROUTES
// --------------------------------- 
app.get("/", (req, res) => {
  res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

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

app.get("/urls/:shortURL", (req, res) => {
  const curUserID = req.session.user_id;
  if (!curUserID) {
    res.redirect('/login');
  }
  const currUser = getCurrentUser(curUserID, users);
  const templateVars = {
    user: currUser,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    urlUserID: urlDatabase[req.params.shortURL].userID
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
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

// --------------------------------- 
// POST ROUTES
// --------------------------------- 
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
  const id = generateRandomString();
  // The user object should include the user's id, email and password
  // make a new object for the new user
  users[id] = {};
  users[id].id = id;
  users[id].email = req.body.email;
  users[id].password = bcrypt.hashSync(req.body.password, 10);
  // After adding the user, set a user_id cookie containing the user's newly generated ID
  req.session.user_id = id;

  // go home after registering
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  // res.clearCookie('user_id');
  req.session.user_id = null;
  res.redirect('/urls');
});



app.post("/login", (req, res) => {
  // if the email or password are empty strings, send back a response with the 400 status code
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("Email and Password field cannot be left blank. Please try again.");
  }
  // If a user with that e-mail cannot be found, return a response with a 403 status code.
  if (!checkEmailAlreadyRegistered(req.body.email)) {
    return res.status(403).send('Error. Email address not found.');
  }

  // If both checks pass, set the user_id cookie with the matching user's random ID, then redirect to /urls.
  const user = getUserByEmail(req.body.email, users);
  req.session.user_id = user.id;

  // If a user with that e-mail address is located, compare the password given in the form with the existing user's password. If it does not match, return a response with a 403 status code.
  const userPassword = getPasswordFromEmail(req.body.email);

  if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(403).send('Error. Incorrect Password.');
  }

  // go home after logging in
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    // userID: req.cookies["user_id"],
    userID: req.session.user_id

  };
  res.redirect(`/urls/${shortURL}`);
});

// --------------------------------- 
// UPDATE ROUTES
// --------------------------------- 
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
  if (Object.keys(filteredURLS).includes(req.params.shortURL)) {
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

// --------------------------------- 
// LISTEN ROUTES
// --------------------------------- 

// message that appears in terminal when you start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});;