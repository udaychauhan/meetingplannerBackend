const express = require('express');
const router = express.Router();
const userController = require("./../../app/controllers/userController");
const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/users`;

    // defining routes.

    //params : authtoken
    //app.get(`${baseUrl}/view/all`, auth.isAuthorized, userController.getAllUser);
    app.get(`${baseUrl}/view/all`, userController.getAllUser);
     /**
	* @api {get} /api/v1/users/view/all Get all users
	* @apiVersion 0.0.1
	* @apiGroup  User
	*
	
	
	* @apiParam {string} authToken AuthToken of the user. (body params) (required)
   
	*
	  @apiSuccessExample {json} Success-Response:
	*  {
	*   "error": false,
	*   "message": "All User Details Found",
	*   "status": 200,
	*   "data": Array of users
	*  	}
     **/


    // params: firstName, lastName, email, countryCode,phoneNumber, password
    app.post(`${baseUrl}/signup`, userController.signUpFunction);
    /**
	* @api {post} /api/v1/users/signup Create New  User
	* @apiVersion 0.0.1
	* @apiGroup  User
	*
	* @apiParam {string} firstName name of the suer passed as a body parameter
	* @apiParam {string} lastName of the user passed as a body parameter
	* @apiParam {string} email email of the user. (body params) (required)
    * @apiParam {string} password password of the user. (body params) (required)
	* @apiParam {number} countryCode category of the user passed as a body parameter
	* @apiParam {number} phoneNUmber category of the user passed as a body parameter
	*
	  @apiSuccessExample {json} Success-Response:
	*  {
	*   "error": false,
	*   "message": "User Created.",
	*   "status": 200,
	*   "data": [
    *				{
    *					_id: "string",
                        firstName: "string",
                        lastName: "string",
                        emailId: "string",
                        countryCode : "number",
                        phoneNumber: "number",
                        userId:"string",
                        createdOn:"string"
	*                   __v: number
    *				}
	*   		]
	*  	}
     **/


  
    // params: email, password.
    app.post(`${baseUrl}/login`, userController.loginFunction);
    /**
     * @apiGroup User
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/login Login User.
     *
     * @apiParam {string} email email of the user. (body params) (required)
     * @apiParam {string} password password of the user. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Login Successful",
            "status": 200,
            "data": {
                "authToken": "eyJhbGciOiJIUertyuiopojhgfdwertyuVCJ9.MCwiZXhwIjoxNTIwNDI29tIiwibGFzdE5hbWUiE4In19.hAR744xIY9K53JWm1rQ2mc",
                "userDetails": {
                "countryCode" : number
                "phoneNumber": 2234435524,
                "emailId": "someone@mail.com",
                "lastName": "Sengar",
                "firstName": "Rishabh",
                "userId": "-E9zxTYA8"
            }

        }
    */

    // send contact api end
    app.post(`${baseUrl}/forgotpassword`, userController.forgotpasswordFunction);
    /**
    * @apiGroup users
    * @apiVersion  1.0.0
    * @api {post} /api/v1/users/forgotpassword Forgot Password.
    * @apiGroup  User
    * 
    * @apiParam {string} email email of the user. (body params) (required)
   
    *
    * @apiSuccess {object} myResponse shows error status, message, http status code, result.
    * @apiSuccess {object} Use the url on your mail as authentication to change password
    * 
    * @apiSuccessExample {object} Success-Response:
        {
           "error": false,
           "message": "Mail sent"
           "status": 200,
           "data": null

       }
   */


    app.post(`${baseUrl}/changepassword`, userController.changepasswordFunction);
      /**
    * @apiGroup User
    * @apiVersion  1.0.0
    * @api {post} /api/v1/users/changepassword  Change Password.
    *
    * @apiParam {string} token Token generated from forgot password api. (body params) (required)
    * @apiParam {string} password Password of the user that he wants to change. (body params) (required)
    * 
   
    *
    * @apiSuccess {object} myResponse shows error status, message, http status code, result.
    * 
    * @apiSuccessExample {object} Success-Response:
        {
           "error": false,
           "message": "Password changed for uday@gmail.com"
           "status": 200,
           "data": null

       }
   */   

   
}

