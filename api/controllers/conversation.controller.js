const to = require('await-to-js').default;
const { CONST } = require('../../constants/const');
const { ApiResponse } = require('../../helper/response/Api_Response');
let conservationService = require('../services/conversation.service');
let groupKeyService = require('../services/group_key.service');
let userService = require("../services/user.service");
const { DATABASE_NAME } = require('../../constants/database');
const { sendReportToUser } = require('../../helper/socketIO/index');
const { Types } = require('mongoose');

let objectID = require('mongodb').ObjectID

const version = 1;
module.exports = {
    create: async (req, res) => {
        try {

            let { user_list, key_list } = req.body;

            let member_list = req.body.user_list;

            user_list.push(req.userId);
            let hasDuplicate = user_list.some((val, i) => user_list.indexOf(val) !== i);

            if (hasDuplicate) {
                return ApiResponse(res, 400, "Nhóm đang có thành viên xuất hiện nhiều lần", {}, version);
            } else {

                if (Array.isArray(user_list) && user_list.length >= 3) {
                    user_list.sort();
                    req.body.members = user_list;
                    req.body.type = 1;
                    req.body.created_by = req.userId;
                    req.body.last_update = Date.now();

                    let conversation = await conservationService.create(req.body);

                    let user = await userService.getOneById(req.userId);

                    for (const key of key_list) {
                        key.conversation_id = conversation._id;
                        key.public_key_encrypter = user.public_key;
                    };

                    await groupKeyService.insertMany(key_list);

                    for (let i = 0; i < member_list.length; i++) {
                        let user_id = member_list[i];

                        let filter_key_encryption = [
                            {
                                $match: {
                                    user_id: Types.ObjectId(user_id),
                                    conversation_id: Types.ObjectId(conversation._id)
                                }
                            }
                        ];

                        let key_encryption = await groupKeyService.getFilter(filter_key_encryption);
                        key_encryption = key_encryption.length > 0 ? key_encryption[0] : {};

                        sendReportToUser(user_id, CONST.EVENT.CREATE_GROUP, { conversation, key_encryption }, version);
                    };

                    return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, conversation, version);
                } else {
                    return ApiResponse(res, 400, "Nhóm phải có từ 3 thành viên trở lên", {}, version);
                }
            }

        } catch (error) {
            console.log(error);
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    },
    getAll: async (req, res) => {
        try {
            let filter = [
                {
                    $match: {
                        members: { $in: [Types.ObjectId(req.userId)] },
                    }
                },
                {
                    $lookup: {
                        from: DATABASE_NAME.USER,
                        let: { "member": "$members" },
                        pipeline: [
                            {
                                $match: {
                                    $and: [
                                        {
                                            $expr: { $in: ["$_id", "$$member"] },
                                        },
                                        {
                                            _id: { $ne: Types.ObjectId(req.userId) }
                                        },
                                    ]
                                }
                            }
                        ],
                        "as": "member"
                    }
                },
                {
                    $lookup:
                    {
                        from: DATABASE_NAME.GROUP_KEY,
                        let: { conversation_id: "$_id" },
                        pipeline: [
                            {
                                $match:
                                {
                                    $expr:
                                    {
                                        $and:
                                            [
                                                { $eq: ["$conversation_id", "$$conversation_id"] },
                                                { $eq: ["$user_id", Types.ObjectId(req.userId)] }
                                            ]
                                    }
                                }
                            },
                        ],
                        as: "group_key"
                    }
                },
                {
                    $unwind: {
                        path: "$group_key",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $sort: {
                        last_update: -1
                    }
                },
                {
                    $project: {
                        "_id": 1,
                        "avatar": 1,
                        "name": 1,
                        "type": 1,
                        "type_last_message": 1,
                        "last_message": 1,
                        "last_update": 1,
                        "member": 1,
                        "created_at": 1,
                        "seen": 1,
                        "group_key_encryption": "$group_key.group_key_encryption",
                        "public_key_encrypter": "$group_key.public_key_encrypter",
                        "seen": {
                            $in: [Types.ObjectId(req.userId), "$is_seen"]
                        },
                    }

                },

            ];
            let result = await conservationService.getFilter(filter);

            return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, result, version);

        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    },
    getOne: async (req, res) => {
        try {
            let conversation_id = req.params.id;
            let filter = [
                {
                    $match: {
                        _id: Types.ObjectId(conversation_id),
                        members: { $in: [Types.ObjectId(req.userId)] }
                    }
                },
                {
                    $lookup: {
                        from: DATABASE_NAME.USER,
                        let: { "member": "$members" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $in: ["$_id", "$$member"] },
                                }
                            }
                        ],
                        "as": "member"
                    }
                },
                {
                    $project: {
                        "members": 0,
                    }

                },
            ]
            let ans = await conservationService.getFilter(filter);
            let result = ans.length > 0 ? ans[0] : null;
            return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, result, version);

        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    },
    update: async (req, res) => {
        try {
            let id = req.params.id;

            let body_update = {};
            if (req.body.avatar) {
                body_update.avatar = req.body.avatar;
            };
            if (req.body.name) {
                body_update.name = req.body.name;
            };

            let result = await conservationService.update(id, body_update);

            return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, result, version);

        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    },
    addMember: async (req, res) => {
        try {
            let id = req.params.id;

            let { members } = await conservationService.getOneById(id);

            let { new_member, key_list } = req.body;
            for (let i = 0; i < new_member.length; i++) {
                if (!objectID.isValid(new_member[i])) {
                    return ApiResponse(res, 400, "Định dạng không chính xác", {}, version);
                }
            }
            let hasDuplicateNewMember = new_member.some((val, i) => new_member.indexOf(val) !== i);

            if (hasDuplicateNewMember) {
                return ApiResponse(res, 400, CONST.MESSAGE.ERROR, "Một người đang được thêm vào 2 lần", version);

            }
            members = [
                ...new_member,
                ...members
            ];
            let hasDuplicate = members.some((val, i) => members.indexOf(val) !== i);

            if (hasDuplicate) {
                return ApiResponse(res, 400, CONST.MESSAGE.ERROR, "Lỗi dữ liệu", version);

            } else {

                let user = await userService.getOneById(req.userId);

                for (const key of key_list) {
                    key.public_key_encrypter = user.public_key;
                    key.conversation_id = id;
                };
                members.sort();
                await conservationService.update(id, { members });
                await groupKeyService.insertMany(key_list);
                return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, {}, version);
            }


        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    },
    updateSeen: async (req, res) => {
        try {
            let id = req.params.id;
            let { is_seen } = await conservationService.getOneById(id);
            if (!is_seen.includes(req.userId)) {
                is_seen.push(req.userId);
                let result = await conservationService.update(id, { is_seen });
                return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, result, version);
            } else {
                return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, {}, version);
            }
        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    },
    leaveConversation: async (req, res) => {
        try {
            let id = req.params.id;

            let { members } = await conservationService.getOneById(id);
            let new_members = members.filter(e => e != req.userId);
            await conservationService.update(id, { members: new_members });
            await groupKeyService.removeKey(id, req.userId);
            return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, {}, version);
        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    }
}