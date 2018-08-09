module.exports = {
  generateRandomString: function() {
    const possibleChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let shorty = "";
    for (let i = 0; i < 6; i++) {
      var randomNum = Math.floor((Math.random() * possibleChars.length - 1)) + 1;
      shorty += possibleChars[randomNum];
    }
    return shorty;
  }
}