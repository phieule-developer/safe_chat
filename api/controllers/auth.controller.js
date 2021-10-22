const to = require('await-to-js').default;
const jwt = require('jsonwebtoken');
const authService = require('../services/auth.service');
const userService = require('../services/user.service');
const { CONST } = require('../../constants/const');
const bcrypt = require('bcrypt');
var generateSafeId = require('generate-safe-id');
const { ApiResponse } = require('../../helper/response/Api_Response');
const version = 1;


module.exports = {
    login: async (req, res) => {
        try {
            let { email, password } = req.body;
            let error, result;

            [error, result] = await to(authService.login(email, password));
            if (error) {
                return ApiResponse(res, 400, error, {}, version);
            }
            else {
                let payload = {
                    exp: Date.now() + 30000 * 60 * 1000,
                    userId: result._id
                };

                await userService.updateMe(result._id,{last_online:Date.now()})
                let access_token = await jwt.sign(payload, CONST.JWT_SCRET);

                return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, { access_token, id: result._id }, version);
            }
        } catch (error) {
            return ApiResponse(res, 400, CONST.MESSAGE.ERROR, {}, version);
        }

    },
    register: async (req, res) => {
        try {
            let { email, password, confirm_password } = req.body;

            let error, result;

            [error, result] = await to(authService.check_password(password, confirm_password));

            if (error) {
                return ApiResponse(res, 400, error, {}, version);
            } else {
                [error, result] = await to(authService.check_email(email));

                if (error) {
                    return ApiResponse(res, 400, error, {}, version);
                }
                else {

                    req.body.password = await bcrypt.hash(password, 10);

                    req.body.token_verify = generateSafeId();
                    let ans = await authService.register(req.body);

                    return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, ans, version);

                }
            }
        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }



    },
    change_password: (req, res) => {

    },
    check_session: async (req, res) => {
        try {
            const authHeaders = req.headers["x_access_token"];
            if (authHeaders) {
                const token = authHeaders;
                const decoded = await jwt.verify(token, CONST.JWT_SCRET);
                const user = await userService.getOneById(decoded.userId);
                if (!user) {
                    return ApiResponse(res, 401, "Không thể xác thực", false, version);
                } else {
                    if (decoded.exp >= Date.now()) {
                        return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, true, version)
                    } else {
                        return ApiResponse(res, 400, "Token đã hết hạn", false, version);
                    }
                }
            } else {
                return ApiResponse(res, 401, "Không thể xác thực", false, version)
            }
        } catch (error) {
            return ApiResponse(res, 500, "Không thể xác thực", false, version)
        }
    }
}