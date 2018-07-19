'use strict'
/**
 * Module Dependencies
 */
const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

let userSchema = new Schema({
  userId: {
    type: String,
    default: '',
    index: true,
    unique: true
  },
  firstName: {
    type: String,
    default: 'default'
  },
  lastName: {
    type: String,
    default: 'default'
  },
  password: {
    type: String,
    default: 'passskdajakdjkadsj'
  },
  emailId: {
    type: String,
    default: 'defaultemail@default.com'
  },
  countryCode : {
    type : String,
    default : "0"
  },
  phoneNumber: {
    type: String,
    default:"0"
  },
  admin:{
    type : String,
    default : "no"
  },
  createdOn :{
    type:Date,
    default:""
  }
})


mongoose.model('User', userSchema);