var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

app.set("view engine", "ejs") //This tells the Express app to use EJS as its templating engine

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {                               //this is a route handler. It tells us what will be rendered when the browser loads the '/' path of the website we are on.
  res.render('urls_index', {
        urlDatabase: urlDatabase
  });
});

app.get("/urls.json", (req, res) => {                     //this is a route handler
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/hola", (req, res) => {
  let templateVars = {
    greeting: 'Hola Mundo'
  };
  res.render("hello_world", templateVars); //arg1 = the file w/in views to be rendered. arg2 = the object, where the key is the variable that will be included in hello_world, and the value, which is what that variable will render to
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.listen(PORT, () => {                                  //this is a route handler
  console.log(`Example app listening on port ${PORT}!`);
});