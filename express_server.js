var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

app.set("view engine", "ejs") //This tells the Express app to use EJS as its templating engine

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));  //this lets us see in the terminal the object, with key = longURL and value = https://lighthouselabs.ca. Without this, it will just return undefined. console.log(req.body) lets us see this when put into the app.post(/urls) route handler. remember that we must npm install bodyparser

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}


app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/hello", (req, res) => {
  let templateVars = {
    greeting: 'Hello World!'
  };
  res.render("hello_world", templateVars);
});

app.get("/urls", (req, res) => {                               //this is a route handler. It tells us what will be rendered when the browser loads the '/' path of the website we are on.
  res.render('urls_index', {
    urlDatabase: urlDatabase                  //key refers to the EJS doc, value refers to the object in this doc
  });
});

app.get("/urls.json", (req, res) => {                     //this is a route handler
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {          //this route handler must go before the one directly below it. they are both a page right after /urls/, so order matters here. in these cases, the more specific one will go first (this one is more specific because :id will change depending on what is passed through)
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
  urlDatabase[generateRandomString()] = req.body.longURL;
  console.log(urlDatabase);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    urlDatabase: urlDatabase
  };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {                                  //this is a route handler
  console.log(`Example app listening on port ${PORT}!`);
});

