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
    app.post(`${baseUrl}/getAllMeetingsForUser`, meetingController.getAllMeetingsForUser);

    //params : authtoken,meetingId
    app.post(`${baseUrl}/getMeetingByMeetingId`, meetingController.getAllMeetingByMeetingId);


    // params:authTOken, adminId, meetingId
    app.post(`${baseUrl}/deleteMeeting`, meetingController.deleteMeeting);

    // params:authTOken, adminId, meetingId
    app.post(`${baseUrl}/updateMeeting`, meetingController.updateMeeting);

    // params: authTOken,adminId,userId,adminName,username,year,month,date,time,where,purpose
    app.post(`${baseUrl}/addMeeting`, meetingController.addMeeting);

}

