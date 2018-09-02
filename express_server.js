const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require('bcrypt');

const functionsModule = require("./functions");
const database = require("./db");
const generateRandomString = functionsModule.generateRandomString;
const showUserRelevantUrls = functionsModule.showUserRelevantUrls;
const isUser = functionsModule.isUser;
// const deleteURL = functionsModule.deleteURL;

const users = database.users;
const urlDatabase = database.urlDatabase;

const app = express();
const PORT = 8080;

app.set("view engine", "ejs")

//######### MIDDLEWARE ##########
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["Mel", "Kyle", "Eli", "Huatulco", "Juno", "Molly", "Frankie"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(express.static(__dirname));
//################################


function deleteURL(key) {
  delete urlDatabase[key];
}
function isLoggedIn(cookie) {
  if (cookie) {
    return true;
  } else {
    return false;
  }
}

//####### ROUTE HANDLERS ##############

app.get("/", (req, res) => {
  res.redirect("/urls")
});

app.get("/urls", (req, res) => {
  const cookieID = req.session.userID
  let templateVars = {
    user: users[cookieID],
    usersURLS: showUserRelevantUrls(cookieID, urlDatabase),
    urlDatabase: urlDatabase
  };
  res.render('urls_index', templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//render new url page
app.get("/urls/new", (req, res) => {
  const userID = req.session.userID;
  let templateVars = {
    user: users[userID],
    urlDatabase: urlDatabase
  };
  if(userID){
    res.render("urls_new", templateVars);
  } else {
    res.render("urls_login", templateVars);
  }
});

//add new url to list
app.post("/urls", (req, res) => {
  var urlObj = {}
  const longURL = req.body.longURL
  const shortURL = generateRandomString();
  const userID = req.session.userID;
  urlObj.userId = userID;
  urlObj.shortURL = shortURL;
  urlObj.longURL = longURL;
  urlDatabase[shortURL] = urlObj;
  res.redirect('/urls/' + shortURL);
});

app.get("/urls/:id", (req, res) => {
  const userID = req.session.userID;
  const shortURL = req.params.id
  let templateVars = {
    user: users[userID],
    urlDatabase: urlDatabase,
    shortURL: shortURL
  };
  if (!urlDatabase[shortURL]) {
    res.sendStatus(404);
  } else {
    let urlBelongingToUser = urlDatabase[shortURL].userId;
      if (userID === urlBelongingToUser) {
        res.render("urls_show", templateVars);
      } else {
        res.sendStatus(403);
      }
  }
});

app.get("/u/:shortURL", (req, res) => {
  let shortStr = req.params.shortURL;
  if (urlDatabase[shortStr]) {
    let fullUrl = urlDatabase[shortStr].longURL;
    res.redirect(fullUrl);
  } else {
    res.sendStatus(404);
  }
});

//delete url
app.post("/urls/:id/delete", (req, res) => {
  let key = req.params.id;
  deleteURL(key, urlDatabase);
  res.redirect("/urls");
});

//update url
app.post("/urls/:id", (req, res) => {

  let shortURL = req.params.id;
  urlDatabase[shortURL].longURL = req.body.longURL; //coming from ejs
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const userID = req.session.userID;
  if (users[userID]) {
    res.redirect("/urls")
  }
  let templateVars = {
    user: users[userID]
  };
  res.render('urls_login', templateVars);
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  let user = isUser(userEmail, userPassword, users)
  if(user){
    req.session.userID = user.id;
    res.redirect("/urls");
  } else {
  res.sendStatus(403);
  }
});

app.get("/register", (req, res) => {
  const userID = req.session.userID;
  if (users[userID]) {
    res.redirect("/urls")
  }
  let templateVars = {
    user: users[userID],
    urlDatabase: urlDatabase,
    isLoggedIn: false
  };
  res.render("urls_register", templateVars);
});

// adds new user object to the users object
app.post("/register", (req, res) =>  {
  const userID = generateRandomString();
  const emailField = req.body.email;
  const pwField = req.body.password;
  const hashedPassword = bcrypt.hashSync(pwField, 10);
  req.body.password = hashedPassword;

  //if missing either username or pw, send 400
  let userExists = false;
  if (!emailField || !pwField) {
    res.sendStatus(400);
  } else {
    for (let key in users) {
      if (emailField === users[key].email) {
        userExists = true;
      }
    }
    if (userExists) {
      res.sendStatus(400);
    } else {
      users[userID] = {};
      users[userID]['id'] = userID;
      users[userID]['email'] = emailField;
      users[userID]['password'] = hashedPassword;
      req.session.userID = userID;
      res.redirect("/urls");
    }
  }
});

//logs the user out
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Teleporting to the server! (Port: ${PORT})`);
});
