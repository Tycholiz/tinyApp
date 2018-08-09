const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

var app = express();
var PORT = 8080; // default port 8080

app.set("view engine", "ejs") //This tells the Express app to use EJS as its templating engine

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));  //this lets us see the object in the terminal, with key = longURL and value = https://lighthouselabs.ca. Without this, it will just return undefined. console.log(req.body) lets us see this when put into the app.post(/urls) route handler. remember that we must npm install bodyparser

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  const possibleChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  let shorty = "";
  for (let i = 0; i < 6; i++) {
    var randomNum = Math.floor((Math.random() * possibleChars.length - 1)) + 1;
    shorty += possibleChars[randomNum];
  }
  return shorty;
}

function deleteURL(key) {
  delete urlDatabase[key];
}

// function updateURL(key) {
//   urlDatabase[key] = longURL;
// }

//render hello when user visits '/'
app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/hello", (req, res) => {
  let templateVars = {
    greeting: 'Hello World!',
    username: req.cookies["username"]
  };
  res.render("hello_world", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
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
    username: req.cookies["username"]
  };
  console.log(templateVars);
  res.render("urls_new", templateVars);
});

//add url to list
app.post("/urls", (req, res) => {
  const shortStr = generateRandomString();
  urlDatabase[shortStr] = req.body.longURL;
  res.redirect('/urls/' + shortStr);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    urlDatabase: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[shortStr];
  res.redirect("https://www." + longURL);
});

//delete url
app.post("/urls/:id/delete", (req, res) => {
  let key = req.params.id;
  deleteURL(key);
  res.redirect("/urls");
});

//update url
app.post("/urls/:id", (req, res) => {   //route = path + method. In order to link to ejs, the entire route HERE must match up with the form on the ejs file(action and method)
  console.log(req.body);
  console.log(req.body.longURL);
  let key = req.params.id;
  deleteURL(key);
  urlDatabase[key] = req.body.longURL //coming from ejs
  res.redirect("/urls");
});

//cookies!
app.post("/login", (req, res) => {
  //req.body.username is making reference to the ejs file.
  res.cookie('username', req.body.username); //set a cookie and name it "username"
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  console.log(req.cookies);
  res.clearCookie('username').redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
