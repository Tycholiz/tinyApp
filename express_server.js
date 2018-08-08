var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

app.set("view engine", "ejs") //This tells the Express app to use EJS as its templating engine

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

