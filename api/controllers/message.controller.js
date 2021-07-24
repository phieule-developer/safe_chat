const to = require("await-to-js").default;
const {CONST} = require("../../constants/const");
const {ApiResponse} = require('../../helper/response/Api_Response');
const conversationService = require('../services/conversation.service');
const messsageService = require('../services/message.service');
const {sendReportToUser} = require('../../helper/socketIO/index');
const version = 1;

module.exports = {
    sendMessage:async (req, res) => {
        try {
            let {type,content} = req.body;
            let {receiver_id} = req.params;
            let error, result;
            if (type == CONST.TYPE.GROUP) {
                // Tin nhắn nhóm
            } else {
                [error, result] = await to(conversationService.checkExistsConservation(req.userId, receiver_id));

                if (error) {
                    req.body.members = [req.userId, receiver_id];
                    let conversation = await conversationService.create(req.body);
                    let _message = {
                        conversation_id: conversation._id,
                        created_at:conversation.last_update,
                        sender_id: req.userId,
                        type: 0,
                        content,
                    };
                    let ans = await messsageService.create(_message);
                    return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS,ans, version);
 
                } else {
                    let _message ={
                        conversation_id: result,
                        sender_id: req.userId,
                        type: 0,
                        created_at:Date.now(),
                        content,
                    };
                    await Promise.all([
                        conversationService.update(result,{last_update:_message.created_at}),
                        messsageService.create(_message)
                    ]);
                    //sendReportToUser(receiver_id,CONST.EVENT.PERSON_MESSAGE,{content})
                    return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS,{}, version);
                }
            }
        } catch (error) {
            console.log(error);
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR,{},version);
        }
    },
    getAllMessage: async (req,res)=>{
        try {
            let page_index = Number(req.query.page_index) ? Number(req.query.page_index) : 1;
            let page_size = Number(req.query.page_size) ? Number(req.query.page_size) : 10;
            let receiver_id = req.params.id;

            let error,conversation_id;

            [error,conversation_id] = await to(conversationService.checkExistsConservation(req.userId,receiver_id));

            if(error) {
                return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS,[],version);
            }
            else{
                let ans = await messsageService.getAllConversation(conversation_id,page_index,page_size);

                return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS,ans,version);
            }
        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR,{},version);
        }
    }
}