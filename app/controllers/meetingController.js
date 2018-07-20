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
// User model would be used to check if the user is admin or not 
//only then he can do certain tasks
const UserModel = mongoose.model('User');
const MeetingModel = mongoose.model('Meeting');

//this method will check body parameters if they are empty or not
let checkBodyParameters = (body) => {
    let value = false;
    //in some cases like adding a new meeting body won't have meetingId, so for delete
    // and update it will be checked in that method
    if (body.adminName && body.adminId && body.userId && body.username && body.date && body.time) {
        value = true;
    }

    return value;
}

//add a new meeting
let addMeeting = (req, res) => {

    let userId = req.body.userId;
    let checkIfUserIsAdmin = () => {
        return new Promise((resolve, reject) => {

            let adminId = req.body.adminId;
            console.log(adminId)
            UserModel.findOne({ userId: adminId }, (err, result) => {
                if (err) {
                    //error in finding user
                    logger.error(err.message, 'meetingController: addMeeting', 10)
                    let apiResponse = response.generate(true, 'Failed To Find User Id Admin or Not', 500, null)
                    reject(apiResponse);
                } else {
                    console.log(JSON.stringify(result));
                    if (result) {
                        if (result.admin === 'admin') {
                            //user is admin
                            resolve();
                        } else {
                            logger.error(result, 'meetingController: addMeeting', 10)
                            let apiResponse = response.generate(true, 'User not  Admin', 403, null)
                            reject(apiResponse);
                        }

                    } else {
                        //user is not admin
                        //error in finding user
                        logger.error(result, 'meetingController: addMeeting', 10)
                        let apiResponse = response.generate(true, 'User not  found', 403, null)
                        reject(apiResponse);
                    }
                }
            });

        });
    }
    //meeting for same time and user
    //TODO please ponder upon this condition
    let checkIfMeetingExistsForSameTime = () => {
        return new Promise((resolve, reject) => {
            MeetingModel.findOne({ date: req.body.date, time: req.body.time, userId: req.body.userId })
                .exec((err, result) => {
                    if (err) {
                        logger.error(err.message, 'meetingController: addMeeting', 10)
                        let apiResponse = response.generate(true, 'Meeting finding error', 500, null)
                        reject(apiResponse);
                    } else {
                        console.log(result);
                        if (check.isEmpty(result)) {
                            //go ahead meeting for same time and user does not exist
                            resolve();
                        } else {
                            //meeting for same time and user exists, send error
                            logger.error(result, 'meetingController: addMeeting', 10)
                            let apiResponse = response.generate(true,
                                'Meeting for exact time and user already exists. Please select different time or user.',
                                403, null)
                            reject(apiResponse);
                        }
                    }
                });
        });
    }

    let createMeeting = () => {
        return new Promise((resolve, reject) => {
            console.log(JSON.stringify(req.body));
            let meeting = new MeetingModel(
                {
                    meetingId: shortid.generate(),
                    adminId: req.body.adminId,
                    adminName: req.body.adminName,
                    userId: req.body.userId,
                    username: req.body.username,
                    where: req.body.where,
                    purpose: req.body.purpose,
                    date: req.body.date,
                    time: req.body.time
                }
            )

            meeting.save((err, result) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'meeting controller: ccreateMeeting', 10)
                    let apiResponse = response.generate(true, 'Failed to create new meeting', 500, null)
                    reject(apiResponse)
                } else {
                    let newMeetingObj = result.toObject();
                    resolve(newMeetingObj);
                }
            });

        });
    }

    let value = checkBodyParameters(req.body);
    console.log(value)
    if (!value) {
        let apiResponse = response.generate(true, 'Body parameters empty', 403, null);
        res.send(apiResponse);
    } else {
        checkIfUserIsAdmin(req, res)
            .then(checkIfMeetingExistsForSameTime)
            .then(createMeeting)
            .then((resolve) => {
                let apiResponse = response.generate(false, 'Meeting created', 200, resolve)
                res.send(apiResponse);
                          
                
                let mailData = {
                    userId : userId,
                    subject: 'Meeting Added',
                    message: `A meeting by  has been scheduled at ${req.body.date} on ${req.body.time}`,
                    
                }
                getUserInfoByUserIdAndSendMail(mailData)
                
            })
            .catch((err) => {
                console.log(err);
                res.send(err);
            })
    }

}// end of add meeting

//update an meeting
let updateMeeting = (req, res) => {
    console.log('update meeting '+JSON.stringify(req.body));
    let options = req.body;
    let date = req.body.date;
    let time = req.body.time;
    let userId = req.body.userId;
    let meetingId = req.body.meetingId;
    if (req.body.meetingId && req.body.adminId && req.body.userId) {
        MeetingModel.findOneAndUpdate({ 'meetingId': req.body.meetingId }, options,
            {
                multi: true
            }).exec((err, result) => {
                if (err) {
                    logger.error(err.message, 'meetingController: updateMeeting', 10)
                    let apiResponse = response.generate(true, 'Failed To Update Meeting', 500, null)
                    res.send(apiResponse);
                } else {
                    if (!check.isEmpty(result)) {
                        let apiResponse = response.generate(false, 'Updated meeting', 200, result);
                        res.send(apiResponse);

                        
                        
                        let mailData = {
                            userId : userId,
                            subject: 'Meeting Updated',
                            message: `Your meeting by id ${meetingId} has been updated to ${date} at ${time}`,
                        }
 
                        getUserInfoByUserIdAndSendMail(mailData)
                    } else {
                        let apiResponse = response.generate(true, 'Meeting not found.', 404, result)
                        res.send(apiResponse);
                    }
                }
            })
    } else {
        let apiResponse = response.generate(true, 'Body parameters empty', 403, null);
        res.send(apiResponse);
    }

}//end of updating a meeting

//delete a meeting
//requires meetingId and adminId
let deleteMeeting = (req, res) => {
    //delete by adminId and meetingId
    let userId = req.body.userId;
    let meetingId = req.body.meetingId;
    if (req.body.adminId && req.body.meetingId && req.body.userId) {
        MeetingModel.findOneAndRemove({ adminId: req.body.adminId, meetingId: req.body.meetingId })
            .exec((err, result) => {
                if (err) {
                    logger.error(err.message, 'meetingController: deleteMeeting', 10)
                    let apiResponse = response.generate(true, 'Failed To Delete', 500, null)
                    res.send(apiResponse);
                } else {
                    console.log(JSON.stringify(result));
                    if (result) {
                        let apiResponse = response.generate(false, 'Deleted meeting', 200, result);
                        res.send(apiResponse);
    
                        let mailData = {
                            userId:userId,
                            subject: 'Meeting Deleted',
                            message: `Your meeting by id ${meetingId} has been deleted.`,
                            
                        }
                        getUserInfoByUserIdAndSendMail(mailData)
                        
                    } else {
                        let apiResponse = response.generate(true, 'Meeting not found.', 404, null)
                        res.send(apiResponse);
                    }

                }
            });
    } else {
        //paramters empty
        let apiResponse = response.generate(true, 'Body parameters empty', 403, null);
        res.send(apiResponse);
    }
}//--- end of delete a meeting

//this method return meeting by user id
let getAllMeetingByUserId = (req, res) => {
    if (req.body.userId) {
        MeetingModel.find({ userId: req.body.userId }, (err, result) => {
            if (err) {
                //error in finding user
                logger.error(err.message, 'meetingController: getAllMeetingBYUserId', 10)
                let apiResponse = response.generate(true, 'Failed To Find Meeting By User Id', 500, null)
                res.send(apiResponse);
            } else {
                if (check.isEmpty(result)) {
                    let apiResponse = response.generate(false, 'Meetings not present', 403, result)
                    res.send(apiResponse)
                } else {
                    let apiResponse = response.generate(false, 'Meetings present', 200, result)
                    res.send(apiResponse)
                }
            }
        });
    } else {
        let apiResponse = response.generate(true, 'Body parameters empty', 403, null);
        res.send(apiResponse);
    }
}//--end get all meetings for user

//this method return meeting by meeting id
let getAllMeetingByMeetingId = (req, res) => {
    if (req.body.meetingId) {
        MeetingModel.findOne({ meetingId: req.body.meetingId }, (err, result) => {
            if (err) {
                //error in finding user
                logger.error(err.message, 'meetingController: getAllMeetingBYUserId', 10)
                let apiResponse = response.generate(true, 'Failed To Find Meeting By Meeting Id', 500, null)
                res.send(apiResponse);
            } else {
                if (check.isEmpty(result)) {
                    let apiResponse = response.generate(false, 'Meeting not present', 403, result)
                    res.send(apiResponse)
                } else {
                    let apiResponse = response.generate(false, 'Meeting present', 200, result)
                    res.send(apiResponse)
                }
            }
        });
    } else {
        let apiResponse = response.generate(true, 'Body parameters empty', 403, null);
        res.send(apiResponse);
    }
}//--end get all meetings for user

let getUserInfoByUserIdAndSendMail = (detail) => {
    UserModel.findOne({ userId: detail.userId }).exec((err, result) => {
        if (err) {
            console.log('Unable to find user' + err);

        } else {
            if (check.isEmpty(result)) {
                console.log('user does not exists');
            } else {
                let mailData = {
                    subject: detail.subject,
                    message: detail.message,
                    receiverEmail: result.emailId
                }
                nodemailer.sendMeetingInfo(mailData,(err,result)=>{
                    if(err){
                        console.log("Send Meeting Info  Error Occured "+err);
                    }else{
                        console.log("Send Meeting Info Message Sent");
                    }
                });
            }
        }
    });

}
module.exports = {
    addMeeting: addMeeting,
    getAllMeetingsForUser: getAllMeetingByUserId,
    deleteMeeting: deleteMeeting,
    updateMeeting: updateMeeting,
    getAllMeetingByMeetingId: getAllMeetingByMeetingId
}