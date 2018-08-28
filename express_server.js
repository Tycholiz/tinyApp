const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require('bcrypt');

const functionsModule = require("./functions");
const database = require("./db");
const generateRandomString = functionsModule.generateRandomString;
const showUserRelevantUrls = functionsModule.showUserRelevantUrls;
const users = database.users;
const urlDatabase = database.urlDatabase;

const app = express();
const PORT = 8080; // def+ault port 8080

app.set("view engine", "ejs") //This tells the Express app to use EJS as its templating engine

//######### MIDDLEWARE ##########
app.use(bodyParser.urlencoded({extended: true}));  //this lets us see the object in the terminal, with key = longURL and value = https://lighthouselabs.ca. Without this, it will just return undefined. console.log(req.body) lets us see this when put into the app.post(/urls) route handler. remember that we must npm install bodyparser
app.use(cookieSession({
  name: 'session',
  keys: ["Mel", "Kyle", "Eli", "Huatulco", "Juno", "Molly", "Frankie"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
//################################


function deleteURL(key) {
  delete urlDatabase[key];
}
function isUser(cookie) {
  if (cookie) {
    return true;
  } else {
    return false;
  }
}

function loginCheckUser(email, password){

  let flag = false;
  for(var user in users){
    if(users[user].email===email){
      //check for the hashed password
      if(bcrypt.compareSync(password, users[user].password)){
        flag = true;
        return users[user];
      } // returns true
    }
  }
  return flag;
}
// function showUserRelevantUrls(cookie) {
//   var usersURLS = [];
//   for (var i in urlDatabase) {
//     if (urlDatabase[i].userId === cookie) {
//       var temp = {};
//       temp.longURL = urlDatabase[i].longURL;
//       temp.shortURL = urlDatabase[i].shortURL;
//       temp.userId = urlDatabase[i].userId;
//       usersURLS.push(temp);

//       // usersURLS.push({                        alternative way to write this
//       //   longURL: urlDatabase[i].longURL,
//       //   shortURL: urlDatabase[i].shortURL,
//       //   userId: urlDatabase[i].userId
//       // })
//     }
//   }
//   return usersURLS;
// }

//####### ROUTE HANDLERS ##############

// render urls_index when visiting /urls
app.get("/urls", (req, res) => {
  const userID = req.session.userID
  let templateVars = {
    user: users[userID],
    usersURLS: showUserRelevantUrls(userID, urlDatabase),
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
    user: users[req.session.userID],
    urlDatabase: urlDatabase
  };
  if(req.session.userID){
    res.render("urls_new", templateVars);
  } else {
    res.render("urls_login", templateVars);
  }
});

//add new url to list
app.post("/urls", (req, res) => {
  var urlObj = {}
  console.log("post urls")
  const longURL = req.body.longURL
  const shortStr = generateRandomString();
  urlObj.userId = req.session.userID;
  urlObj.shortURL = shortStr;
  urlObj.longURL = longURL;
  urlDatabase[shortStr] = urlObj;
  res.redirect('/urls/' + shortStr);
});

app.get("/urls/:id", (req, res) => {
  console.log("get urls id")
  let templateVars = {
    user: users[req.session.user_id],
    urlDatabase: urlDatabase,
    shortURL: req.params.id
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  console.log("get /u/shorturl");
  let shortStr = req.params.shortURL;
  let fullUrl = urlDatabase[shortStr].longURL;
  res.redirect("http://www." + fullUrl);  //should be refactored with a function
});

//delete url
app.post("/urls/:id/delete", (req, res) => {
  console.log("post urls/:id/delete")
  let key = req.params.id;
  deleteURL(key, urlDatabase);
  res.redirect("/urls");
});

//update url
app.post("/urls/:id", (req, res) => {   //route = path + method. In order to link to ejs, the entire route HERE must match up with the form on the ejs file(action and method)
  console.log("post urls/:id");
  let shortURL = req.params.id;
  urlDatabase[shortURL].longURL = req.body.longURL; //coming from ejs
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  console.log("get login")
  let templateVars = {
    user: users[req.session.user_id]
  };
  res.render('urls_login', templateVars);
});

//cookies!
app.post("/login", (req, res) => {

   const userEmail = req.body.email;
   const userPassword = req.body.password;
   let user = loginCheckUser(userEmail, userPassword)
   if(user){
     req.session.userID = user.id;
     res.redirect("/urls");
   } else {
    res.sendStatus(403);
   }
});

app.get("/register", (req, res) => {
  console.log("get /register")
  let templateVars = {
    user: users[req.session.user_id],
    urlDatabase: urlDatabase,
    isUser: false
  };
  res.render("urls_register", templateVars);
});

// adds new user object to the users object
app.post("/register", (req, res) =>  {
  console.log("post register");
  const userID = generateRandomString();
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(userPassword, 10);
  req.body.password = hashedPassword;

  //if missing either username or pw, send 400
  let userExists = false;
  if (!userEmail || !userPassword) {
    res.sendStatus(400);
  } else {
    for (let key in users) {
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
      users[userID]['password'] = hashedPassword;
      req.session.userID = userID;
      res.redirect("/urls");
    }
  }
});

//logs the user out
app.post("/logout", (req, res) => {
  console.log("get logout")
  req.session = null
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Teleporting to the server! (Port: ${PORT})`);
});
