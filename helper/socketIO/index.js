const jwt = require('jsonwebtoken');
const { CONST } = require('../../constants/const');
const userService = require('../../api/services/user.service');
const socket = (io) => {
    io.on('connection', async socket => {
        try {
            let token = socket.handshake.query["x_access_token"];
            if (token) {
                const decoded = await jwt.verify(token, CONST.JWT_SCRET);
                const user = await userService.getOneById(decoded.userId);
                if (user && decoded.exp >= Date.now()) {
                    if (Array.isArray(client[decoded.userId])) {
                        client[decoded.userId].push(socket.id);
                    } else {
                        client[decoded.userId] = [];
                        client[decoded.userId].push(socket.id);
                    }
                }
            }
            socket.on('disconnect',async () => {
                if (token) {
                    const decoded = await jwt.verify(token, CONST.JWT_SCRET);
                    if (decoded && Array.isArray(client[decoded.userId])) {
                        if (client[decoded.userId].indexOf(socket.id) != -1) {
                            client[decoded.userId] = client[decoded.userId].filter(e => e !== socket.id)
                        }
                    }
                }
            });
        } catch (error) {
        }
    });
}
const sendReportToUser = (user_id, event_name, data) => {
    try {
        if (global.client["60f58052bb03ff11f9bafc62"]) {
            for (let id of client["60f58052bb03ff11f9bafc62"]) {
                global.io.to(id).emit(event_name, data)
            }
        }
    } catch (error) {
    }
}
module.exports = {
    socket,
    sendReportToUser
};