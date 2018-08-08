const express = require("express");
const bodyParser = require("body-parser");
var app = express();
var PORT = 8080; // default port 8080

app.set("view engine", "ejs") //This tells the Express app to use EJS as its templating engine


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

//render hello when user visits '/'
app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/hello", (req, res) => {
  let templateVars = {
    greeting: 'Hello World!'
  };
  res.render("hello_world", templateVars);
});

//render urls_index when user requests /urls
app.get("/urls", (req, res) => {                               //this is a route handler. It tells us what will be rendered when the browser loads the '/' path of the website we are on.
  res.render('urls_index', {
    urlDatabase: urlDatabase                  //key refers to the EJS doc, value refers to the object in this doc
  });
});

app.get("/urls.json", (req, res) => {                     //this is a route handler
  res.json(urlDatabase);
});

//this route handler must go before the one directly below it. they are both a page right after /urls/, so order matters here. in these cases, the more specific one will go first (this one is more specific because :id will change depending on what is passed through)
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


//create new
app.post("/urls", (req, res) => { //the request is made to /urls because we are requesting to add something onto this url (the new URL we added in /urls/new)
  // console.log(req.body);  // debug statement to see POST parameters
                        //important to remember that we can only have one status code per request. It is like 'return' line of a function in that sense
  const shortStr = generateRandomString();
  urlDatabase[shortStr] = req.body.longURL;
  // console.log(urlDatabase);  //this will log to the console every time a POST request is made (ie. whenever the form is submitted)
  res.redirect('http://localhost:8080/urls/' + shortStr);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    urlDatabase: urlDatabase
  };
  res.render("urls_show", templateVars);
});

//redirect the user to the longURL when they enter shortURL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[shortStr];
  // console.log(longURL)                    //in order to console.log this one, we need to go to localhost:8080/u/shortStr
  res.redirect("https://www." + longURL);
});

//redirect to /urls when user deletes a url from the list
//this /delete path is almost imaginary, in that we will never be able to go to it. We simply tell the browser something, and it knows what to do based on the url
app.post("/urls/:id/delete", (req, res) => {
  let key = req.params.id;
  delete urlDatabase[key];
  res.redirect("/urls");
});

//update
app.post("/urls/:id", (req, res) => {
  urlDatabase[shortStr] = req.body.longURL;
});

app.listen(PORT, () => {                                  //this is a route handler
  console.log(`Example app listening on port ${PORT}!`);
});
