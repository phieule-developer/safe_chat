let mongoose = require('mongoose');
const { DATABASE_NAME } = require('../../constants/database');

let Schema = new mongoose.Schema({
    avatar: {
        type: String,
        default: "https://st4.depositphotos.com/4329009/19956/v/600/depositphotos_199564354-stock-illustration-creative-vector-illustration-default-avatar.jpg"
    },
    fullname: {
        require: true,
        type: String,
        default: ""
    },
    dob: {
        type: Number,
        default: 0
    },
    phone: {
        type: String,
        require:true,
        default: ""
    },
    sex: {
        type: Number,
        default: 1,
        enum: [0, 1]
    },
    email: {
        require: true,
        type: String,
        default: ""
    },
    token_verify: {
        type: String,
        default: ""
    },
    created_at: {
        type: Number,
        default: Date.now()
    },
    expired_at: {
        type: Number,
        default: 0
    },
    last_online: {
        type: Number,
        default: Date.now()
    },
    password: {
        type: String,
        required: true,
        default: ""
    },
    public_key: {
        type: String,
        require:true,
        default: ""
    },
    status: {
        type: Number,
        default: 0
    },

});

mongoose.model(DATABASE_NAME.USER, Schema)
module.exports = mongoose.model(DATABASE_NAME.USER)