'use strict';

const nodemailer = require('nodemailer');

// send mail start
let sendMail = (receiverDetails , cb) => {

    let transporter = nodemailer.createTransport({

        host : 'smtp.gmail.com',
        port: 465,
        auth : {
            user : "dummy4nodemailer@gmail.com",
            pass : 'dummy*444#'
        },
        tls:{
            rejectUnauthorized: false
        }
    });
    
    let receiverEmailId = receiverDetails.emailId;
    let receiverChangePassToken = receiverDetails.token;

    const mailOptions = {
        from: 'dummy4nodemailer@gmail.com', // sender address
        to: receiverEmailId, // list of receivers
        subject: 'Password Reset Url', // Subject line
        html: `<p>Reset Password Link.</p>
        <p>http://localhost:4200/changepassword/${receiverChangePassToken}</p>
        `// plain text body
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if(err){
            console.log("nodemailer error "+err);
            cb(err,null);
        }else{
            console.log("nodemailer success"+ info );
            cb(null,info);
        }
         
     });


}
// send mail end

// send contact 
let sendContactInfo = (senderDetails , cb) => {

    let transporter = nodemailer.createTransport({

        host : 'smtp.gmail.com',
        port: 465,
        auth : {
            user : "dummy4nodemailer@gmail.com",
            pass : 'dummy*444#'
        },
        tls:{
            rejectUnauthorized: false
        }
    });
    
    let senderEmailId = senderDetails.emailId;
    let senderMessage = senderDetails.message;

    const mailOptions = {
        from: 'dummy4nodemailer@gmail.com', // sender address
        to: 'uday.myplanet@gmail.com', // send contact inffo to uday chauhan
        subject: 'Contact Information', // Subject line
        html: `<p>Sender Email Id : ${senderEmailId} </p>
        <p>Sender Message : ${senderMessage}</p>
        `// plain text body
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if(err){
            console.log("nodemailer error "+err);
            cb(err,null);
        }else{
            console.log("nodemailer success"+ info );
            cb(null,info);
        }
         
     });


}
// send contact end

// send meetinginfo start
let sendMeetingInfo = (receiverDetails , cb) => {

    let transporter = nodemailer.createTransport({

        host : 'smtp.gmail.com',
        port: 465,
        auth : {
            user : "dummy4nodemailer@gmail.com",
            pass : 'dummy*444#'
        },
        tls:{
            rejectUnauthorized: false
        }
    });
    
    let receiverEmailId = receiverDetails.receiverEmail;
    let receiverSubject = receiverDetails.subject;
    let receiverMessage = receiverDetails.message;
    

    const mailOptions = {
        from: 'dummy4nodemailer@gmail.com', // sender address
        to: receiverEmailId, // list of receivers
        subject: receiverSubject, // Subject line
        html: `<p>${receiverMessage}</p>`// plain text body
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if(err){
            console.log("nodemailer error "+err);
            cb(err,null);
        }else{
            console.log("nodemailer success"+ info );
            cb(null,info);
        }
         
     });


}
// send meeting info end
module.exports = {
    sendMail : sendMail,
    sendContactInfo : sendContactInfo,
    sendMeetingInfo : sendMeetingInfo
}