let mongoose = require('mongoose');
const { DATABASE_NAME } = require('../../constants/database');

let Schema = new mongoose.Schema({
    friends: [
        {
            type: mongoose.Types.ObjectId,
            ref: DATABASE_NAME.USER,
            require: true
        }
    ],
    created_at: {
        type: Number,
        default: Date.now()
    },
    status: {
        type: Number,
        default: 0
    },

});

mongoose.model(DATABASE_NAME.FRIEND, Schema)
module.exports = mongoose.model(DATABASE_NAME.FRIEND)