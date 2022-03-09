const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

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


// NEW NEW NEW
app.post("/register", (req, res) => {
  // add a new user object to the global users object. 
  // generate a random user id
  console.log(req.body.email);
  console.log(req.body.password);
  const id = generateRandomString();
  // The user object should include the user's id, email and password
  users[id] = {};
  // console.log(users.userRandomID);ç
  users[id].id = id;
  users[id].email = req.body.email;
  users[id].password = req.body.password;


  // After adding the user, set a user_id cookie containing the user's newly generated ID
  res.cookie('user_id', id);

  // Test that the users object is properly being appended to. 
  // You can insert a console.log or debugger prior to the redirect logic to inspect what data the object contains.
  console.log(users[id]);



  // go home after registering
  res.redirect('/urls');
});
/// NEW NEW NEW

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
  const templateVars = {
    username: req.cookies["username"],
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
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render("urls_index", templateVars);
});





app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
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
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render('register', templateVars);
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
  const username = req.body.username;
  res.cookie('username', username);

  // After our server has set the cookie it should redirect the browser back to the /urls page.
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

// message that appears in terminal when you start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});