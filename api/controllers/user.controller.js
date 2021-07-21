const { CONST } = require('../../constants/const');
const { ApiResponse } = require('../../helper/response/Api_Response');
const userService = require('../services/user.service');
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
                body_update.avatar = req.body.avatar;
            };
            if (req.body.sex) {
                body_update.avatar = req.body.avatar;
            };
            if (req.body.fullname) {
                body_update.avatar = req.body.avatar;
            };

            await userService.updateMe(req.userId, body_update);

            return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, {}, version);

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
    getAll:async (req,res)=>{
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
                    $addFields: {
                        email_lower: {
                            $toLower: "$email"
                        },
                    }
                },
                {
                    $match:{
                        $or:[
                            {
                                name_lower: {
                                    $regex: text ? text.toLowerCase() : ""
                                }
                            },
                            {
                                email_lower: {
                                    $regex: text ? text.toLowerCase() : ""
                                }
                            },  
                        ]
                    }
                },
                {
                    $project:{
                        "password":0,
                        "token_verify":0,
                        "name_lower":0,
                        "email_lower":0
                    }
                }
            ];
        let result = await userService.getAll(filter);
        return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS,result, version);

        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    }
}