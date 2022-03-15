const { Types } = require('mongoose');
let groupKeyModel = require('../models/group_key.model');
module.exports = {
    insert: async (data)=>{
        return await groupKeyModel.create(data);
    },
    insertMany: async (data)=>{
        return await groupKeyModel.insertMany(data);
    },
    removeKey: async (conversation_id,user_id)=>{
       return await groupKeyModel.remove({
           conversation_id: Types.ObjectId(conversation_id),
           user_id: Types.ObjectId(user_id)
        });
    },
    getFilter: async (filter) => {
        let result = await conversationModel.aggregate(filter);
        return result;
    },
}