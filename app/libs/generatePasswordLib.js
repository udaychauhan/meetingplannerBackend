const bcrypt = require('bcrypt');
const saltRounds = 10;
const logger  = require('../libs/loggerLib');  

let hashpassword = (plainTextPassword) => {
  let salt = bcrypt.genSaltSync(saltRounds);
  let hash = bcrypt.hashSync(plainTextPassword,salt);
  return hash;
}

let comparePassword = (oldPassword,hashpassword,callback) => {
  let bcryptCallback = (err,res) => {
    if(err){
      logger.error(err.message, 'Comparison Error', 5);
      callback(err, null);
    }else{
      callback(null, res);
    }
  }

  bcrypt.compare(oldPassword,hashpassword,bcryptCallback);
}

module.exports = {
  hashpassword: hashpassword,
  comparePassword: comparePassword
}