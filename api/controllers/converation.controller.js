const to = require('await-to-js').default;
const { CONST } = require('../../constants/const');
const { ApiResponse } = require('../../helper/response/Api_Response');
let conservationService = require('../services/conversation.service');
const { DATABASE_NAME } = require('../../constants/database');
const {Types} = require('mongoose')
const version = 1;
module.exports = {
    create: async (req, res) => {
        try {

            let { list_user } = req.body;

            req.body.members = list_user;

            let ans = await conservationService.create(req.body);

            return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, ans, version);

        } catch (error) {

            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);

        }
    },
    getAll: async (req, res) => {
        try {
            let filter = [
                {
                    $lookup: {
                        from: DATABASE_NAME.USER,
                        let: { "member": "$members" },
                        pipeline: [
                            { 
                                $match: { 
                                    $and:[
                                        {
                                            $expr: { $in: ["$_id", "$$member"] },
                                        },
                                        {
                                            _id:{$ne:Types.ObjectId(req.userId)}
                                        }
                                ]
                            }
                        }
                        ],
                        "as": "member"
                    }
                },
                {
                    $lookup: {
                        from: DATABASE_NAME.MESSAGE,
                        localField: '_id',
                        foreignField: 'conversation_id',
                        as: 'message',
                    }
                },
                { 
                    $addFields: { lastMessage: { $last: "$message" } } },
                {
                    $sort:{
                        last_update:-1
                    }
                },
                {
                    $project:{
                        "members":0,
                        "message":0
                    }
                
                },
                
            ];
            let ans = await conservationService.getAll(filter);

            return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, ans, version);

        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    },
    getOne: async (req, res) => {
        try {
            let conversation_id = req.params.id;

            let ans = await conservationService.getOneById(conversation_id);

            return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, ans, version);

        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    }
}