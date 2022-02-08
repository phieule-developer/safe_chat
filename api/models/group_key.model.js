let mongoose = require('mongoose');
const { DATABASE_NAME } = require('../../constants/database');

let Schema = new mongoose.Schema({
   
    conversation_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: DATABASE_NAME.CONVERSATION,
        required: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: DATABASE_NAME.USER,
        required: true,
    },
    public_key_encrypter: {
        type: String,
        require: true,
        default: ""
    },
    group_key_encryption: {
        type: String,
        require: true,
        default: ""
    }
});

mongoose.model(DATABASE_NAME.GROUP_KEY, Schema)
module.exports = mongoose.model(DATABASE_NAME.GROUP_KEY)