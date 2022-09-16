let userModel = require('../models/user.model');
let conversationModel = require('../models/conversation.model');

module.exports = {
    getFilters: async (filter) => {


        let amount_list = await userModel.aggregate(filter);

        let amount = amount_list.length > 0 ? amount_list[0].amount : 0;

        return amount;
    },
    getConversationFilters: async (filter) => {


        let amount_list = await conversationModel.aggregate(filter);

        let amount = amount_list.length > 0 ? amount_list[0].amount : 0;

        return amount;
    }
}