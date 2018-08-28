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
  showUserRelevantUrls: function(cookie, urlDatabase) {
    var usersURLS = [];
    for (var i in urlDatabase) {
      if (urlDatabase[i].userId === cookie) {
        usersURLS.push({               
        longURL: urlDatabase[i].longURL,
        shortURL: urlDatabase[i].shortURL,
        userId: urlDatabase[i].userId
        })
      }
    }
  return usersURLS;
  }
 
}