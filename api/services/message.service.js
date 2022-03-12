const { Types } = require('mongoose');
const { DATABASE_NAME } = require('../../constants/database');
let messageModel = require('../models/message.model');
module.exports = {
    create: async body => {
        let message = await messageModel.create(body);
        return message;
    },
    getAllConversation: async (conversation_id, page_index = 1, page_size = 10) => {
        let result = await messageModel.aggregate([
            {
                $match:
                {
                    conversation_id: Types.ObjectId(conversation_id)
                }
            },
            {
                $sort: {
                    created_at: -1
                }
            },
            {
                $lookup: {
                    from: DATABASE_NAME.USER,
                    localField: "sender_id",
                    foreignField: "_id",
                    as: "sender"
                }
            },
            {
                $unwind: "$sender"
            },
            {
                $skip: page_size * (page_index - 1)
            },
            {
                $limit: page_size
            },
            {
                $project: {
                    "sender.token_verify": 0,
                    "sender.password": 0
                }
            }


        ]);
        let total = await messageModel.aggregate(
            [
                {
                    $match:
                    {
                        conversation_id: Types.ObjectId(conversation_id)
                    }
                }
            ]).count("total");

        let count = total.length == 0 ? 0 : total[0].total;

        return {
            result,
            page_index,
            page_size,
            count
        };
    }
}