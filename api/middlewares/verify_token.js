let jwt = require('jsonwebtoken');
const userServices = require('../services/user.service');
const { ApiResponse } = require('../../helper/response/Api_Response');
const { CONST } = require('../../constants/const');
const version = 1;


module.exports = {
    verifyToken: (req, res, next) => {
        try {

            let token = req.headers['x_access_token'];
            if (!token) {
                return ApiResponse(res, 401, "Xác thực thất bại", {}, version);
            }
            jwt.verify(token, CONST.JWT_SCRET, async (error, user) => {
                if (error) {
                    return ApiResponse(res, 401, "Xác thực thất bại", {}, version);
                } else {

                    let check = await userServices.getOneById(user.userId);
                    if (check) {
                        req.userId = user.userId;
                        return next();
                    } else {
                        return ApiResponse(res, 401, "Xác thực thất bại", {}, version);
                    }
                }
            });
        } catch (error) {
            return ApiResponse(res, 401, "Xác thực thất bại", {}, version);
        }
    }
}
