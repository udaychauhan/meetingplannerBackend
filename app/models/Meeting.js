'use strict'
/**
 * Module Dependencies
 */
const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

let meetingSchema = new Schema(
    {
        meetingId: {
            type: String,
            default: '',
            index: true,
            unique: true
        },
        adminName: {
            type: String,
            default: 'default'
        },
        adminId: {
            type: String,
            default: 'default'
        },
        userId: {
            type: String,
            default: 'default'
        },
        username: {
            type: String,
            default: 'default'
        },
        where: {
            type: String,
            default: 'Location'
        },
        purpose: {
            type: String,
            default: 'Unknown'
        },
        date: {
            type: String,
            default: '16-07-2018'
        },
        time: {
            type: String,
            default: '23'
        }
    });

mongoose.model('Meeting',meetingSchema);