const to = require('await-to-js').default;
const jwt = require('jsonwebtoken');
const groupKeyService = require('../services/group_key.service');
const userService = require('../services/user.service');
const { CONST } = require('../../constants/const');
const { ApiResponse } = require('../../helper/response/Api_Response');
const version = 1;


module.exports = {
    
    create: async (req, res) => {
        try {

            let { conversation_id,key_list } = req.body;

            let user = await userService.getOneById(req.userId);

            for (const key of key_list) {
                key.conversation_id = conversation_id;
                key.public_key_encrypter = user.public_key;
            };

            await groupKeyService.insertMany(key_list);

            return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, {}, version);

        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    }
}