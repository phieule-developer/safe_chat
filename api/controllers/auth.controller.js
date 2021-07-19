const to = require('await-to-js').default;
const jwt = require('jsonwebtoken');
const authService = require('../services/auth.service');
const { CONST } = require('../../constants/const');
const bcrypt = require('bcrypt');

const {ApiResponse} = require('../../helper/response/Api_Response');
const version = 1;
module.exports = {
    login:async (req, res) => {
        try {
            let { email, password } = req.body;
            let error, result;

            [error, result] = await to(authService.login(email, password));
            if (error) {
                return ApiResponse(res, 400, error, {}, version);
            }
            else {
                let payload = {
                    exp: Date.now() + 30 * 600 * 1000,
                    userId: result._id
                };

                let access_token = await jwt.sign(payload, CONST.JWT_SCRET);

                return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, { access_token }, version);
            }
        } catch (error) {
            return ApiResponse(res, 400, CONST.MESSAGE.ERROR, {}, version);
        }

    },
    register:async (req, res) => {
        try {
            let { email, password, confirm_password, fullname, sex, dob } = req.body;

            let error,result;
            
            [error, result] = await to(authService.check_password(password, confirm_password));

            if (error) {
                return ApiResponse(res, 400, error, {}, version);
            } else {
                [error, result] = await to(authService.check_email(email));

                if (error) {
                    return ApiResponse(res, 400, error, {}, version);
                }
                else {

                    req.body.password =await bcrypt.hash(password,10);

                    let ans = await authService.register(req.body);

                    return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, ans, version);

                }
            }
        } catch (error) {
            console.log(error);
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }



    },
    change_password: (req, res) => {

    }
}