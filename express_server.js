const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const functionsModule = require("./functions");
const bcrypt = require('bcrypt');

const generateRandomString = functionsModule.generateRandomString;

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs") //This tells the Express app to use EJS as its templating engine

//######### MIDDLEWARE ##########
app.use(bodyParser.urlencoded({extended: true}));  //this lets us see the object in the terminal, with key = longURL and value = https://lighthouselabs.ca. Without this, it will just return undefined. console.log(req.body) lets us see this when put into the app.post(/urls) route handler. remember that we must npm install bodyparser
app.use(cookieSession({
  name: 'session',
  keys: ["Mel", "Kyle", "Eli", "Huatulco", "Juno", "Molly", "Frankie"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
//############################


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
        console.log("compare sync matched")
        flag = true;
        return users[user];
      } // returns true
    }
  }
  return flag;
}
function showUserRelevantUrls(cookie) {
  console.log(urlDatabase);
  var usersURLS = [];
  for (var i in urlDatabase) {
    if (urlDatabase[i].userId === cookie) {
      var temp = {};
      temp.longURL = urlDatabase[i].longURL;
      temp.shortURL = urlDatabase[i].shortURL;
      temp.userId = urlDatabase[i].userId;
      usersURLS.push(temp);

      // usersURLS.push({                        alternative way to write this
      //   longURL: urlDatabase[i].longURL,
      //   shortURL: urlDatabase[i].shortURL,
      //   userId: urlDatabase[i].userId
      // })
    }
  }
  return usersURLS;
}

//########### DATA ############
var urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    shortURL: "b2xVn2",
    userId: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    shortURL: "9sm5xK",
    userId: "user2RandomID"
  },
  "h48dkm": {
    longURL: "http://facebook.com",
    shortURL: "h48dkm",
    userId: "userRandomID"
  }
}

var users = {
  "userRandomID": {
    id: "userRandomID",
    email: "asd@asd.com",
    password: "$2b$10$BqdR.tBdc8k8kMhP27Ucjud33/lNSH4JV.szWe9/7bvZgeJkT7Gf6"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}


const test = bcrypt.hashSync("asdasd", 10);
console.log(test)
//##########################

//####### ROUTE HANDLERS ##############

// render urls_index when visiting /urls
app.get("/urls", (req, res) => {

  console.log("test ",showUserRelevantUrls(req.session.userID));
  let templateVars = {
    user: users[req.session.userID],
    usersURLS: showUserRelevantUrls(req.session.userID),
    //isUser: isUser,
    //cookie: req.session.user_id,
    urlDatabase: urlDatabase
  };
  if(req.session.userID){
    console.log("user logged in")
  } else {
    console.log("user not logged in")
  }
  console.log("get urls");

  console.log("welcome");
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

  // //checks to see if user has cookie when trying to access urls/new
  // if (isUser(req.session.user_id)) {

  // } else {

  // }
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
      console.log('username password matched')
   } else {
    res.sendStatus(403);
   }
  // console.log("post login");
  // //check to see if email that user inputs is in the db
  // const userEmail = req.body.email;
  // const userPassword = req.body.password;
  // const hashedPassword = bcrypt.hashSync(userPassword, 10);
  // console.log("req.session: ", req.session);
  // for (var key in users) {
  //   console.log("userEmail: ", userEmail)
  //   console.log("users[key].email: ", users[key].email)
  //   console.log("userPassword: ", userPassword)
  //   console.log("users[key].password: ", users[key].password)
  //   if (userEmail === users[key].email && bcrypt.compareSync(userPassword, hashedPassword)) {
  //     // req.session.users[key].userId = 'user_id';     //Removed this line because it did not seem to be doing anything. userId already equals 'user_id' by this point
  //     res.session.userID = key;
  //     res.redirect("/urls");   // THIS IS SUPPOSED TO REDIRECT TO '/', WHICH HAD "HELLO". changed for functional reasons
  //     return;
  //   }
  // }
  //res.sendStatus(403);
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
  //console.log(res.session);
  //res.clearCookie('userID').redirect('/urls');

  req.session = null
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Teleporting to the server! (Port: ${PORT})`);
});
