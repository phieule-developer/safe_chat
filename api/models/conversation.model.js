let mongoose = require('mongoose');
const { DATABASE_NAME } = require('../../constants/database');

let Schema = new mongoose.Schema({
    avatar: {
        type: String,
        default: "https://st4.depositphotos.com/4329009/19956/v/600/depositphotos_199564354-stock-illustration-creative-vector-illustration-default-avatar.jpg"
    },
    name: {
        type: String,
        default: ""
    },
    members: [
        {
            type: mongoose.Types.ObjectId,
            ref: DATABASE_NAME.USER,
            require: true
        }
    ],
    type: {
        type: Number,
        require: true,
        default: 0
    },
    last_message: {
        type: String,
        default: ""
    },
    type_last_message: {
        type: Number,
        default: 0
    },
    last_update: {
        type: Number,
        default: Date.now()
    },
    created_at: {
        type: Number,
        default: Date.now()
    },
    created_by: {
        type: mongoose.Types.ObjectId,
        ref: DATABASE_NAME.USER,
        require: true
    },
    is_seen: [
        {
            type: mongoose.Types.ObjectId,
            ref: DATABASE_NAME.USER,
            default: []
        }
    ],
    status: {
        type: Number,
        default: 0
    },

});

mongoose.model(DATABASE_NAME.CONVERSATION, Schema)
module.exports = mongoose.model(DATABASE_NAME.CONVERSATION)