let mongoose = require('mongoose');
const { DATABASE_NAME } = require('../../constants/database');

let Schema = new mongoose.Schema({
    avatar: {
        type: String,
        default: ""
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
    status: {
        type: Number,
        default: 0
    },

});

mongoose.model(DATABASE_NAME.CONVERSATION, Schema)
module.exports = mongoose.model(DATABASE_NAME.CONVERSATION)