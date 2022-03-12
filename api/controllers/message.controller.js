const to = require("await-to-js").default;
const { CONST } = require("../../constants/const");
const { ApiResponse } = require('../../helper/response/Api_Response');
const conversationService = require('../services/conversation.service');
const messsageService = require('../services/message.service');
const userService = require('../services/user.service');
const { sendReportToUser } = require('../../helper/socketIO/index');
const version = 1;
var FCM = require('fcm-node');
var serverkey = 'AAAAo37-Edo:APA91bGFvQSsGnTn7oyd5YnzKhaxkinVCJWMFGCGfTLO9ZZmZ3zTDmZ646Jj5R0hnIGl-FL7kc-jVBaZJAoiAIupgRGYXUhM-rn-Z6mJkXVKNX6eghqC1ny43ktvDtEk_77X-l-Tt_Qy';

module.exports = {
    sendMessage: async (req, res) => {
        try {
            let { content } = req.body;
            let { receiver_id } = req.params;
            let error, conversation_id;

            let user = await userService.getOneById(req.userId);

            var fcm = new FCM(serverkey);

            let type_message = Number(req.body.type) ? Number(req.body.type) : 0;
            [error, conversation_id] = await to(conversationService.checkExistsConservationID(receiver_id));

            if (error) {
                [error, conversation_id] = await to(conversationService.checkExistsConservationMember(req.userId, receiver_id));

                if (error) {
                    req.body.members = [
                        req.userId,
                        receiver_id
                    ];
                    req.body.last_message = content;
                    req.body.type = 0;
                    req.body.created_at = Date.now();
                    req.body.last_update = Date.now();
                    req.body.type_last_message = type_message;
                    req.body.is_seen = [req.userId];
                    let conversation = await conversationService.create(req.body);

                    let body = {
                        conversation_id: conversation._id,
                        created_at: conversation.last_update,
                        sender_id: req.userId,
                        type: type_message,
                        content,
                    };

                    let receiver = await userService.getOneById(receiver_id);

                    let message = await messsageService.create(body);

                    var notification = {
                        to: receiver.fcm_token,
                        notification: {
                            title: user.fullname,
                            body: content,
                        },
                        data: {
                            public_key: user.public_key,
                            type: 0,
                            id: receiver_id
                        }
                    };

                    fcm.send(notification, function (err, response) {
                    });

                    sendReportToUser(receiver_id, CONST.EVENT.PERSON_MESSAGE, { message, fullname: user.fullname, avatar: user.avatar, public_key: user.public_key }) // gửi tới thành viên

                    return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, {}, version);
                }
                else {
                    let body = {
                        conversation_id,
                        sender_id: req.userId,
                        type: type_message,
                        created_at: Date.now(),
                        content,
                    };
                    let body_update = {
                        last_update: body.created_at,
                        last_message: body.content,
                        type_last_message: type_message,
                        is_seen: [req.userId]
                    };
                    let message = await messsageService.create(body);
                    let receiver = await userService.getOneById(receiver_id);
                    var notification = {
                        to: receiver.fcm_token,
                        notification: {
                            title: user.fullname,
                            body: content
                        },
                        data: {
                            public_key: user.public_key,
                            type: 0,
                            id: receiver_id

                        }
                    };

                    fcm.send(notification, function (err, response) {
                    });
                    await conversationService.update(conversation_id, body_update);

                    sendReportToUser(receiver_id, CONST.EVENT.PERSON_MESSAGE, { message });
                    return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, {}, version);
                }
            } else {
                let body = {
                    conversation_id,
                    sender_id: req.userId,
                    type: type_message,
                    created_at: Date.now(),
                    content,
                };
                let body_update = {
                    last_update: body.created_at,
                    type_last_message: type_message,
                    last_message: body.content
                }
                let message = await messsageService.create(body);
                await conversationService.update(conversation_id, body_update);

                let registration_ids_array = [];
                let conversation = await conversationService.getOneById(receiver_id);
                for (let i = 0; i < conversation.members.length; i++) {
                    let receiver_id = conversation.members[i];
                    if (receiver_id != req.userId) {

                        let receiver = await userService.getOneById(receiver_id);
                        registration_ids_array.push(receiver.fcm_token);
                        sendReportToUser(receiver_id, CONST.EVENT.PERSON_MESSAGE, { message });
                    }
                }
                var notification = {
                    registration_ids: registration_ids_array,
                    notification: {
                        title: `${user.fullname} gửi tới ${conversation.name} `,
                        body: content
                    },
                    data: {
                        public_key: user.public_key,
                        type: 1,
                        id: receiver_id
                    }
                };

                fcm.send(notification, function (err, response) {
                });
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

            let error, conversation_id, result;

            [error, conversation_id] = await to(conversationService.checkExistsConservationID(receiver_id));

            if (error) {
                [error, conversation_id] = await to(conversationService.checkExistsConservationMember(req.userId, receiver_id));
                if (error) {
                    return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, [], version);
                } else {
                    let { is_seen } = await conversationService.getOneById(conversation_id);
                    if (!is_seen.includes(req.userId)) {
                        is_seen.push(req.userId);
                        await conversationService.update(conversation_id, { is_seen });
                    }
                    let ans = await messsageService.getAllConversation(conversation_id, page_index, page_size);
                    return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, ans, version);
                }
            } else {
                [error, result] = await to(conversationService.checkUserIDConversation(conversation_id, req.userId));
                if (result) {
                    let { is_seen } = await conversationService.getOneById(conversation_id);
                    if (!is_seen.includes(req.userId)) {
                        is_seen.push(req.userId);
                        await conversationService.update(conversation_id, { is_seen });
                    }
                    let ans = await messsageService.getAllConversation(conversation_id, page_index, page_size);
                    return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, ans, version);
                } else {
                    return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, [], version);
                }

            }
        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    }
}