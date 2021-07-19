let mongoose = require('mongoose');
const { DATABASE_NAME } = require('../../constants/database');

let Schema = new mongoose.Schema({
    conversation_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: DATABASE_NAME.CONVERSATION,
        required: true,
    },
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: DATABASE_NAME.USER,
        required: true,
    },
    content:{
        type: String, 
        required: true,
        default:""
    },
    type: { type: Number,default: 0 },
    created_at: { 
        type: Number, 
        required: true,
        default: Date.now()
    },
    status: { type: Number,default: 0 },
    
});

mongoose.model(DATABASE_NAME.MESSAGE, Schema)
module.exports = mongoose.model(DATABASE_NAME.MESSAGE)