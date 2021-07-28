const to = require('await-to-js').default;
const { CONST } = require('../../constants/const');
const { ApiResponse } = require('../../helper/response/Api_Response');
let conservationService = require('../services/conversation.service');
const { DATABASE_NAME } = require('../../constants/database');
const { Types } = require('mongoose')
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
            let ans = await conservationService.getAll(filter);

            return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, ans, version);

        } catch (error) {
            console.log(error);
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