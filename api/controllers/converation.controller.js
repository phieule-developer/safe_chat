const to = require('await-to-js').default;
const { CONST } = require('../../constants/const');
const { ApiResponse } = require('../../helper/response/Api_Response');
let conservationService = require('../services/conversation.service');
const { DATABASE_NAME } = require('../../constants/database');
const { Types } = require('mongoose');
let objectID = require('mongodb').ObjectID

const version = 1;
module.exports = {
    create: async (req, res) => {
        try {

            let { user_list } = req.body;
            user_list.push(req.userId);
            let hasDuplicate = user_list.some((val, i) => user_list.indexOf(val) !== i);

            if (hasDuplicate) {
                return ApiResponse(res, 400, "Nhóm đang có thành viên xuất hiện nhiều lần", {}, version);
            } else {
                let error, result;

                [error, result] = await to(conservationService.checkExistsConservationGroup(user_list));

                if (error) {
                    if (Array.isArray(user_list) && user_list.length >= 3) {

                        req.body.members = user_list;
                        req.body.type = 1;
                        req.body.created_by = req.userId;
                        req.body.last_update = Date.now();

                        let ans = await conservationService.create(req.body);
                        return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, ans, version);
                    } else {
                        return ApiResponse(res, 400, "Nhóm phải có từ 3 thành viên trở lên", {}, version);
                    }
                } else {
                    return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, result, version);
                }
            }

        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    },
    getAll: async (req, res) => {
        try {
            let filter = [
                {
                    $match: { members: { $in: [Types.ObjectId(req.userId)] } }
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
                    $sort: {
                        last_update: -1
                    }
                },
                {
                    $project: {
                        "members": 0,
                    }

                },

            ];
            let ans = await conservationService.getFilter(filter);

            return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, ans, version);

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
            let result = ans.length > 0 ? ans[0] : {};
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

            if (objectID.isValid(req.body.user_id)) {
                members.push(req.body.user_id);
                members.sort();
                let result = await conservationService.update(id, { members });

                return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, result, version);
            } else {
                return ApiResponse(res, 400, "Định dạng không chính xác", {}, version);
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
            let result = await conservationService.update(id, { members: new_members });
            return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, result, version);
        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    }
}