const express = require('express');
const router = express.Router();
const userController = require("./../../app/controllers/userController");
const meetingController = require("./../../app/controllers/meetingController");
const appConfig = require("./../../config/appConfig");
const auth = require('./../middlewares/auth');

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/meeting`;

    // defining routes.

    //params : authtoken,userId
    app.post(`${baseUrl}/getAllMeetingsForUser`,auth.isAuthorized, meetingController.getAllMeetingsForUser);

    //params : authtoken,meetingId
    app.post(`${baseUrl}/getMeetingByMeetingId`,auth.isAuthorized, meetingController.getAllMeetingByMeetingId);


    // params:authTOken, adminId, meetingId
    app.post(`${baseUrl}/deleteMeeting`,auth.isAuthorized, meetingController.deleteMeeting);

    // params:authTOken, adminId, meetingId
    app.post(`${baseUrl}/updateMeeting`,auth.isAuthorized, meetingController.updateMeeting);

    // params: authTOken,adminId,userId,adminName,username,year,month,date,time,where,purpose
    app.post(`${baseUrl}/addMeeting`,auth.isAuthorized, meetingController.addMeeting);

    //------ cart bassed routes
    // params: cartId( if not there make new cart and then add items)
    //,itemId,itemName,itenDescription,itemCost
    app.post(`${baseUrl}/addItemToCart`, meetingController.addMeeting);

    // params: cartId,itemId
    app.post(`${baseUrl}/deleteItemFromCart`, meetingController.addMeeting);

    // params: cartId
    app.post(`${baseUrl}/getAllItemsFromCart`, meetingController.addMeeting);

    // params: nothing required
    app.post(`${baseUrl}/getAllItems`, meetingController.addMeeting);

    // params: itemId,itemName,itemDescription,itemCost
    app.post(`${baseUrl}/addItemToDb`, meetingController.addMeeting);

}

