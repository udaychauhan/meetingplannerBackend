const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const validateInput = require('../libs/paramsValidationLib')
const check = require('../libs/checkLib')
const passwordLib = require('../libs/generatePasswordLib')
const token = require('../libs/tokenLib')
const AuthModel = mongoose.model('Auth')
const nodemailer = require('../libs/nodemailer')

/* Models */
const UserModel = mongoose.model('User')



// start user signup function 

let signUpFunction = (req, res) => {
    //check if correct values are given
    //generate hash for password
    //save data
    //send succcess or error
    let validateUserInput = () => {
        return new Promise((resolve, reject) => {
            if (req.body.emailId) {
                if (!validateInput.Email(req.body.emailId)) {
                    let apiResponse = response.generate(true, 'Email does not met the requirement', 400, null)
                    reject(apiResponse)
                } else if (check.isEmpty(req.body.password)) {
                    let apiResponse = response.generate(true, 'Password parameter is missing"', 400, null)
                    reject(apiResponse)
                } else {
                    resolve(req)
                }
            } else {
                logger.error('Field Missing During User Creation', 'userController: createUser()', 5)
                let apiResponse = response.generate(true, 'One or More Parameter(s) is missing', 400, null)
                reject(apiResponse)
            }
        })
    }// end validate user input

    let createUser = () => {

        return new Promise((resolve, reject) => {
            UserModel.findOne({ emailId: req.body.emailId })
                .exec((err, retrievedUserDetails) => {
                    if (err) {
                        logger.error(err.message, 'userController: createUser', 10)
                        let apiResponse = response.generate(true, 'Failed To Create User', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(retrievedUserDetails)) {
                        console.log(req.body);
                        //create new user
                        let admin = req.body.admin;
                        
                        let newUser = new UserModel({
                            userId: shortid.generate(),
                            firstName: req.body.firstName,
                            lastName: req.body.lastName || '',
                            emailId: req.body.emailId.toLowerCase(),
                            countryCode: req.body.countryCode,
                            admin: admin,
                            phoneNumber: req.body.phoneNumber,
                            password: passwordLib.hashpassword(req.body.password),
                            createdOn: time.now()
                        });
                        //save new user
                        newUser.save((err, newUser) => {
                            if (err) {
                                console.log(err)
                                logger.error(err.message, 'userController: createUser', 10)
                                let apiResponse = response.generate(true, 'Failed to create new User', 500, null)
                                reject(apiResponse)
                            } else {
                                let newUserObj = newUser.toObject();
                                resolve(newUserObj)
                            }
                        });

                    } else {
                        logger.error('User Cannot Be Created.User Already Present', 'userController: createUser', 4)
                        let apiResponse = response.generate(true, 'User Already Present With this Email', 403, null)
                        reject(apiResponse)
                    }
                })
        });

    }//end create user

    validateUserInput(req, res)
        .then(createUser)
        .then((resolve) => {
            delete resolve.password
            let apiResponse = response.generate(false, 'User created', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })


}// end user signup function 

// start of login function 
let loginFunction = (req, res) => {
    //check if user exists
    //check if password matched
    //send success or error
    console.log("login function");
    let findUser = () => {
        console.log("findUser");
        return new Promise((resolve, reject) => {
            if (req.body.emailId) {
                console.log("req body email is there");
                console.log(req.body);
                UserModel.findOne({ emailId: req.body.emailId }, (err, userDetails) => {
                    /* handle the error here if the User is not found */
                    if (err) {
                        console.log(err)
                        logger.error('Failed To Retrieve User Data', 'userController: findUser()', 10)
                        let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                        reject(apiResponse)

                    } else if (check.isEmpty(userDetails)) {
                        /* generate the response and the console error message here */
                        logger.error('No User Found', 'userController: findUser()', 7)
                        let apiResponse = response.generate(true, 'No User Details Found', 404, null)
                        reject(apiResponse)
                    } else {
                        /* prepare the message and the api response here */
                        logger.info('User Found', 'userController: findUser()', 10)
                        resolve(userDetails)
                    }
                });

            } else {
                let apiResponse = response.generate(true, '"emailId" parameter is missing', 400, null)
                reject(apiResponse)
            }
        })
    }

    // validate if password input by user is correct or not
    let validatePassword = (retrievedUserDetails) => {
        console.log("validatePassword" + retrievedUserDetails);
        return new Promise((resolve, reject) => {
            passwordLib.comparePassword(req.body.password, retrievedUserDetails.password, (err, isMatch) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Login Failed', 500, null)
                    reject(apiResponse)
                } else if (isMatch) {
                    let retrievedUserDetailsObj = retrievedUserDetails.toObject()
                    delete retrievedUserDetailsObj.password
                    delete retrievedUserDetailsObj._id
                    delete retrievedUserDetailsObj.__v
                    delete retrievedUserDetailsObj.createdOn
                    delete retrievedUserDetailsObj.modifiedOn
                    resolve(retrievedUserDetailsObj)
                } else {
                    logger.info('Login Failed Due To Invalid Password', 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Wrong Password.Login Failed', 400, null)
                    reject(apiResponse)
                }
            })
        })
    }

    // if passsword is correct we will generate authToken
    // authToken takes userdetails userId, firstName , lastName, countryCode, phoneNumber,emailId
    let generateToken = (userDetails) => {
        console.log("generate token");
        console.log(" user details to be saved in token are " + JSON.stringify(userDetails));
        return new Promise((resolve, reject) => {
            token.generateToken(userDetails, (err, tokenDetails) => {
                if (err) {
                    console.log(err)
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else {
                    tokenDetails.userId = userDetails.userId
                    tokenDetails.userDetails = userDetails
                    resolve(tokenDetails)
                }
            })
        })
    }

    let saveToken = (tokenDetails) => {
        console.log("save token");
        return new Promise((resolve, reject) => {
            AuthModel.findOne({ userId: tokenDetails.userId }, (err, retrievedTokenDetails) => {
                if (err) {
                    console.log(err.message, 'userController: saveToken', 10)
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(retrievedTokenDetails)) {
                    // if auth token doesn't exist make a new one and save it
                    let newAuthToken = new AuthModel({
                        userId: tokenDetails.userId,
                        authToken: tokenDetails.token,
                        tokenSecret: tokenDetails.tokenSecret,
                        tokenGenerationTime: time.now()
                    })
                    newAuthToken.save((err, newTokenDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody)
                        }
                    })
                } else {
                    retrievedTokenDetails.authToken = tokenDetails.token
                    retrievedTokenDetails.tokenSecret = tokenDetails.tokenSecret
                    retrievedTokenDetails.tokenGenerationTime = time.now()
                    retrievedTokenDetails.save((err, newTokenDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody)
                        }
                    })
                }
            })
        })
    }

    findUser(req, res)
        .then(validatePassword)
        .then(generateToken)
        .then(saveToken)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Login Successful', 200, resolve);
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log("errorhandler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        })
}

// end of the login function 


let logout = (req, res) => {

} // end of the logout function.

let forgotPassword = (req, res) => {
    //ccheck if email id is valid
    //check if email id exists or not 
    //if exists send move further, if not error
    //generate change password token as you generate auth token
    //send mail to email id
    //send success or error message


    let findUser = () => {
        console.log("findUser");
        return new Promise((resolve, reject) => {
            if (req.body.emailId) {
                console.log("req body email is there");
                console.log(req.body);
                UserModel.findOne({ emailId: req.body.emailId }, (err, userDetails) => {
                    /* handle the error here if the User is not found */
                    if (err) {
                        console.log(err)
                        logger.error('Failed To Retrieve User Data', 'userController: forgotpassword()', 10)
                        let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(userDetails)) {
                        /* generate the response and the console error message here */
                        logger.error('No User Found', 'userController: forgotPassword()', 7)
                        let apiResponse = response.generate(true, 'No User Details Found', 404, null)
                        reject(apiResponse)
                    } else {
                        /* prepare the message and the api response here */
                        logger.info('User Found', 'userController: forgotpassword()', 10)
                        resolve(userDetails)
                    }
                });

            } else {
                let apiResponse = response.generate(true, '"email" parameter is missing', 400, null)
                reject(apiResponse)
            }
        });
    }

    // here we generate new token for pasword change only 
    // this token would be used in change password situation
    let generateTokenToChangePassword = (userDetails) => {
        return new Promise((resolve, reject) => {
            token.generateTokenForPasswordChange(userDetails.emailId, (err, result) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'userController: generateTokenToChangePassword', 10);
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null);
                    reject(apiResponse);
                } else {
                    let receiverDetails = {
                        emailId: userDetails.emailId,
                        token: result.token
                    }
                    nodemailer.sendMail(receiverDetails, (err, result) => {
                        console.log("generate token " + err + " " + result);

                        if (err) {
                            let apiResponse = response.generate(true, err.message, 500, null);
                            reject(apiResponse);
                        } else {
                            let apiResponse = response.generate(false, "Mail Sent." + result, 200, null);
                            resolve(apiResponse);
                        }
                    });

                }
            });
        });
    }

    findUser(req, res)
        .then(generateTokenToChangePassword)
        .then((resolve) => {
            res.send(resolve);
        })
        .catch((err) => {
            console.log("errorhandler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        })




} // end of the forgot password function.



let changePassword = (req, res) => {
    //see if token is valid
    //if valid token then extract email id from it
    // edit password for that email id
    // send success or fail

    verifyToken = (req, res) => {
        return new Promise((resolve, reject) => {
            console.log("verify token  called");
            if (req.params.authToken || req.query.authToken || req.body.authToken || req.header('authToken')) {
                let tokenFromRequest = req.params.authToken || req.query.authToken || req.body.authToken || req.header('authToken');
                // let apiResponse = response.generate(false, "Token is " + tokenFromRequest + "password is " +req.body.password, 400, null)
                //res.send(apiResponse);
                token.verifyClaimWithoutSecret(tokenFromRequest, (err, data) => {
                    if (err) {
                        let apiResponse = response.generate(false, "Token Error : " + err,
                            500, null)
                        reject(apiResponse);
                    } else {
                        //this data.data is emailId
                        resolve(data.data);
                    }
                })

            }
        });

    }

    changePassword = (emailId) => {
        return new Promise((resolve, reject) => {
            console.log("change password called for " + emailId);
            if (req.params.password || req.query.password || req.body.password || req.header('password')) {
                let passwordFromRequest = req.body.password;
                let options = { password: passwordLib.hashpassword(passwordFromRequest) };
                UserModel.update({ 'emailId': emailId }, options).exec((err, result) => {
                    if (err) {
                        console.log(err)
                        logger.error(err.message, 'User Controller:change password', 10)
                        let apiResponse = response.generate(true, 'Failed To edit user details', 500, null)
                        reject(apiResponse);
                    } else if (check.isEmpty(result)) {
                        logger.info('No User Found', 'User Controller: change password');
                        let apiResponse = response.generate(true, 'No User Found', 404, null)
                        reject(apiResponse);
                    } else {
                        //let apiResponse = response.generate(false, "Password Changed to: " + passwordFromRequest + " for " + email, 200, null)
                        let apiResponse = response.generate(false, "Password Changed For " + emailId, 200, null)
                        resolve(apiResponse);
                    }
                });// end user model update

            } else {
                let apiResponse = response.generate(true, "Empty or Invalid Passowrd " + passwordFromRequest, 400, null)
                reject(apiResponse);
            }
        });
    }

    verifyToken(req, res)
        .then(changePassword)
        .then((resolve) => {
            res.send(resolve);
        })
        .catch((err) => {
            console.log("errorhandler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        })


}//end change password function

/* Get all user Details */
let getAllUser = (req, res) => {
    UserModel.find()
        .select(' -__v -_id -password')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'User Controller: getAllUser', 10)
                let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No User Found', 'User Controller: getAllUser')
                let apiResponse = response.generate(true, 'No User Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'All User Details Found', 200, result)
                res.send(apiResponse)
            }
        })
}// end get all users





module.exports = {
    signUpFunction: signUpFunction,
    loginFunction: loginFunction,
    forgotpasswordFunction: forgotPassword,
    changepasswordFunction: changePassword,
    getAllUser: getAllUser
}// end exports