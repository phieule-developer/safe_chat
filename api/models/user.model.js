let mongoose = require('mongoose');
const { DATABASE_NAME } = require('../../constants/database');

let Schema = new mongoose.Schema({
    avatar: {
        type: String,
        default: ""
    },
    fullname: {
        type: String,
        default: ""
    },
    dob: {
        type: Number,
        default: 0
    },
    sex: {
        type: Number,
        default: 0,
        enum:[0,1]
    },
    email: { 
        type: String, 
        default: "" 
    },
    token_verify:{
        type: String, 
        default: ""
    },
    created_at: { 
        type: Number, 
        required: true,
        default: Date.now()
    },
    expired_at: { 
        type: Number, 
        required: true,
        default: 0 
    },
    last_online: { 
        type: Number, 
        required: true,
        default: Date.now()
    },
    password: { type: String,required: true,default: "" },
    status: { type: Number,default: 0 },
    
});

mongoose.model(DATABASE_NAME.USER, Schema)
module.exports = mongoose.model(DATABASE_NAME.USER)