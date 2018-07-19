const jwt = require('jsonwebtoken')
const shortid = require('shortid')
const secretKey = 'someVeryRandomStringThatNobodyCanGuess';


let generateToken = (data, cb) => {
//
  try {
    let claims = {
      jwtid: shortid.generate(),
      iat: Date.now(),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
      sub: 'authToken',
      iss: 'todoApp',
      data: data
    }
    let tokenDetails = {
      token: jwt.sign(claims, secretKey),
      tokenSecret : secretKey
    }
    cb(null, tokenDetails)
  } catch (err) {
    console.log(err)
    cb(err, null)
  }
}// end generate token 

let verifyClaim = (token,secretKey,cb) => {
  // verify a token symmetric
  jwt.verify(token, secretKey, function (err, decoded) {
    if(err){
      console.log("error while verify token");
      console.log(err);
      cb(err,null)
    }
    else{
      console.log("user verified");
      console.log(decoded);
      cb(null,decoded);
    }  
 
 
  });


}// end verify claim 

let verifyClaimWithoutSecret = (token,cb) => {
  
  jwt.verify(token,secretKey,function(err,decoded){
    if(err){
      console.log("error while verify token");
      console.log(err);
      cb(err,null)
    }
    else{
      console.log("user verified "+decoded.data);
      cb (null,decoded);
      //decoded.data.userId /// if more data
      //decode.data == email id hi hain islye directly use decode.data
    }  
  });
}

let generateTokenForPasswordChange  = (data,cb) => {
  try {
    let claims = {
      jwtid: shortid.generate(),
      iat: Date.now(),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
      sub: 'authToken',
      iss: 'passChange',
      // data contains only emailId
      data: data
    }
    let tokenDetails = {
      token: jwt.sign(claims, secretKey),
      tokenSecret : secretKey
    }
    cb(null, tokenDetails)
  } catch (err) {
    console.log(err)
    cb(err, null)
  }
}


module.exports = {
  generateToken: generateToken,
  verifyToken :verifyClaim,
  verifyClaimWithoutSecret : verifyClaimWithoutSecret,
  generateTokenForPasswordChange : generateTokenForPasswordChange
}
