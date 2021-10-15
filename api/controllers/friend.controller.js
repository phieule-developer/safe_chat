const { Types } = require('mongoose');
const { CONST } = require('../../constants/const');
const { ApiResponse } = require('../../helper/response/Api_Response');
const userService = require('../services/user.service');
const conversationService = require('../services/conversation.service');
const version = 1;

module.exports = {
    getAll: async (req, res) => {
        try {
        
            let filter = [
                {
                    $match: {
                        friends: { $in: [Types.ObjectId(req.userId)] },
                    }
                },
                {
                    $lookup: {
                        from: DATABASE_NAME.USER,
                        let: { "friend": "$friends" },
                        pipeline: [
                            {
                                $match: {
                                    $and: [
                                        {
                                            $expr: { $in: ["$_id", "$$friend"] },
                                        },
                                        {
                                            _id: { $ne: Types.ObjectId(req.userId) }
                                        },
                                    ]
                                }
                            }
                        ],
                        "as": "friend"
                    }
                },
                {
                    $project: {
                        "friend": 1,
                        "created_at": 1,
                    }

                },

            ];
            let ans = await conservationService.getFilter(filter);

            return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, ans, version);

        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    },
}