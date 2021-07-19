const to = require('await-to-js').default;
const { CONST } = require('../../constants/const');
const {ApiResponse} = require('../../helper/response/Api_Response');

let conservationService = require('../services/conversation.service');
const version = 1;
module.exports ={
    create:async (req,res)=>{
        try {

            let {list_user} = req.body;
            
            let members = [
                req.userId,
                ...list_user,
            ]
            req.body.members = members;
            let ans = await conservationService.create(req.body);

            return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS,ans, version);

        } catch (error) {
            
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);

        }
    },
    getAll: async (req,res)=>{
        try {
            let ans = await conservationService.getAll(req.userId);
            return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS,ans, version);

        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    },
    getOne: async (req,res)=>{
        try {
            let conversation_id = req.params.id;

            let ans = await conservationService.getOneById(conversation_id);

            return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS,ans, version);

        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    }
}