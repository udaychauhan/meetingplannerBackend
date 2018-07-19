const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const time = require('../libs/timeLib');

let schemaDefinition = {
    userId : {
        type : String
    },
    authToken : {
        type : String
    },
    tokenSecret : {
        //the secret key
        type : String
    },
    tokenGenerationTime : {
        type : Date,
        default : time.now()
    }
}
const Auth = new Schema(schemaDefinition);

module.exports = mongoose.model('Auth',Auth);
