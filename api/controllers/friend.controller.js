const { Types } = require('mongoose');
const { CONST } = require('../../constants/const');
const { ApiResponse } = require('../../helper/response/Api_Response');
const userService = require('../services/user.service');
const friendService = require('../services/friend.service');
const { DATABASE_NAME } = require('../../constants/database');
const conversationService = require('../services/conversation.service');
const version = 1;

module.exports = {
    create: async (req, res) => {
        try {

            let friend_id = req.params.id;

            let friend_list = [];

            friend_list.push(req.userId);
            friend_list.push(friend_id);

            friend_list.sort();

            let friend = await friendService.getOne({ friends: friend_list });

            if (friend) {
                return ApiResponse(res, 400, "Đã tồn tại", {}, version);
            } else {
                let body = {
                    friends: friend_list,
                    created_by: req.userId
                };
                await friendService.create(body);
                return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, {}, version);
            }

        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    },
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
                    $unwind: "$friend"
                },
                {
                    $match: {
                        status: 1
                    }
                },
                {
                    $project: {
                        "friend_id": "$friend._id",
                        "fullname": "$friend.fullname",
                        "public_key": "$friend.public_key",
                        "avatar": "$friend.avatar",
                        "created_at": 1,
                        "id": req.userId,
                        "created_by": "$created_by",
                        "status": 1
                    }

                },

            ];
            let ans = await friendService.getFilter(filter);

            return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, ans, version);

        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    },
    getAllPendingFriendRequest: async (req, res) => {
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
                    $unwind: "$friend"
                },
                {
                    $match: {
                        created_by: Types.ObjectId(req.userId),
                        status: 0
                    }
                },
                {
                    $project: {
                        "friend_id": "$friend._id",
                        "fullname": "$friend.fullname",
                        "public_key": "$friend.public_key",
                        "avatar": "$friend.avatar",
                        "created_at": 1,
                        "id": req.userId,
                        "created_by": "$created_by",
                        "status": 1
                    }

                },

            ];
            let ans = await friendService.getFilter(filter);

            return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, ans, version);

        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    },
    getAllFriendRequest: async (req, res) => {
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
                    $unwind: "$friend"
                },
                {
                    $match: {
                        created_by: { $ne: Types.ObjectId(req.userId) },
                        status: 0
                    }
                },
                {
                    $project: {
                        "friend_id": "$friend._id",
                        "fullname": "$friend.fullname",
                        "public_key": "$friend.public_key",
                        "avatar": "$friend.avatar",
                        "created_at": 1,
                        "id": req.userId,
                        "created_by": "$created_by",
                        "status": 1
                    }

                },

            ];
            let ans = await friendService.getFilter(filter);

            return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, ans, version);

        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    },
    getOne: async (req, res) => {
        try {
            let friend_id = req.params.id;

            let friend_list = [];

            friend_list.push(req.userId);
            friend_list.push(friend_id);

            friend_list.sort();

            let friend = await friendService.getOne({ friends: friend_list });

            let relation_ship = false;
            let label = "";
            if (friend && friend.status == 1) {
                relation_ship = true;
            } else {
                relation_ship = false;
            };
            if (friend) {
                if (friend.status == 1) {
                    label = "Bạn bè"
                } else if (friend.status == 0 && friend.created_by.toString() == req.userId.toString()) {
                    label = "Chờ xác nhận";
                } else {
                    label = "Xác nhận";
                }
            } else {
                label = "Kết bạn";
            }
            return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, { relation_ship, label }, version);

        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    },
    update: async (req, res) => {
        try {
            let friend_id = req.params.user_id;
            let friend_list = [];

            friend_list.push(req.userId);
            friend_list.push(friend_id);

            friend_list.sort();
            await friendService.update({ friends: friend_list }, { status: 1 });

            return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, {}, version);

        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    },
    remove: async (req, res) => {
        try {

            let friend_id = req.params.user_id;

            let friend_list = [];

            friend_list.push(req.userId);
            friend_list.push(friend_id);

            friend_list.sort();

            await friendService.remove({ friends: friend_list });

            return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, {}, version);

        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    },
}