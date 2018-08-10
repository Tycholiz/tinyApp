const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const functionsModule = require("./functions");

const generateRandomString = functionsModule.generateRandomString;

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs") //This tells the Express app to use EJS as its templating engine

//######### MIDDLEWARE ##########
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));  //this lets us see the object in the terminal, with key = longURL and value = https://lighthouselabs.ca. Without this, it will just return undefined. console.log(req.body) lets us see this when put into the app.post(/urls) route handler. remember that we must npm install bodyparser
//############################


function deleteURL(key) {
  delete urlDatabase[key];
}

//########### DATA ############
urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
},

users = {
  "user1RandomID": {
    id: "userRandomID",
    email: "asd@asd.com",
    password: "asdasd"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "funkymonkey@example.com",
    password: "funkymonkey"
  }
}
//##########################

//####### ROUTE HANDLERS ##############

// render urls_index when visiting /urls
app.get("/urls", (req, res) => {
  let templateVars = {
    user: users[req.cookies.user_id],
    urlDatabase: urlDatabase
  };
  res.render('urls_index', templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//render new url page
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies.user_id],
    urlDatabase: urlDatabase
  };
  res.render("urls_new", templateVars);
});

//add new url to list
app.post("/urls", (req, res) => {
  const shortStr = generateRandomString();
  urlDatabase[shortStr] = req.body.longURL;
  res.redirect('/urls/' + shortStr);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    user: users[req.cookies.user_id],
    urlDatabase: urlDatabase,
    shortURL: req.params.id
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  console.log(req.originalUrl);
  let shortStr = req.params.shortURL;
  let fullUrl = urlDatabase[shortStr];
  res.redirect("http://www." + fullUrl);
});

//delete url
app.post("/urls/:id/delete", (req, res) => {
  let key = req.params.id;
  deleteURL(key, urlDatabase);
  res.redirect("/urls");
});

//update url
app.post("/urls/:id", (req, res) => {   //route = path + method. In order to link to ejs, the entire route HERE must match up with the form on the ejs file(action and method)
  let key = req.params.id;
  deleteURL(key, urlDatabase);
  urlDatabase[key] = req.body.longURL //coming from ejs
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render('urls_login', templateVars);
});

//cookies!
app.post("/login", (req, res) => {
  //req.body.username is making reference to the ejs file.

  //check to see if email that user inputs is in the db
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  for (var key in users) {
    if (userEmail === users[key].email && userPassword === users[key].password) {
      res.cookie('user_id', users[key].id);
      res.redirect("/urls");   // THIS IS SUPPOSED TO REDIRECT TO '/', WHICH HAD "HELLO"
      return;
    }
  }
  res.sendStatus(403);
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies.user_id],
    urlDatabase: urlDatabase
  };
  res.render("urls_register", templateVars);
});

// adds new user object to the users object
app.post("/register", (req, res) =>  {
  // console.log(users);
  const userID = generateRandomString();
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  //if missing either username or pw, send 400
  let userExists = false;
  if (!userEmail || !userPassword) {
    res.sendStatus(400);
  } else {
    for (let key in users) {
      console.log(users[key].email);
      console.log(userEmail);
      if (userEmail === users[key].email) {
        userExists = true;
      }
    }
    if (userExists) {
      res.sendStatus(400);
    } else {
      users[userID] = {};
      users[userID]['id'] = userID;
      users[userID]['email'] = userEmail;
      users[userID]['password'] = userPassword;
      res.cookie('user_id', userID);
      res.redirect("/urls");
    }
  }
});

//logs the user out
app.post("/logout", (req, res) => {
  res.clearCookie('user_id').redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Teleporting to the server! (Port: ${PORT})`);
});
