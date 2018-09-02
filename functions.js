const bcrypt = require('bcrypt');
module.exports = {
  generateRandomString: function() {
    const possibleChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let randomID = "";
    for (let i = 0; i < 6; i++) {
      var randomNum = Math.floor((Math.random() * possibleChars.length - 1)) + 1;
      randomID += possibleChars[randomNum];
    }
    return randomID;
  },
  showUserRelevantUrls: function(cookieID, urlDatabase) {
    var usersURLS = [];
    for (var i in urlDatabase) {
      if (urlDatabase[i].userId === cookieID) {
        usersURLS.push({               
        longURL: urlDatabase[i].longURL,
        shortURL: urlDatabase[i].shortURL,
        userId: urlDatabase[i].userId
        })
      }
    }
  return usersURLS;
  },
  isUser: function(email, password, users) {
    let flag = false;
    for(let user in users){
      if(users[user].email===email){
      //check for the hashed password
        if(bcrypt.compareSync(password, users[user].password)){
          flag = true;
          return users[user];
        } 
      }
    }
    return flag;
  },
  // deleteURL: function(key, urlDatabase) {
  //   delete urlDatabase[key];
  // }
     
 
}