const { Types } = require('mongoose');
const { CONST } = require('../../constants/const');
const { ApiResponse } = require('../../helper/response/Api_Response');
const userService = require('../services/user.service');
const conversationService = require('../services/conversation.service');
const version = 1;

module.exports = {
    getMe: async (req, res) => {
        try {
            let ans = await userService.getOneById(req.userId);

            return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, ans, version);

        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    },
    updateMe: async (req, res) => {
        try {
            let body_update = {};
            if (req.body.avatar) {
                body_update.avatar = req.body.avatar;
            };
            if (req.body.dob) {
                body_update.dob = req.body.dob;
            };
            if (req.body.sex) {
                body_update.sex = req.body.sex;
            };
            if (req.body.fullname) {
                body_update.fullname = req.body.fullname;
            };

            if (req.body.phone) {
                body_update.phone = req.body.phone;
            };
            if (req.body.last_online) {
                body_update.last_online = req.body.last_online;
            };

            if(req.body.fcm_token){
                body_update.fcm_token = req.body.fcm_token;
            }
            let result = await userService.updateMe(req.userId, body_update);

            if (result) {
                result.password = "";
                result.token_verify = "";
            }
            return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, result, version);

        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    },
    getOne: async (req, res) => {
        try {
            let user_id = req.params.id;

            let ans = await userService.getOneById(user_id);

            return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, ans, version);

        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    },
    getOneByPublicKey: async (req, res) => {
        try {
            let public_key = req.params.public_key;

            let ans = await userService.getOneByPublicKey(public_key);

            return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, ans, version);

        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    },
    getAll: async (req, res) => {
        try {
            let text = req.query.text;

            let filter = [
                {
                    $addFields: {
                        name_lower: {
                            $toLower: "$fullname"
                        },
                    }
                },
                {
                    $match: {
                        _id: { $ne: Types.ObjectId(req.userId) },
                        $or: [
                            {
                                name_lower: {
                                    $regex: text ? text.toLowerCase() : ""
                                }
                            }
                        ]
                    }
                },
                {
                    $project: {
                        "password": 0,
                        "token_verify": 0,
                        "name_lower": 0,
                    }
                }
            ];
            let result = await userService.getAll(filter);
            return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, result, version);

        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    },
    getAllUser: async (req, res) => {
        try {
            let text = req.query.text;

            let filter = [
                {
                    $addFields: {
                        name_lower: {
                            $toLower: "$fullname"
                        },
                    }
                },
                {
                    $match: {
                        $or: [
                            {
                                name_lower: {
                                    $regex: text ? text.toLowerCase() : ""
                                }
                            }
                        ]
                    }
                },
                {
                    $sort:{
                        created_at:-1
                    }
                },
                {
                    $project: {
                        "password": 0,
                        "token_verify": 0,
                        "name_lower": 0,
                    }
                }
            ];
            let result = await userService.getAll(filter);
            return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, result, version);

        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    },
    searchUserAddConversation: async (req, res) => {
        try {
            let text = req.query.text;

            let {members} = await conversationService.getOneById(req.params.conversation_id);

            let filter = [
                {
                    $addFields: {
                        name_lower: {
                            $toLower: "$fullname"
                        },
                    }
                },
                {
                    $match: {
                        $and:[
                            {
                                _id: { $ne: Types.ObjectId(req.userId) },
                            },
                            {
                                _id:{$nin:members}
                            }
                        ],
                        $or: [
                            {
                                name_lower: {
                                    $regex: text ? text.toLowerCase() : ""
                                }
                            }
                        ]
                    }
                },
                {
                    $project: {
                        "password": 0,
                        "token_verify": 0,
                        "name_lower": 0,
                    }
                }
            ];
            let result = await userService.getAll(filter);

            return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, result, version);

        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    },
}