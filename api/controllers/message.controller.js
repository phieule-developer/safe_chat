const to = require("await-to-js").default;
const { CONST } = require("../../constants/const");
const { ApiResponse } = require('../../helper/response/Api_Response');
const conversationService = require('../services/conversation.service');
const messsageService = require('../services/message.service');
const { sendReportToUser } = require('../../helper/socketIO/index');
const version = 1;

module.exports = {
    sendMessage: async (req, res) => {
        try {
            let { content } = req.body;
            let { receiver_id } = req.params;
            let error, conversation_id;

            [error, conversation_id] = await to(conversationService.checkExistsConservationID(receiver_id));

            if (error) {
                [error, conversation_id] = await to(conversationService.checkExistsConservationMember(req.userId, receiver_id));

                if (error) {
                    req.body.members = [
                        req.userId,
                        receiver_id
                    ];
                    req.body.last_message = content;
                    req.body.created_at = Date.now();
                    req.body.last_update = Date.now();
                    let conversation = await conversationService.create(req.body);

                    let body = {
                        conversation_id: conversation._id,
                        created_at: conversation.last_update,
                        sender_id: req.userId,
                        type: 0,
                        content,
                    };
                    await messsageService.create(body);
                    sendReportToUser(receiver_id, CONST.EVENT.PERSON_MESSAGE, { message: body }) // gửi tới thành viên
                    return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, {}, version);
                }
                else {
                    let body = {
                        conversation_id,
                        sender_id: req.userId,
                        type: 0,
                        created_at: Date.now(),
                        content,
                    };
                    let body_update = {
                        last_update: body.created_at,
                        last_message: body.content
                    }
                    await Promise.all([
                        conversationService.update(conversation_id, body_update),
                        messsageService.create(body)
                    ]);
                    sendReportToUser(receiver_id, CONST.EVENT.PERSON_MESSAGE, { message: body }) // gửi tới thành viên
                    return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, {}, version);
                }
            } else {
                let body = {
                    conversation_id,
                    sender_id: req.userId,
                    type: 0,
                    created_at: Date.now(),
                    content,
                };
                let body_update = {
                    last_update: body.created_at,
                    last_message: body.content
                }
                await Promise.all([
                    conversationService.update(conversation_id, body_update),
                    messsageService.create(body)
                ]);
                let conversation = await conversationService.getOneById(receiver_id);
                for (let i = 0; i < conversation.members.length; i++) {
                    let receiver_id = conversation.members[i];
                    if (receiver_id != req.userId) {
                        sendReportToUser(receiver_id, CONST.EVENT.PERSON_MESSAGE, { message: body }) // gửi tới tất cả thành viên
                    }
                }
                return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, {}, version);
            }
        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    },
    getAllMessage: async (req, res) => {
        try {
            let page_index = Number(req.query.page_index) ? Number(req.query.page_index) : 1;
            let page_size = Number(req.query.page_size) ? Number(req.query.page_size) : 10;

            let receiver_id = req.params.id;

            let error, conversation_id;

            [error, conversation_id] = await to(conversationService.checkExistsConservationID(receiver_id));

            if (error) {
                [error, conversation_id] = await to(conversationService.checkExistsConservationMember(req.userId, receiver_id));

                if (error) {
                    return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, [], version);
                } else {
                    let ans = await messsageService.getAllConversation(conversation_id, page_index, page_size);
                    return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, ans, version);
                }
            } else {
                let ans = await messsageService.getAllConversation(conversation_id, page_index, page_size);
                return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, ans, version);
            }
        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    }
}