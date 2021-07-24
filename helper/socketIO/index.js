const jwt = require('jsonwebtoken');
const { CONST } = require('../../constants/const');

const socket = io => {
    client = {};

    io.on('connection', async socket => {
        try {

            let token = socket.handshake.query["x_access_token"];
            if (token) {
                const decoded = jwt.verify(token, CONST.JWT_SCRET.JWT_SECRET);
                const user = await userService.getOneById(decoded.id);
                if (user && decoded.exp >= Date.now()) {
                    if (Array.isArray(client[decoded.id])) {
                        client[decoded.id].push(socket.id);
                    } else {

                        client[decoded.id] = [];

                        client[decoded.id].push(socket.id);
                    }
                }
            }
            socket.on('disconnect', () => {
                if (token) {
                    const decoded = jwt.verify(token, CONST.JWT_SCRET.JWT_SECRET);
                    if (decoded && Array.isArray(client[decoded.id])) {
                        if (client[decoded.id].indexOf(socket.id) != -1) {
                            client[decoded.id] = client[decoded.id].filter(e => e !== socket.id)
                        }
                    }
                }
            });
        } catch (error) {
        }
    });

    const sendReportToUser = (user_id, event_name, data) => {
        try {
            if (client[user_id]) {
                for (let id of client[user_id]) {
                    io.to(id).emit(event_name, data)
                }
            }
        } catch (error) {
        }
    }


}

module.exports = {
    socket,
    //sendReportToUser
};